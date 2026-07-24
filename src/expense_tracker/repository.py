"""Data-access layer for expenses — thin wrapper over sqlite3."""

from datetime import UTC, datetime

from expense_tracker.db import get_connection


def insert_expense(
    expense_id: str, amount: float, category: str, date: str, description: str
) -> None:
    """Insert one expense row.

    Args:
        expense_id: Caller-generated UUID string (primary key).
        date: ISO 8601 date string (already validated/rounded upstream).
    """
    created_at = datetime.now(UTC).isoformat()
    with get_connection() as conn:
        conn.execute(
            "INSERT INTO expenses (id, amount, category, date, description, created_at) "
            "VALUES (?, ?, ?, ?, ?, ?)",
            (expense_id, amount, category, date, description, created_at),
        )


def list_expenses() -> list[dict]:
    """Return all expenses, most-recently-created first.

    Returns:
        One dict per row with keys: id, amount, category, date, description,
        created_at.
    """
    with get_connection() as conn:
        rows = conn.execute(
            "SELECT id, amount, category, date, description, created_at "
            "FROM expenses ORDER BY created_at DESC"
        ).fetchall()
        return [dict(row) for row in rows]
