"""
Unit and Integration Tests for EmotiLearn Backend
=================================================
Verifies core robustness:
  - Clamped face ROI preprocessing
  - Defensive base64 decoding
  - Adaptive emotion mapping
  - API endpoints (health, safe error on bad payload, auth)
"""

import os
import sys
import base64
import unittest
import numpy as np

# Ensure backend directory is in sys.path
BACKEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

# Import functions and Flask app from backend/app.py
from app import (
    app,
    preprocess_face,
    decode_base64_image,
    map_to_adaptive_emotion,
)


class TestEmotiLearnBackend(unittest.TestCase):
    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True

    def test_preprocess_face_normal_bounds(self):
        # 100x100 fake RGB frame
        frame = np.zeros((100, 100, 3), dtype=np.uint8)
        tensor = preprocess_face(frame, 10, 10, 30, 30)
        self.assertEqual(tensor.shape, (1, 48, 48, 1))
        self.assertEqual(tensor.dtype, np.float32)

    def test_preprocess_face_out_of_bounds(self):
        frame = np.zeros((100, 100, 3), dtype=np.uint8)
        # Face box partially outside negative and positive boundaries
        tensor_neg = preprocess_face(frame, -20, -10, 40, 40)
        self.assertEqual(tensor_neg.shape, (1, 48, 48, 1))

        tensor_pos = preprocess_face(frame, 90, 90, 50, 50)
        self.assertEqual(tensor_pos.shape, (1, 48, 48, 1))

    def test_preprocess_face_zero_or_empty(self):
        frame = np.zeros((100, 100, 3), dtype=np.uint8)
        tensor = preprocess_face(frame, 50, 50, 0, 0)
        self.assertEqual(tensor.shape, (1, 48, 48, 1))

    def test_decode_base64_image_invalid_payload(self):
        # Must return None, never raise an unhandled exception
        self.assertIsNone(decode_base64_image("not-base-64!!"))
        self.assertIsNone(decode_base64_image(""))
        self.assertIsNone(decode_base64_image("data:image/jpeg;base64,invalid==="))

    def test_decode_base64_image_valid_payload(self):
        # 1x1 black pixel PNG
        png_1x1 = (
            "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HA"
            "wCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII="
        )
        img = decode_base64_image(png_1x1)
        self.assertIsNotNone(img)
        self.assertIsInstance(img, np.ndarray)

    def test_map_to_adaptive_emotion(self):
        sample_probs = {
            "angry": 0.05,
            "disgust": 0.05,
            "fear": 0.1,
            "happy": 0.6,
            "sad": 0.05,
            "surprised": 0.05,
            "neutral": 0.1,
        }
        best_emotion, confidence, adaptive_scores = map_to_adaptive_emotion(sample_probs)
        self.assertEqual(best_emotion, "happy")
        self.assertAlmostEqual(confidence, 0.6, places=2)
        self.assertIn("happy", adaptive_scores)
        self.assertIn("focused", adaptive_scores)

    def test_api_health_endpoint(self):
        res = self.app.get("/api/health")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data.get("status"), "ok")

    def test_predict_endpoint_malformed_base64_returns_400(self):
        # Ensure server returns 400 Bad Request, NOT 500 crash
        res = self.app.post(
            "/api/emotion/predict",
            json={"frame": "malformed_base64_string"}
        )
        self.assertEqual(res.status_code, 400)
        data = res.get_json()
        self.assertIn("error", data)

    def test_auth_login_validations(self):
        # Empty body
        res = self.app.post("/api/auth/login", json={})
        self.assertEqual(res.status_code, 400)

        # Valid body
        res = self.app.post(
            "/api/auth/login",
            json={"email": "student@emotilearn.ai", "password": "securepassword"}
        )
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn("token", data)
        self.assertEqual(data.get("user", {}).get("sub"), "student@emotilearn.ai")

    def test_auth_register_validations(self):
        # Missing fields
        res = self.app.post("/api/auth/register", json={"email": "incomplete@test.com"})
        self.assertEqual(res.status_code, 400)

        # Valid registration
        res = self.app.post(
            "/api/auth/register",
            json={"name": "New Student", "email": "newstudent@emotilearn.ai", "password": "pw12345"}
        )
        self.assertEqual(res.status_code, 200)
        self.assertIn("token", res.get_json())

    def test_detect_faces_resilience(self):
        # A blank frame should return an empty list, not crash
        blank_frame = np.zeros((200, 200, 3), dtype=np.uint8)
        from app import detect_faces
        faces = detect_faces(blank_frame)
        self.assertIsInstance(faces, (list, np.ndarray))

    def test_predict_endpoint_with_image_and_fallback(self):
        # Frame with base64 encoding triggers full prediction pipeline
        import cv2
        frame = np.ones((100, 100, 3), dtype=np.uint8) * 128
        _, buf = cv2.imencode(".jpg", frame)
        b64 = "data:image/jpeg;base64," + base64.b64encode(buf).decode()
        res = self.app.post("/api/emotion/predict", json={"frame": b64})
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn("emotion", data)
        self.assertIn("all_probs", data)
        self.assertGreater(data.get("face_count", 0), 0)
        self.assertIsNotNone(data.get("face_box"))


if __name__ == "__main__":
    unittest.main()
