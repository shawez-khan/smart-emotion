# 📌 Project Overview

**EmotiLearn** is an AI-powered adaptive learning web platform that detects student emotions in real-time using a webcam and a trained Convolutional Neural Network (CNN), then dynamically adjusts learning content based on the detected emotional state.

Most traditional e-learning platforms ignore the emotional state of learners, leading to disengagement and poor outcomes. EmotiLearn solves this by integrating real-time facial emotion recognition with an adaptive content engine — delivering the right content at the right time based on how the student actually feels.

---

## 🎯 Objectives

- Detect student emotions (Focused, Happy, Confused, Bored, Frustrated) in real-time via webcam
- Dynamically adapt learning content difficulty, pace, and media type based on detected emotion
- Provide instructors with a real-time classroom emotion dashboard
- Log emotion data to MongoDB for analytics and progress tracking
- Deliver a complete full-stack web application with authentication and admin panel

---

## 🚨 Problem Statement

Traditional online learning platforms deliver the same content to every student regardless of their emotional state. A confused student and a focused student receive identical material — leading to:

- Reduced attention and engagement
- Poor learning outcomes
- No real-time feedback mechanism for instructors

**EmotiLearn** bridges this gap by integrating emotion detection with adaptive learning mechanisms.

---

## 📖 System Description

This project presents a full-stack Smart Emotion Detection System that leverages deep learning techniques to identify human emotions from facial expressions in real-time. The core of the system is a Convolutional Neural Network (CNN) trained on the FER2013 dataset, enabling accurate classification of multiple emotional states.

The backend is implemented using Flask, which exposes RESTful APIs for handling model inference, user authentication, and data processing. Image preprocessing and feature extraction are performed using OpenCV, while TensorFlow/Keras is used for model training and prediction.

On the frontend, React.js is used to build a responsive and dynamic user interface that interacts seamlessly with the backend. The application also incorporates data visualization tools to present emotion analytics in an intuitive format.

MongoDB is utilized as a NoSQL database to store user credentials and application data, while JWT-based authentication ensures secure and scalable user sessions.

This system showcases the integration of artificial intelligence with modern web development, making it suitable for real-world applications such as emotion-aware systems, mental health tracking, and intelligent user experience design.

### Key Features
- 🎥 **Real-time emotion detection** via webcam stream
- 📊 **Emotion visualization** and analytics charts
- 🔐 **Hardened JWT authentication** with role-based access control
- 💾 **MongoDB database integration** for session telemetry
- ⚡ **High-performance API** with Flask and TensorFlow inference
- 🛡️ **Production-grade security headers** and origin restrictions

---

## 🔧 Technology Stack

### Frontend
| Technology | Purpose |
|---|---|
| React.js 18 | UI Framework |
| Recharts | Analytics Charts |
| CSS3 / Google Fonts | Styling & Typography |
| WebRTC (getUserMedia) | Webcam Access |

### Backend
| Technology | Purpose |
|---|---|
| Flask (Python) | REST API Server |
| Flask-CORS | Cross-Origin Request Control |
| PyJWT | Authentication Tokens |
| python-dotenv | Environment Variables |
| Gunicorn / Waitress | Production WSGI Web Servers |

### AI / Machine Learning
| Technology | Purpose |
|---|---|
| TensorFlow / Keras | CNN Model Training & Inference |
| OpenCV (cv2) | Face Detection (Haar Cascade) |
| NumPy | Array Operations |
| FER2013 Dataset | Training Data (35,000+ images) |
| scikit-learn | Data Splitting |
| Matplotlib | Training Visualization |

### Database
| Technology | Purpose |
|---|---|
| MongoDB | Emotion Logs & Session Storage |
| PyMongo | Python MongoDB Driver |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    REACT FRONTEND                       │
│   Dashboard | Emotion Studio | Courses | Analytics      │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTP / REST API (CORS Restricted)
                        ▼
┌─────────────────────────────────────────────────────────┐
│                  FLASK BACKEND API                      │
│   /api/auth  /api/emotion/predict  /api/content/adapt   │
└──────────┬────────────────────────┬─────────────────────┘
           │                        │
           ▼                        ▼
┌──────────────────┐    ┌───────────────────────────────┐
│   MongoDB Atlas  │    │     ML PIPELINE               │
│   - Users        │    │   OpenCV (Face Detection)     │
│   - Sessions     │    │       ↓                       │
│   - Emotion Logs │    │   CNN Model (FER2013)         │
│   - Analytics    │    │       ↓                       │
└──────────────────┘    │   Emotion Prediction          │
                        │       ↓                       │
                        │   Adaptive Content Engine     │
                        └───────────────────────────────┘
```

---

## 🧠 CNN Model Architecture (EmotionNet)

```
Input (48×48×1 Grayscale)
    ↓
Conv Block 1: Conv2D(32) → BN → ReLU → MaxPool → Dropout(0.25)
    ↓
Conv Block 2: Conv2D(64) → BN → ReLU → MaxPool → Dropout(0.25)
    ↓
Conv Block 3: Conv2D(128) → BN → ReLU → MaxPool → Dropout(0.25)
    ↓
Conv Block 4: Conv2D(256) → BN → ReLU → GlobalAvgPool
    ↓
Dense(512) → BN → ReLU → Dropout(0.5)
    ↓
Dense(7) → Softmax
    ↓
