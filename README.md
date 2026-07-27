<!-- Last updated: 2026-07-27 -->

# expense-tracker

**Audience:** Developer

A single-user expense tracker exposing a REST API to record, list, edit, delete, and summarize expenses.

## Contents
- [Overview](#overview)
- [Getting started](#getting-started)
- [Architecture](#architecture)
- [API](#api)
- [Configuration](#configuration)
- [Runbook](#runbook)
- [Contributing](#contributing)

## Overview

expense-tracker is a basic single-user expense tracking service. It has no
authentication or multi-tenancy in v1 — there is a single implicit user
referred to in the domain glossary as "Budget Owner". v1 ships as a REST API
plus a React frontend (`frontend/`) that provides create, edit, delete,
filter, and summary views over that API — see
[`frontend/README.md`](frontend/README.md) for the UI's own setup and
architecture. Data is persisted to a local SQLite file with no ORM and no
migration framework — the schema is created automatically at application
startup. Stories EXP-10 through EXP-16 (tracked in Plane) map to the create,
list, edit, delete, filter, summary, and startup schema auto-init
capabilities of the API respectively, and are all in `Done` state. Stories
EXP-17 through EXP-22 (also tracked in Plane, all `Done`) added the frontend
on top of that API.

## Getting started

### Prerequisites
- Python 3.12 (see `.python-version`)
- [`uv`](https://docs.astral.sh/uv/) — used for dependency management and running commands

### Local setup
```bash
# Clone and install
git clone https://github.com/PritishDey123/expense-tracker.git
cd expense-tracker
uv sync

# Configure environment (optional)
# EXPENSE_TRACKER_DB_PATH overrides the default SQLite file location.
# See Configuration below.

# Run
uv run uvicorn expense_tracker.app:app --reload
```

The app has no `[project.scripts]` entrypoint, so it must be started via
`uvicorn` directly, using the module path `expense_tracker.app:app`. It
listens on uvicorn's default port (8000). No manual database
initialization is required — the schema is created automatically on
startup by `init_db()`. Once running, interactive API docs are available at
`/docs` (Swagger UI) and `/redoc` (ReDoc).

### Running the frontend

The React UI lives in `frontend/` and requires the backend above to already
be running on port 8000 (its dev server proxies `/expenses` requests there).
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```

This starts the Vite dev server (default `http://localhost:5173`) with hot
reload. See [`frontend/README.md`](frontend/README.md) for build, lint, and
test commands.

### Running tests
```bash
uv run pytest

# With coverage (source restricted to src/expense_tracker, target 85%)
uv run pytest --cov
```

Tests live in `tests/`. Each test gets an isolated, temporary SQLite
database via the `client` fixture defined in `conftest.py`.

This covers the backend only. For frontend tests, see
[`frontend/README.md`](frontend/README.md#running-tests) (`npx vitest run`
from `frontend/`).

## Architecture

The service is a single FastAPI application layered into HTTP, business
logic, and data-access tiers, backed directly by SQLite (no ORM, no
migration framework — schema is created at startup). There are no external
services, queues, or caches.

**Key components:**
| Component | Responsibility |
|---|---|
| `src/expense_tracker/app.py` | FastAPI app factory; lifespan hook calls `init_db()` on startup to auto-create the schema |
| `src/expense_tracker/db.py` | Raw `sqlite3` connection management and schema definition (`expenses` table) |
| `src/expense_tracker/models.py` | Pydantic request/response schemas (`ExpenseCreate`, `ExpenseUpdate`, `ExpenseOut`, `ExpenseListPage`, `SpendingSummary`, `SummaryRow`) |
| `src/expense_tracker/repository.py` | Data-access layer — all raw SQL (insert/list/get/update/delete/summarize/paginate) |
| `src/expense_tracker/service.py` | Business logic layer — validation orchestration, UUID generation, calls into the repository |
| `src/expense_tracker/routers/expenses.py` | HTTP layer — `APIRouter(prefix="/expenses", tags=["expenses"])`, thin route handlers |
| `src/expense_tracker/errors.py` | Domain exceptions (e.g. `ExpenseNotFoundError`) |
| `frontend/` | React 19 + TypeScript + Vite single-page app consuming the `/expenses` API — see [`frontend/README.md`](frontend/README.md) |

**External dependencies:**
| System | Purpose | Notes |
|---|---|---|
| SQLite (local file) | Persistent storage for expenses | Single file, default `expenses.db` in the working directory; path overridable via `EXPENSE_TRACKER_DB_PATH` |

> TODO: verify — no architecture diagram exists yet for this service.

## API

The API exposes CRUD and summary operations under the `/expenses` prefix.
There is no single-item lookup endpoint (`GET /expenses/{expense_id}`) in v1.

| Method | Path | Purpose | Responses |
|---|---|---|---|
| `POST` | `/expenses` | Create an expense | 201, 422 |
| `GET` | `/expenses` | List expenses, paginated and filterable by category/date range | 200, 422 (start_date > end_date), 500 |
| `GET` | `/expenses/summary` | Spending summary grouped by category or month (`group_by` required) | 200, 422 |
| `PATCH` | `/expenses/{expense_id}` | Partially edit an expense | 200, 404, 422 |
| `DELETE` | `/expenses/{expense_id}` | Hard-delete an expense | 204, 404 |

[Full API reference](docs/api/expense-tracker.md)

## Configuration

| Variable | Required | Default | Description |
|---|---|---|---|
| `EXPENSE_TRACKER_DB_PATH` | No | `expenses.db` (in the current working directory) | Overrides the SQLite database file path. Read once at application startup in `db.py:init_db`. |

## Runbook

No runbook exists yet for this service — `PROJECT.md` lists no configured
environments (`environments: []`), so there is no production deployment to
operate against. A runbook should be created via `runbook-writer` once a
production environment is configured.

## Contributing

There is no `CONTRIBUTING.md` yet. Until one exists, follow these basics:

1. Fork the repository and create a feature branch off `main`.
2. Make your changes, keeping components small and each with a matching test.
3. Run the test suite: `uv run pytest` (and `uv run pytest --cov` to check coverage) for
   backend changes, or `npx vitest run` from `frontend/` for frontend changes.
4. Format and lint before committing: `uv run ruff format .` and `uv run ruff check .`
   (line length 100, default rule set) for backend changes, or `npm run lint` (`oxlint`)
   from `frontend/` for frontend changes.
5. Open a pull request against `main` at https://github.com/PritishDey123/expense-tracker.git.
