# Marketing App

AI-powered marketing campaign generator with a Next.js frontend and FastAPI + LangGraph backend.

## Architecture: agent-as-a-tool

One **Orchestrator** handles every user turn (initial brief and follow-ups). Specialist capabilities are exposed as **tools** the orchestrator can call — not as a fixed pipeline.

```
[Next.js Frontend]  →  [FastAPI API]
                              ↓
                    [Orchestrator Agent]
                     (plans + reasons)
                              ↓
    ┌─────────┬──────────┬─────────────┬───────────────┬──────────────┐
    ↓         ↓          ↓             ↓               ↓              ↓
quality   extract    brainstorm    write_copy    generate_visual  review
_gate     _brief     _angles       _platforms    _asset           _outputs
    └─────────┴──────────┴─────────────┴───────────────┴──────────────┘
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

### Principles

- **Orchestrator owns routing** — it decides which tools to call, in what order, and whether to retry after partial results.
- **Modes are hints, not pipelines** — UI mode chips (`Brainstorm`, `Copywriting`, `Visual Asset`) bias tool preference; they do not hard-wire a separate flow.
- **Conversation is continuous** — follow-up chat re-enters the same orchestrator with full `campaign.state` and message history.
- **Incremental outputs** — each tool call appends to `campaign.outputs` and logs to `campaign.state.tool_calls`.

### Agent-tools (MVP)

| Tool | Purpose |
|------|---------|
| `quality_gate` | Validate input sufficiency; return clarifying questions if needed |
| `extract_brief` | Parse source into quotes, stats, angles, audience guess |
| `brainstorm_angles` | Research-style angles, insights, audience signals |
| `write_copy` | Platform-native copy (LinkedIn, X, Instagram, Facebook) |
| `generate_visual` | Image prompt + DALL·E / stock selection |
| `review_outputs` | Score, strengths, suggestions; optional revision pass |

### Campaign state

Persisted in `campaign.state`:

- `task_type` — optional mode hint from the UI
- `messages` — user + assistant conversation
- `tool_calls` — `{ tool_run_id, tool, status, output_ref, started_at, completed_at }`
- `last_completed_tool` — resume checkpoint after interruption

State machine: `draft` → `processing` → `needs_review` → `approved` → `scheduled` / `exported`

> **Backend status:** The API still runs a legacy fixed graph (`extractor → writer → image → reviewer`). The target design is an orchestrator ReAct loop with the tools above. See `.cursor/rules/Business-Logic.mdc` for full invariants and implementation notes.

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
source .venv/bin/activate       # MacOS
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

**Mock mode (no backend):** Set `USE_BACKEND = false` in `frontend/src/lib/constants.ts`. The UI simulates orchestrator turns with staged `tool_calls` and incremental `outputs` in session storage.

**Live API:** Set `USE_BACKEND = true` and ensure the backend is running on port 8000.

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
| POST | `/api/v1/campaigns/{id}/run` | Start or continue an orchestrator turn |

Planned: `POST /api/v1/campaigns/{id}/messages` for follow-up chat (same orchestrator entry point), with streamed `tool_start` / `tool_end` events for the live activity UI.

## Workflow

1. **User input** — URL, PDF, YouTube link, raw text, or follow-up message. Optional mode chip.
2. **Orchestrator turn** — Plans which tools to invoke from brief, mode hint, history, and existing outputs.
3. **Tool execution** — Tools run as needed; the UI shows activity from `tool_calls` and renders outputs by `output_type` (`brainstorm`, `copy`, `image`, `review`).
4. **Review gate** — User edits, regenerates, or approves outputs (human-in-the-loop; not orchestrator tools).
5. **Finalization** — Approved outputs can be scheduled or exported as CSV.