Output: [angry, disgust, fear, happy, sad, surprised, neutral]
```

**Training Results:**
- Dataset: FER2013 (35,000+ labeled facial images)
- Test Accuracy: **67.62%**
- Epochs: 60
- Optimizer: Adam (lr=0.001)
- Loss: Categorical Crossentropy

---

## 🔒 Security & Hardening

The EmotiLearn repository is hardened against common web application vulnerabilities:

1. **Strict Secret Management:**
   - Secrets are loaded strictly from `.env` (gitignored).
   - In production (`FLASK_ENV=production`), the application halts startup if `JWT_SECRET` is missing.
   - Development mode dynamically issues a cryptographically secure random session key instead of a static hardcoded string.
2. **CORS Isolation:**
   - Cross-origin requests are locked to authorized origins defined in `CORS_ORIGINS` (e.g. `http://localhost:3000`).
3. **HTTP Security Headers:**
   - Every API response includes `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection`, `Referrer-Policy: strict-origin-when-cross-origin`, and `Content-Security-Policy: default-src 'self'`.
   - `Strict-Transport-Security` (HSTS) is automatically enabled in production.
4. **Role-Based Access Control:**
   - Admin routes (`/api/analytics/summary`) require valid JWT tokens with `admin` role claims.
   - Elevating to admin role requires an `ADMIN_REGISTRATION_KEY`.
5. **Memory & Slicing Safety:**
   - Face bounding boxes detected via Haar Cascade are clamped within source image dimensions before slicing, preventing memory faults and out-of-bounds exceptions.

---

## 📁 Project Structure

```
smart emotion/
├── backend/
│   ├── models/
│   │   ├── emotion_cnn_fer2013.h5    ← Trained CNN model (~8.77 MB)
│   │   └── training_curves.png       ← Accuracy & loss curves
│   ├── app.py                         ← Hardened Flask REST API
│   ├── train_model.py                 ← CNN training script
│   ├── requirements.txt               ← Python dependencies (incl. WSGI servers)
│   ├── .env.example                   ← Backend environment template
│   └── .env                           ← Local secrets (gitignored)
│
├── frontend/
│   └── client/
│       ├── src/
│       │   ├── App.js                 ← Main React application
│       │   └── index.js               ← React entry point
│       ├── public/
│       │   └── index.html             ← Sanitized HTML shell
│       ├── .env.example               ← Frontend environment template
│       └── package.json
│
├── scripts/
│   └── security_audit.py              ← Automated pre-push security audit
│
└── dataset/                           ← Raw FER2013 data (gitignored)
    └── fer2013/
        ├── train/                     ← Training images by emotion
        └── test/                      ← Test images by emotion
```

---

## 🚀 Installation & Setup

### Prerequisites
- Python 3.10+
- Node.js v18+
- MongoDB (local or Atlas cluster)
- Git

### Step 1 — Clone Repository
```bash
git clone https://github.com/yourusername/emotilearn.git
cd emotilearn
```

### Step 2 — Backend Setup
```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
# source venv/bin/activate

pip install -r requirements.txt
```

### Step 3 — Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env     # Linux/macOS
copy .env.example .env   # Windows
```

Generate a secure 64-character JWT secret:
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```
Paste this into `backend/.env` under `JWT_SECRET`.

### Step 4 — (Optional) Retrain CNN Model
The repository already includes the pre-trained weights (`backend/models/emotion_cnn_fer2013.h5`). To retrain from scratch with FER2013:
```bash
python train_model.py --data ../dataset/fer2013 --epochs 60 --output models/
```

### Step 5 — Run Flask Backend
### 🚀 Quick Start (One-Click Windows)
Double-click `start.bat` in the project root, or run:
```bash
start.bat
```
This automatically boots both Flask (port 5000) and React (port 3000) in parallel and opens `http://localhost:3000` in your browser. To stop both, double-click `stop.bat`.

---

Development mode (manual):
```bash
python app.py
# Backend runs on http://127.0.0.1:5000
```

### Step 6 — Frontend Setup
In a new terminal:
```bash
cd frontend/client
npm install
npm start
# Frontend runs on http://localhost:3000
```

---

## 🌐 Production Deployment

### Backend (WSGI)
Never run `python app.py` (Flask built-in server) in production.

**Linux / Containerized (Gunicorn):**
```bash
cd backend
gunicorn -w 4 -b 0.0.0.0:5000 --access-logfile - app:app
```

**Windows Server (Waitress):**
```bash
cd backend
waitress-serve --host=0.0.0.0 --port=5000 app:app
```

### Frontend (Production Bundle)
```bash
cd frontend/client
npm run build
```
Serve the generated `build/` directory using Nginx, Cloudflare Pages, Vercel, or AWS S3 + CloudFront.

---

## 🔌 API Endpoints

| Method | Endpoint | Authorization | Description |
|---|---|---|---|
| POST | `/api/auth/login` | Public | User login → returns JWT token |
| POST | `/api/auth/register` | Public | User registration |
| POST | `/api/emotion/predict` | Public / Bearer | Submit frame → returns emotion & face box |
| POST | `/api/content/adapt` | Bearer Token | Returns content adaptation rules |
| GET | `/api/analytics/session` | Bearer Token | Returns emotion history for student |
| GET | `/api/analytics/summary` | Admin Bearer | Returns aggregate emotion analytics |
| GET | `/api/health` | Public | Health status & model status |

---

## 📊 ML Pipeline Flow

```
Student Webcam
      ↓
canvas.drawImage() → base64 JPEG frame
      ↓
POST /api/emotion/predict
      ↓
OpenCV Haar Cascade → detect face → clamp ROI bounds → crop 48×48
      ↓
Normalize to [0,1] → reshape to (1,48,48,1)
      ↓
CNN Model → Softmax → 7 class probabilities
      ↓
Map to 5 adaptive emotions
      ↓
Return { emotion, confidence, all_probs, face_box }
      ↓
React → Update UI + Adaptive Content Engine
      ↓
MongoDB → Log emotion + timestamp
```

---

## 👥 Team

| Name | Role |
|---|---|
| mohammed shawez khan | Data Scientist & ML Engineer |
