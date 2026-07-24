"""Business logic for expense creation, listing, and editing."""

import uuid

from expense_tracker.errors import ExpenseNotFoundError
from expense_tracker.models import (
    ExpenseCreate,
    ExpenseListPage,
    ExpenseOut,
    ExpenseUpdate,
    SpendingSummary,
    SummaryRow,
)
from expense_tracker.repository import (
    count_expenses,
    get_expense,
    insert_expense,
    list_expenses_page,
    summarize,
    update_expense,
)
from expense_tracker.repository import (
    delete_expense as repo_delete_expense,
)


def create_expense(payload: ExpenseCreate) -> ExpenseOut:
    """Persist a validated expense and return it with its assigned id.

    Args:
        payload: Already-validated expense fields (amount rounded, category
            and description confirmed non-blank by ExpenseCreate's validators).

    Returns:
        The stored expense, including its generated id.
    """
    expense_id = str(uuid.uuid4())
    insert_expense(
        expense_id=expense_id,
        amount=payload.amount,
        category=payload.category,
        date=payload.date.isoformat(),
        description=payload.description,
    )
    return ExpenseOut(
        id=expense_id,
        amount=payload.amount,
        category=payload.category,
        date=payload.date,
        description=payload.description,
    )


def get_expenses_page(page: int, page_size: int) -> ExpenseListPage:
    """Return one most-recent-first page of expenses.

    Args:
        page: 1-indexed page number.
        page_size: Max rows per page.
    """
    rows = list_expenses_page(page, page_size)
    total = count_expenses()
    has_next = page * page_size < total
    return ExpenseListPage(
        items=[ExpenseOut(**row) for row in rows],
        page=page,
        page_size=page_size,
        total=total,
        has_next=has_next,
    )


def edit_expense(expense_id: str, payload: ExpenseUpdate) -> ExpenseOut:
    """Apply a partial update to an existing expense.

    Args:
        payload: Only fields explicitly set by the caller are applied —
            others are left untouched (EXP-12 AC4).

    Raises:
        ExpenseNotFoundError: `expense_id` does not exist.
    """
    existing = get_expense(expense_id)
    if existing is None:
        raise ExpenseNotFoundError(expense_id)

    changes = payload.model_dump(exclude_unset=True)
    if "date" in changes:
        changes["date"] = changes["date"].isoformat()
    if changes:
        update_expense(expense_id, changes)

    updated = get_expense(expense_id)
    return ExpenseOut(**updated)


def delete_expense(expense_id: str) -> None:
    """Permanently remove an expense.

    Raises:
        ExpenseNotFoundError: `expense_id` does not exist.
    """
    if get_expense(expense_id) is None:
        raise ExpenseNotFoundError(expense_id)
    repo_delete_expense(expense_id)


def get_spending_summary(
    group_by: str, start_date: str | None, end_date: str | None
) -> SpendingSummary:
    """Aggregate spend by category or month over an optional date range.

    Raises:
        ValueError: `start_date` is after `end_date`.
    """
    if start_date and end_date and start_date > end_date:
        raise ValueError("start_date must not be after end_date")

    rows = summarize(group_by, start_date, end_date)
    totals = [SummaryRow(key=row["key"], total=row["total"]) for row in rows]
    return SpendingSummary(
        group_by=group_by, totals=totals, overall_total=sum(r.total for r in totals)
    )
