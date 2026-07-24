# Expense Tracker

A single-user expense tracking API. Record, list, edit, delete, and
summarize expenses by category and date range.

## Stack

- Python 3.12+
- FastAPI
- SQLite (single file, no external DB service)
- `uv` for dependency management

## Setup

```bash
uv sync
```

## Run

```bash
uv run uvicorn expense_tracker.app:app --reload
```

## Test

```bash
uv run pytest
```

## Lint / Format

```bash
uv run ruff check .
uv run ruff format .
```
