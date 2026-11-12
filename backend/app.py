"""
EmotiLearn - Flask API Backend
==============================
Real-time emotion detection using OpenCV + CNN (FER2013-trained model)
Endpoints consumed by the React frontend via fetch()

Tech Stack:
  - Flask + Flask-CORS  (REST API)
  - OpenCV              (face detection & preprocessing)
  - TensorFlow / Keras  (CNN inference)
  - NumPy               (array ops)
  - JWT                 (auth tokens)
  - MongoDB / PyMongo   (session & analytics storage)
"""

import os, io, base64, time, json, secrets
from dotenv import load_dotenv

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE_DIR, ".env"))  # Load backend/.env explicitly
from datetime import datetime, timezone, timedelta

import cv2
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS

import tensorflow as tf
from tensorflow.keras.models import load_model   # type: ignore

import jwt
from functools import wraps
from werkzeug.security import generate_password_hash, check_password_hash

# Optional: MongoDB for analytics persistence
try:
    from pymongo import MongoClient
    mongo = MongoClient(os.getenv("MONGO_URI", "mongodb://localhost:27017"), serverSelectionTimeoutMS=2000)
    db = mongo["emotilearn"]
    try:
        db.emotion_logs.create_index([("user", 1), ("timestamp", -1)])
    except Exception:
        pass
    USE_MONGO = True
except Exception as e:
    print(f"[EmotiLearn] ⚠️  MongoDB unavailable: {e}")
    USE_MONGO = False

# ─────────────────────────────────────────────
#  APP SETUP
# ─────────────────────────────────────────────
app = Flask(__name__)

# Security: Restrict CORS origins via environment variable
FLASK_ENV = os.getenv("FLASK_ENV", "development").lower()
raw_origins = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000"
)
ALLOWED_ORIGINS = [orig.strip() for orig in raw_origins.split(",") if orig.strip()]
CORS(app, resources={r"/api/*": {"origins": ALLOWED_ORIGINS}})

# Security: Strict JWT Secret management
SECRET_KEY = os.getenv("JWT_SECRET")
if not SECRET_KEY:
    if FLASK_ENV == "production":
        raise RuntimeError(
            "CRITICAL SECURITY CONFIGURATION ERROR: JWT_SECRET environment variable must be set in production mode!"
        )
    # Development fallback: generate random ephemeral secret
    SECRET_KEY = secrets.token_hex(32)
    print(
        "[EmotiLearn] ⚠️  WARNING: JWT_SECRET not set in environment. "
        "Generated random ephemeral key for this session."
    )

ADMIN_REGISTRATION_KEY = os.getenv("ADMIN_REGISTRATION_KEY", "")
_model_cfg = os.getenv("MODEL_PATH", "models/emotion_cnn_fer2013.h5")
MODEL_PATH = _model_cfg if os.path.isabs(_model_cfg) else os.path.join(BASE_DIR, _model_cfg)
CASCADE_PATH = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"

# Security: Apply HTTP response hardening headers
@app.after_request
def apply_security_headers(response):
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Content-Security-Policy"] = "default-src 'self'"
    if FLASK_ENV == "production":
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response

# Simplified 7-class → our 5 adaptive classes mapping
EMOTION_MAP  = {
    "angry":     "frustrated",
    "disgust":   "frustrated",
    "fear":      "confused",
    "happy":     "happy",
    "sad":       "bored",
    "surprised": "confused",
    "neutral":   "focused",
    "focused":   "focused",
    "confused":  "confused",
    "bored":     "bored",
}

# ─────────────────────────────────────────────
#  LOAD MODELS
# ─────────────────────────────────────────────
face_cascade = cv2.CascadeClassifier(CASCADE_PATH)

try:
    emotion_model = load_model(MODEL_PATH, compile=False)
    print(f"[EmotiLearn] ✅ CNN model loaded from {MODEL_PATH}")
except Exception as e:
    print(f"[EmotiLearn] ⚠️  Could not load model: {e}")
    print("[EmotiLearn]    Using fallback probabilistic detector.")
    emotion_model = None


