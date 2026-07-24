"""SQLite connection and schema management.

Single-file SQLite datastore per PROJECT.md (no external DB service). The
active DB path is process-global so both the FastAPI app and the repository
layer share one connection target without threading it through every call.
"""

import os
import sqlite3

_DEFAULT_DB_PATH = "expenses.db"
_active_db_path = _DEFAULT_DB_PATH

SCHEMA = """
CREATE TABLE IF NOT EXISTS expenses (
    id TEXT PRIMARY KEY,
    amount REAL NOT NULL,
    category TEXT NOT NULL,
    date TEXT NOT NULL,
    description TEXT NOT NULL,
    created_at TEXT NOT NULL
);
"""


def init_db(path: str | None = None) -> None:
    """Create the expenses table at `path` (or the env/default path)."""
    global _active_db_path
    _active_db_path = path or os.environ.get("EXPENSE_TRACKER_DB_PATH", _DEFAULT_DB_PATH)
    with get_connection() as conn:
        conn.execute(SCHEMA)


def get_connection() -> sqlite3.Connection:
    """Return a new connection to the active DB path, rows as dict-like."""
    conn = sqlite3.connect(_active_db_path)
    conn.row_factory = sqlite3.Row
    return conn
