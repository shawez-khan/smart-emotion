# Python 3.10 slim for smaller container footprint
FROM python:3.10-slim

WORKDIR /app

# Install system libraries needed by OpenCV
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Install Python requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend application code and model
COPY . .

ENV FLASK_ENV=production
ENV HOST=0.0.0.0
ENV PORT=5000

EXPOSE 5000

# Production WSGI runner with 2 workers and 120s timeout for CNN inference
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "2", "--timeout", "120", "app:app"]
