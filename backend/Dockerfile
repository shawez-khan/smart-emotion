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

# Setup Hugging Face compatible non-root user (UID 1000)
RUN useradd -m -u 1000 user
USER user
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH

WORKDIR /home/user/app
COPY --chown=user . .

ENV FLASK_ENV=production
ENV HOST=0.0.0.0
ENV PORT=7860

EXPOSE 7860

# Production WSGI runner binding to port 7860 (Hugging Face default)
CMD ["gunicorn", "--bind", "0.0.0.0:7860", "--workers", "2", "--timeout", "120", "app:app"]
