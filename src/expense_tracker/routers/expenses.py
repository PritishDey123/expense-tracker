"""HTTP routes for the expenses resource (create, list, edit, delete, summary)."""

from datetime import date as date_type
from typing import Literal

from fastapi import APIRouter, HTTPException, status

from expense_tracker.errors import ExpenseNotFoundError
from expense_tracker.models import (
    ExpenseCreate,
    ExpenseListPage,
    ExpenseOut,
    ExpenseUpdate,
    SpendingSummary,
)
from expense_tracker.service import (
    create_expense,
    delete_expense,
    edit_expense,
    get_expenses_page,
    get_spending_summary,
)

router = APIRouter(prefix="/expenses", tags=["expenses"])


@router.post("", response_model=ExpenseOut, status_code=status.HTTP_201_CREATED)
def post_expense(payload: ExpenseCreate) -> ExpenseOut:
    """Record a new expense (EXP-10). 422 on any failed field validation."""
    return create_expense(payload)


@router.get("", response_model=ExpenseListPage)
def get_expense_list(
    page: int = 1,
    page_size: int = 20,
    category: str | None = None,
    start_date: date_type | None = None,
    end_date: date_type | None = None,
) -> ExpenseListPage:
    """List expenses, most-recent-first, paginated, with optional filters (EXP-11, EXP-14).

    Raises:
        HTTPException(422): `start_date` is after `end_date`.
        HTTPException(500): retrieval failed — no partial page is returned.
    """
    try:
        return get_expenses_page(
            page,
            page_size,
            category,
            start_date.isoformat() if start_date else None,
            end_date.isoformat() if end_date else None,
        )
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Could not retrieve expenses") from exc


@router.get("/summary", response_model=SpendingSummary)
def get_summary(
    group_by: Literal["category", "month"],
    start_date: date_type | None = None,
    end_date: date_type | None = None,
) -> SpendingSummary:
    """Spending summary grouped by category or month (EXP-15).

    Raises:
        HTTPException(422): `start_date` is after `end_date`.
    """
    try:
        return get_spending_summary(
            group_by,
            start_date.isoformat() if start_date else None,
            end_date.isoformat() if end_date else None,
        )
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@router.patch("/{expense_id}", response_model=ExpenseOut)
def patch_expense(expense_id: str, payload: ExpenseUpdate) -> ExpenseOut:
    """Edit an existing expense (EXP-12). 404 if it does not exist."""
    try:
        return edit_expense(expense_id, payload)
    except ExpenseNotFoundError:
        raise HTTPException(status_code=404, detail="Expense not found") from None


@router.delete("/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_expense_route(expense_id: str) -> None:
    """Permanently delete an expense (EXP-13). 404 if it does not exist."""
    try:
        delete_expense(expense_id)
    except ExpenseNotFoundError:
        raise HTTPException(status_code=404, detail="Expense not found") from None
