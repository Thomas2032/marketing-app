# Marketing App

AI-powered marketing campaign generator with a Next.js frontend and FastAPI + LangGraph backend.

## Architecture

```
[Next.js Frontend]  →  [FastAPI API]
                              ↓
                    [Orchestrator Agent]
                              ↓
        ┌─────────────┬───────────┼───────────┐
        ↓             ↓           ↓           ↓
   Extractor      Writer       Image      Reviewer
        └─────────────┴───────────┴───────────┘
                              ↓
              [PostgreSQL]  +  [S3/R2]  +  [Redis queue]
```

| Layer | Tech |
|-------|------|
| Frontend | Next.js 16, React, TypeScript, Tailwind |
| Backend | FastAPI, LangGraph, LangChain |
| Database | PostgreSQL (campaign state, outputs, user config) |
| Storage | S3-compatible (AWS S3 or Cloudflare R2) |
| Queue | Redis + arq (optional, for long runs) |

## Quick start

### 1. Infrastructure

```bash
docker compose up -d postgres redis
```

### 2. Backend

```bash
cd backend
cp .env.example .env
# Add OPENAI_API_KEY and storage credentials

python -m venv .venv
.venv\Scripts\activate        # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

### 3. Frontend

```bash
cd frontend
cp ../.env.example .env.local
npm run dev
```

App: http://localhost:3000

### 4. Optional: queue worker

Set `USE_QUEUE=true` in `backend/.env`, then:

```bash
docker compose --profile queue up -d worker
```

## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/health` | Health check |
| POST | `/api/v1/campaigns` | Create campaign |
| GET | `/api/v1/campaigns/{id}` | Get campaign + outputs |
| POST | `/api/v1/campaigns/{id}/run` | Run agent pipeline |

## Agent pipeline

1. **Extractor** — parses brief into structured fields
2. **Writer** — generates campaign copy
3. **Image** — creates image prompt and uploads to object storage
4. **Reviewer** — scores and revises output
