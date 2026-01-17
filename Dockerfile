FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Python packages
RUN pip install --no-cache-dir \
    torch==2.3.0 \
    transformers==4.41.2 \
    kafka-python==2.0.1 \
    flask==2.3.3 \
    werkzeug==2.3.7 \
    flask-cors==4.0.0 \
    redis==5.0.1 \
    requests==2.31.0

COPY projects/absa_streaming /app

CMD ["python", "api/comment_api.py"]
