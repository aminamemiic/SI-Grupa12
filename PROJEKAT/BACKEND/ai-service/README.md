# AI Analytics Service

Internal FastAPI service for future AI analytics features:

- expense anomaly checks
- category suggestions
- trend analysis
- budget forecasting
- human-readable analysis summaries

The service is intentionally scaffolded without domain-specific AI logic. It exposes stable endpoints and stores long-running analysis status in PostgreSQL so sprint features can be implemented incrementally.

## Local Run

```bash
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## Docker Compose

From `PROJEKAT/BACKEND`:

```bash
docker compose up --build ai-service
```

Health check:

```text
GET /health
```
