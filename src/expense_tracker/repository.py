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


def delete_expense(expense_id: str) -> None:
    """Delete one expense row by id. No-op if it does not exist."""
    with get_connection() as conn:
        conn.execute("DELETE FROM expenses WHERE id = ?", (expense_id,))


def summarize(group_by: str, start_date: str | None, end_date: str | None) -> list[dict]:
    """Sum amounts grouped by category or month, within an optional date range.

    Args:
        group_by: "category" or "month" — "month" groups by the date's
            YYYY-MM prefix, so a boundary date lands in exactly one bucket.
        start_date, end_date: ISO date strings, inclusive; None means
            unbounded on that side.

    Returns:
        One dict per group: {"key": str, "total": float}. A blank/missing
        category is bucketed as "Uncategorized".
    """
    key_expr = (
        "COALESCE(NULLIF(category, ''), 'Uncategorized')"
        if group_by == "category"
        else "substr(date, 1, 7)"
    )
    with get_connection() as conn:
        rows = conn.execute(
            f"SELECT {key_expr} AS key, SUM(amount) AS total FROM expenses "
            "WHERE (:start IS NULL OR date >= :start) AND (:end IS NULL OR date <= :end) "
            "GROUP BY key ORDER BY key",
            {"start": start_date, "end": end_date},
        ).fetchall()
        return [dict(row) for row in rows]


def list_expenses_page(
    page: int,
    page_size: int,
    category: str | None = None,
    start_date: str | None = None,
    end_date: str | None = None,
) -> list[dict]:
    """Return one page of expenses, most-recently-created first, stable order.

    `rowid DESC` is the tiebreaker for same-`created_at` rows, so paging and
    repeated views never reorder or duplicate results. `category`/date-range
    filters (EXP-14) are optional and combine with AND when given together.
    """
    offset = (page - 1) * page_size
    with get_connection() as conn:
        rows = conn.execute(
            "SELECT id, amount, category, date, description, created_at FROM expenses "
            "WHERE (:category IS NULL OR category = :category) "
            "AND (:start IS NULL OR date >= :start) AND (:end IS NULL OR date <= :end) "
            "ORDER BY created_at DESC, rowid DESC LIMIT :limit OFFSET :offset",
            {
                "category": category,
                "start": start_date,
                "end": end_date,
                "limit": page_size,
                "offset": offset,
            },
        ).fetchall()
        return [dict(row) for row in rows]


def count_expenses_filtered(
    category: str | None = None, start_date: str | None = None, end_date: str | None = None
) -> int:
    """Return the count of expenses matching the same filters as list_expenses_page."""
    with get_connection() as conn:
        (total,) = conn.execute(
            "SELECT COUNT(*) FROM expenses "
            "WHERE (:category IS NULL OR category = :category) "
            "AND (:start IS NULL OR date >= :start) AND (:end IS NULL OR date <= :end)",
            {"category": category, "start": start_date, "end": end_date},
        ).fetchone()
        return total