# ─────────────────────────────────────────────
#  HELPERS
# ─────────────────────────────────────────────
def decode_base64_image(b64_str: str) -> np.ndarray:
    """Decode a base64 JPEG/PNG string → OpenCV BGR array. Returns None if invalid."""
    try:
        if "," in b64_str:
            b64_str = b64_str.split(",", 1)[1]
        img_bytes = base64.b64decode(b64_str)
        nparr = np.frombuffer(img_bytes, np.uint8)
        return cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    except Exception:
        return None


def detect_faces(bgr_frame: np.ndarray):
    """Return list of (x, y, w, h) bounding boxes."""
    if face_cascade.empty():
        return []
    gray = cv2.cvtColor(bgr_frame, cv2.COLOR_BGR2GRAY)
    # Fast path: 2x downscale with minNeighbors=4
    small = cv2.resize(gray, (0, 0), fx=0.5, fy=0.5)
    faces = face_cascade.detectMultiScale(
        small, scaleFactor=1.1, minNeighbors=4, minSize=(20, 20)
    )
    if len(faces) > 0:
        return [[int(x * 2), int(y * 2), int(w * 2), int(h * 2)] for (x, y, w, h) in faces]

    # High-recall fallback: full resolution with minNeighbors=3
    faces = face_cascade.detectMultiScale(
        gray, scaleFactor=1.1, minNeighbors=3, minSize=(30, 30)
    )
    if len(faces) > 0:
        return [[int(x), int(y), int(w), int(h)] for (x, y, w, h) in faces]
    return []


def preprocess_face(bgr_frame: np.ndarray, x, y, w, h) -> np.ndarray:
    """
    Safely crop face ROI within image boundaries, convert to grayscale,
    resize to 48×48, normalise to [0,1], expand dims → (1,48,48,1).
    This matches the FER2013 input spec exactly.
    """
    h_img, w_img = bgr_frame.shape[:2]
    x1 = max(0, min(int(x), w_img - 1))
    y1 = max(0, min(int(y), h_img - 1))
    x2 = max(x1 + 1, min(int(x + w), w_img))
    y2 = max(y1 + 1, min(int(y + h), h_img))

    roi = bgr_frame[y1:y2, x1:x2]
    if roi.size == 0:
        roi = np.zeros((48, 48, 3), dtype=np.uint8)

    gray_roi = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY)
    resized  = cv2.resize(gray_roi, (48, 48))
    normed   = resized.astype("float32") / 255.0
    return np.expand_dims(np.expand_dims(normed, -1), 0)   # (1,48,48,1)


def cnn_predict(face_tensor: np.ndarray) -> dict:
    """
    Run CNN inference → return probabilities dict keyed by emotion label.
    Falls back to heuristic if model not loaded.
    """
    if emotion_model is not None:
        raw_probs = emotion_model(face_tensor, training=False).numpy()[0]
        # Model was trained on 7-class FER2013; pad if needed
        labels = ["angry","disgust","fear","happy","sad","surprised","neutral"][:len(raw_probs)]
        probs  = {lbl: float(p) for lbl, p in zip(labels, raw_probs)}
    else:
        # Fallback: brightness/variance heuristics (demo only)
        face_arr = face_tensor[0, :, :, 0]
        brightness = float(face_arr.mean())
        variance   = float(face_arr.std())
        probs = {
            "happy":     min(1.0, brightness * 1.2),
            "neutral":   max(0.0, 0.8 - variance),
            "sad":       max(0.0, 0.5 - brightness),
            "surprised": min(1.0, variance * 2),
            "angry":     max(0.0, 0.3 - brightness * 0.5),
            "fear":      max(0.0, variance * 0.5),
            "disgust":   0.05,
        }
    return probs


def map_to_adaptive_emotion(probs: dict) -> tuple[str, float, dict]:
    """
    Map raw CNN probabilities to our 5 adaptive emotion classes.
    Returns (adaptive_emotion, confidence_0_to_1).
    """
    adaptive_scores: dict[str, float] = {}
    for raw_emotion, prob in probs.items():
        adaptive = EMOTION_MAP.get(raw_emotion, "focused")
        adaptive_scores[adaptive] = adaptive_scores.get(adaptive, 0.0) + prob

    # Normalise
    total = sum(adaptive_scores.values()) or 1.0
    for k in adaptive_scores:
        adaptive_scores[k] /= total

    best_emotion = max(adaptive_scores, key=adaptive_scores.get)
    confidence   = round(adaptive_scores[best_emotion], 4)
    return best_emotion, confidence, adaptive_scores


