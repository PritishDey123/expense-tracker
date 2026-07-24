"""Business logic for expense creation and listing (EXP-10, EXP-11)."""

import uuid

from expense_tracker.models import ExpenseCreate, ExpenseListPage, ExpenseOut
from expense_tracker.repository import count_expenses, insert_expense, list_expenses_page


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
