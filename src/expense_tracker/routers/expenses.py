"""HTTP routes for the expenses resource (EXP-10: create)."""

from fastapi import APIRouter, status

from expense_tracker.models import ExpenseCreate, ExpenseOut
from expense_tracker.service import create_expense

router = APIRouter(prefix="/expenses", tags=["expenses"])


@router.post("", response_model=ExpenseOut, status_code=status.HTTP_201_CREATED)
def post_expense(payload: ExpenseCreate) -> ExpenseOut:
    """Record a new expense (EXP-10). 422 on any failed field validation."""
    return create_expense(payload)
