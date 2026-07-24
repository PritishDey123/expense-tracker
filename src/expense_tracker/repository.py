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
            "FROM expenses ORDER BY created_at DESC, rowid DESC"
        ).fetchall()
        return [dict(row) for row in rows]


def count_expenses() -> int:
    """Return the total number of stored expenses."""
    with get_connection() as conn:
        (total,) = conn.execute("SELECT COUNT(*) FROM expenses").fetchone()
        return total


def get_expense(expense_id: str) -> dict | None:
    """Return one expense by id, or None if it does not exist."""
    with get_connection() as conn:
        row = conn.execute(
            "SELECT id, amount, category, date, description, created_at FROM expenses WHERE id = ?",
            (expense_id,),
        ).fetchone()
        return dict(row) if row else None


def update_expense(expense_id: str, fields: dict) -> None:
    """Update only the given columns of one expense row.

    Args:
        fields: Column name → new value, for columns already validated by
            the caller (service layer) — no validation happens here.
    """
    columns = ", ".join(f"{key} = ?" for key in fields)
    with get_connection() as conn:
        conn.execute(
            f"UPDATE expenses SET {columns} WHERE id = ?",
            (*fields.values(), expense_id),
        )


def list_expenses_page(page: int, page_size: int) -> list[dict]:
    """Return one page of expenses, most-recently-created first, stable order.

    `rowid DESC` is the tiebreaker for same-`created_at` rows, so paging and
    repeated views never reorder or duplicate results.
    """
    offset = (page - 1) * page_size
    with get_connection() as conn:
        rows = conn.execute(
            "SELECT id, amount, category, date, description, created_at "
            "FROM expenses ORDER BY created_at DESC, rowid DESC "
            "LIMIT ? OFFSET ?",
            (page_size, offset),
        ).fetchall()
        return [dict(row) for row in rows]