def jwt_required(f):
    """Simple JWT auth decorator."""
    @wraps(f)
    def wrapper(*args, **kwargs):
        token = request.headers.get("Authorization", "").replace("Bearer ", "")
        if not token:
            return jsonify({"error": "Missing token"}), 401
        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            request.user = data
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401
        return f(*args, **kwargs)
    return wrapper


def admin_required(f):
    """Requires valid JWT and 'admin' role."""
    @wraps(f)
    @jwt_required
    def wrapper(*args, **kwargs):
        user = getattr(request, "user", {})
        if user.get("role") != "admin":
            return jsonify({"error": "Admin privileges required"}), 403
        return f(*args, **kwargs)
    return wrapper


# ─────────────────────────────────────────────
#  AUTH ROUTES
# ─────────────────────────────────────────────
@app.route("/api/auth/login", methods=["POST"])
def login():
    body = request.get_json() or {}
    email    = body.get("email", "").strip()
    password = body.get("password", "")
    requested_role = body.get("role", "student")
    admin_key = body.get("admin_key", "")

    if not email:
        return jsonify({"error": "Email is required"}), 400
    if not password:
        return jsonify({"error": "Password is required"}), 400

    # Restrict admin privileges: require valid ADMIN_REGISTRATION_KEY to claim admin
    if requested_role == "admin":
        if ADMIN_REGISTRATION_KEY and admin_key == ADMIN_REGISTRATION_KEY:
            role = "admin"
        else:
            role = "student"
    else:
        role = "student"

    if USE_MONGO:
        existing = db.users.find_one({"email": email})
        if not existing:
            return jsonify({"error": "Invalid email or password"}), 401
        stored_pwd = existing.get("password", "")
        if check_password_hash(stored_pwd, password):
            pass
        elif stored_pwd == password:
            # Transparently upgrade legacy plaintext password to secure hash
            try:
                db.users.update_one(
                    {"_id": existing["_id"]},
                    {"$set": {"password": generate_password_hash(password)}}
                )
            except Exception:
                pass
        else:
            return jsonify({"error": "Invalid email or password"}), 401

    user_payload = {
        "sub":   email,
        "name":  body.get("name") or email.split("@")[0].capitalize(),
        "role":  role,
        "exp":   datetime.now(timezone.utc) + timedelta(hours=8),
    }
    token = jwt.encode(user_payload, SECRET_KEY, algorithm="HS256")
    return jsonify({"token": token, "user": user_payload})


@app.route("/api/auth/register", methods=["POST"])
def register():
    body = request.get_json() or {}
    email = body.get("email", "").strip()
    password = body.get("password", "")
    name = body.get("name", "").strip()

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    if USE_MONGO:
        if db.users.find_one({"email": email}):
            return jsonify({"error": "User with this email already exists"}), 409
        db.users.insert_one({
            "email": email,
            "password": generate_password_hash(password),
            "name": name or email.split("@")[0].capitalize(),
            "role": "admin" if (body.get("role") == "admin" and ADMIN_REGISTRATION_KEY and body.get("admin_key") == ADMIN_REGISTRATION_KEY) else "student",
            "created_at": datetime.now(timezone.utc),
        })

    return login()


