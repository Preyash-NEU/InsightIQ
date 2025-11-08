## InsightIQ

InsightIQ is an AI-assisted data analysis web application. It consists of a FastAPI backend and a Next.js frontend. The project includes Docker Compose configuration for local services (Postgres, Redis, pgAdmin). This README summarizes the repository layout, how the backend and frontend are organised, how to run the project locally, and what is implemented vs. what remains to be done.

---

## Repository layout (Important paths)

- `backend/` — Python FastAPI backend
  - `app/main.py` — FastAPI application entry (routers, CORS, basic health endpoints)
  - `app/core/config.py` — pydantic settings; loads `.env` from `backend/.env`
  - `app/db/` — database wiring (`base.py`, `session.py`)
  - `app/models/` — SQLAlchemy ORM models (`User`, `Dataset`, `Query`, `Insight`)
  - `app/schemas/` — Pydantic request/response schemas
  - `app/api/v1/` — API routes (auth, datasets, queries, insights)
  - `app/services/` — business logic (data ingestion, profiling, insight generation)
  - `requirements.txt` — Python dependencies

- `frontend/` — Next.js frontend (React + TypeScript)
  - `app/` — Next.js pages and components
  - `package.json` — frontend dependencies & scripts

- `docker-compose.yml` — local stack (postgres, redis, pgadmin). Backend/frontend services are present but commented out.

---

## High-level overview — What is implemented (backend)

- FastAPI application with CORS and basic endpoints (root, /health).
- Settings via `app/core/config.py` (loads `backend/.env`).
- Database connection using SQLAlchemy (`app/db/session.py`) with `SessionLocal` and dependency `get_db` for routes.
- ORM models are defined for core entities:
  - `User` (email, hashed_password, roles flags, relationships)
  - `Dataset` (metadata and logical table name that points to a dynamically-created table)
  - `Query` (stores natural language, generated SQL and execution metadata)
  - `Insight` (AI-generated insight records)
- Authentication endpoints exist in `app/api/v1/auth.py` supporting registration and login with JWT tokens.
- Dataset upload endpoint in `app/api/v1/datasets.py` supports CSV upload, parsing, metadata extraction, dynamic table creation and bulk ingestion using `app/services/data_ingestion.py`.
- Data profiling utilities are implemented in `app/services/data_profiler.py` to derive column statistics and correlations from a dataset table.
- Security utilities in `app/core/security.py` provide password hashing (bcrypt), token creation/validation (pyjwt/jose), and a `get_current_user` dependency for routes.

Files to look at for the core flows:
- `backend/app/services/data_ingestion.py` — dynamic table creation, pandas -> SQL type mapping, bulk upload
- `backend/app/services/data_profiler.py` — sampling, column stats, correlations

---

## High-level overview — What is implemented (frontend)

- Next.js app scaffold with auth pages (login/register), dashboard pages, dataset pages, and UI components.
- Uses React (Next 15), React Query, and Recharts for visualization.
- Frontend expects an API at `/api/v1` (see `NEXT_PUBLIC_API_URL` in docker-compose comments)

---

## Docker Compose

The provided `docker-compose.yml` starts the following services:

- `postgres` (Postgres 16)
- `redis` (Redis 7-alpine)
- `pgadmin` (pgAdmin 4)

Note: The `backend` and `frontend` services are present in the file but commented out. They are intentionally commented until Dockerfiles and build contexts are finalised.

To spin up the DB and Redis only:

```powershell
docker compose up -d postgres redis pgadmin
```

Then check Postgres on port 5432 and pgAdmin on port 5050.

---

## Environment variables

The backend expects a `.env` file at the `backend/` directory (the `app/core/config.py` points to it). Typical variables used by the backend include:

- `DATABASE_URL` — SQLAlchemy database URL, e.g. `postgresql+psycopg2://user:password@localhost:5432/insightiq`
- `SECRET_KEY` — JWT signing secret
- `ALGORITHM` — JWT algorithm (default `HS256`)
- `ACCESS_TOKEN_EXPIRE_DAYS` — token lifetime in days
- `ALLOWED_ORIGINS` — comma-separated allowed CORS origins
- `OPENAI_API_KEY`, `ANTHROPIC_API_KEY` — optional AI provider keys

If you use VS Code, enable loading of `.env` into terminals by setting `python.terminal.useEnvFile` to `true` in your VS Code settings so running backend commands gets the env variables automatically.

---

## How to run the backend locally (development)

1. Create and activate a Python virtual environment (Windows PowerShell example):

```powershell
python -m venv .venv
.\\.venv\\Scripts\\Activate.ps1
pip install -r backend/requirements.txt
```

2. Create a `backend/.env` with the required variables (see the section above).

3. Ensure Postgres is available (via Docker Compose or a local DB) and `DATABASE_URL` points to it.

4. Run the FastAPI app from `backend/`:

```powershell
# from repository root
cd backend
uvicorn app.main:app --reload --port 8000
```

5. Open http://localhost:8000/docs to view interactive API docs.

---

## How to run the frontend locally

1. Install dependencies and run dev server (from `frontend/`):

```powershell
cd frontend
npm install
npm run dev
```

2. The frontend runs on port 3000 by default. Ensure it can reach the backend (set `NEXT_PUBLIC_API_URL` appropriately during dev or in `.env` for the frontend).

---

## Notes about code status and TODOs

What is well implemented (backend):
- App wiring (FastAPI), CORS, basic health endpoints
- Authentication flows (register/login) with JWT
- Dataset upload, parsing, dynamic table creation and ingestion
- Data profiling utilities
- SQLAlchemy models for main entities

What is incomplete / recommended next steps:
- Add and run Alembic migrations (models are defined but migrations are not present in the repo)
- Add comprehensive error handling middleware and structured logging
- Add test suite (unit + integration) and CI pipeline
- Finalise LLM/adapters (OpenAI/Anthropic) for insight generation and query generation (some service stubs exist)
- Add Dockerfiles for backend and frontend and enable them in `docker-compose.yml` for full local stack
- Add rate-limiting, RBAC, and input sanitization for production readiness

---

## Where to look in code for specific flows

- Authentication: `backend/app/api/v1/auth.py`, `backend/app/core/security.py`, `backend/app/models/user.py`
- Dataset upload & ingestion: `backend/app/api/v1/datasets.py`, `backend/app/services/data_ingestion.py`, `backend/app/utils/csv_parser.py`
- Profiling: `backend/app/services/data_profiler.py`
- Models: `backend/app/models/*.py`
- DB setup: `backend/app/db/session.py` and `backend/app/db/base.py`

---

## Contributors
- [Preyash Mehta](https://www.linkedin.com/in/preyash-mehta/) - Project Lead
