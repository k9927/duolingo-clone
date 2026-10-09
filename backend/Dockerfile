# Container for the API: used by Hugging Face Spaces (Docker SDK) and works on any Docker host.
FROM python:3.12-slim

# Spaces run containers as a non-root user with UID 1000; the app folder must be writable
# by it because the SQLite database is created and seeded there on first start.
RUN useradd -m -u 1000 user
USER user
ENV PATH="/home/user/.local/bin:$PATH" \
    PYTHONUNBUFFERED=1
WORKDIR /home/user/app

COPY --chown=user requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

COPY --chown=user app ./app

# Spaces route traffic to port 7860; other hosts can override with $PORT.
EXPOSE 7860
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-7860}"]
