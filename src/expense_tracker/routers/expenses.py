"""HTTP routes for the expenses resource (create, list, edit)."""

from fastapi import APIRouter, HTTPException, status

from expense_tracker.errors import ExpenseNotFoundError
from expense_tracker.models import ExpenseCreate, ExpenseListPage, ExpenseOut, ExpenseUpdate
from expense_tracker.service import create_expense, edit_expense, get_expenses_page

router = APIRouter(prefix="/expenses", tags=["expenses"])


@router.post("", response_model=ExpenseOut, status_code=status.HTTP_201_CREATED)
def post_expense(payload: ExpenseCreate) -> ExpenseOut:
    """Record a new expense (EXP-10). 422 on any failed field validation."""
    return create_expense(payload)


@router.get("", response_model=ExpenseListPage)
def get_expense_list(page: int = 1, page_size: int = 20) -> ExpenseListPage:
    """List expenses, most-recent-first, paginated (EXP-11).

    Raises:
        HTTPException(500): retrieval failed — no partial page is returned.
    """
    try:
        return get_expenses_page(page, page_size)
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Could not retrieve expenses") from exc


@router.patch("/{expense_id}", response_model=ExpenseOut)
def patch_expense(expense_id: str, payload: ExpenseUpdate) -> ExpenseOut:
    """Edit an existing expense (EXP-12). 404 if it does not exist."""
    try:
        return edit_expense(expense_id, payload)
    except ExpenseNotFoundError:
        raise HTTPException(status_code=404, detail="Expense not found") from None