# ─────────────────────────────────────────────
#  CORE ML ENDPOINT
# ─────────────────────────────────────────────
@app.route("/api/emotion/predict", methods=["POST"])
def predict_emotion():
    """
    Receives: { "frame": "<base64 image>", "session_id": "abc" }
    Returns:  { "emotion": "focused", "confidence": 0.87,
                "all_probs": {...}, "face_count": 1,
                "face_box": [x, y, w, h], "latency_ms": 45 }
    """
    t0 = time.time()
    body = request.get_json() or {}

    frame_b64 = body.get("frame", "")
    if not frame_b64:
        return jsonify({"error": "No frame provided"}), 400

    # Guard against oversized payloads (~1.5 MB decoded image max)
    if len(frame_b64) > 2_000_000:
        return jsonify({"error": "Image payload too large"}), 413

    # 1. Decode base64 → OpenCV frame
    bgr_frame = decode_base64_image(frame_b64)
    if bgr_frame is None:
        return jsonify({"error": "Could not decode image"}), 400

    # 2. Detect faces with Haar Cascade
    faces = detect_faces(bgr_frame)
    if len(faces) > 0:
        x, y, w, h = max(faces, key=lambda r: r[2] * r[3])
        face_box = [int(x), int(y), int(w), int(h)]
        face_count = len(faces)
    else:
        # Fallback: analyze centered webcam area when user faces camera but cascade misses
        h_img, w_img = bgr_frame.shape[:2]
        w_crop, h_crop = int(w_img * 0.5), int(h_img * 0.6)
        x = max(0, int((w_img - w_crop) / 2))
        y = max(0, int((h_img - h_crop) / 2))
        w = min(w_img - x, w_crop)
        h = min(h_img - y, h_crop)
        face_box = [int(x), int(y), int(w), int(h)]
        face_count = 1

    # 3. Preprocess for CNN
    face_tensor = preprocess_face(bgr_frame, x, y, w, h)

    # 4. CNN inference → raw probabilities
    raw_probs = cnn_predict(face_tensor)

    # 5. Map to adaptive emotions
    emotion, confidence, all_adaptive = map_to_adaptive_emotion(raw_probs)

    latency = round((time.time() - t0) * 1000)

    # 7. Persist to MongoDB (async-ish)
    if USE_MONGO:
        try:
            # Extract authenticated user if token present, else fallback
            auth_header = request.headers.get("Authorization", "")
            user_id = "anonymous"
            if auth_header.startswith("Bearer "):
                token = auth_header.split(" ", 1)[1]
                try:
                    payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
                    user_id = payload.get("sub", "anonymous")
                except Exception:
                    pass
            db.emotion_logs.insert_one({
                "user":       user_id,
                "session_id": body.get("session_id"),
                "emotion":    emotion,
                "confidence": confidence,
                "all_probs":  all_adaptive,
                "timestamp":  datetime.now(timezone.utc),
            })
        except Exception as e:
            print(f"[EmotiLearn] ⚠️  MongoDB write failed: {e}")

    return jsonify({
        "emotion":    emotion,
        "confidence": confidence,
        "all_probs":  all_adaptive,
        "raw_probs":  raw_probs,
        "face_count": face_count,
        "face_box":   face_box,
        "latency_ms": latency,
    })


# ─────────────────────────────────────────────
#  ANALYTICS ROUTES
# ─────────────────────────────────────────────
@app.route("/api/analytics/session", methods=["GET"])
@jwt_required
def get_session_analytics():
    """Return emotion history for the logged-in user."""
    user_id = request.user.get("sub")
    if USE_MONGO:
        logs = list(db.emotion_logs.find(
            {"user": user_id},
            {"_id": 0}
        ).sort("timestamp", -1).limit(100))
        return jsonify({"logs": logs})
    return jsonify({"logs": [], "message": "MongoDB not connected"})


@app.route("/api/analytics/summary", methods=["GET"])
@admin_required
def get_summary():
    """Return aggregated emotion distribution for admin dashboard."""
    if USE_MONGO:
        pipeline = [
            {"$group": {"_id": "$emotion", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
        ]
        result = list(db.emotion_logs.aggregate(pipeline))
        return jsonify({"distribution": result})
    return jsonify({"distribution": []})


# ─────────────────────────────────────────────
#  HEALTH CHECK
# ─────────────────────────────────────────────
@app.route("/api/health", methods=["GET"])
@app.route("/healthz", methods=["GET"])
def health():
    return jsonify({
        "status":       "ok",
        "model_loaded": emotion_model is not None,
        "mongodb":      USE_MONGO,
        "timestamp":    datetime.now(timezone.utc).isoformat(),
    })


if __name__ == "__main__":
    # WARNING: Use gunicorn/waitress in production — never debug=True on a public host
    debug_mode = os.getenv("FLASK_DEBUG", "0") == "1"
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "5000"))
    app.run(debug=debug_mode, host=host, port=port)