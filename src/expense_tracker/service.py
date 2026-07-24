"""Business logic for expense creation (EXP-10)."""

import uuid

from expense_tracker.models import ExpenseCreate, ExpenseOut
from expense_tracker.repository import insert_expense


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
