"""Expense schema — the shape all EXP-10..EXP-15 stories build on."""

from datetime import date as date_type

from pydantic import BaseModel, field_validator


def _validate_amount(v: float) -> float:
    if v <= 0:
        raise ValueError("amount must be greater than zero")
    return round(v, 2)


def _validate_category(v: str) -> str:
    if not v.strip():
        raise ValueError("category must not be blank")
    return v


def _validate_description(v: str) -> str:
    if not v.strip():
        raise ValueError("description must not be blank")
    return v


class ExpenseCreate(BaseModel):
    amount: float
    category: str
    date: date_type
    description: str

    _v_amount = field_validator("amount")(_validate_amount)
    _v_category = field_validator("category")(_validate_category)
    _v_description = field_validator("description")(_validate_description)


class ExpenseOut(BaseModel):
    id: str
    amount: float
    category: str
    date: date_type
    description: str


class ExpenseUpdate(BaseModel):
    """Partial update (EXP-12) — only the fields present are validated/applied."""

    amount: float | None = None
    category: str | None = None
    date: date_type | None = None
    description: str | None = None

    _v_amount = field_validator("amount")(lambda v: v if v is None else _validate_amount(v))
    _v_category = field_validator("category")(lambda v: v if v is None else _validate_category(v))
    _v_description = field_validator("description")(
        lambda v: v if v is None else _validate_description(v)
    )


class ExpenseListPage(BaseModel):
    items: list[ExpenseOut]
    page: int
    page_size: int
    total: int
    has_next: bool


class SummaryRow(BaseModel):
    key: str
    total: float


class SpendingSummary(BaseModel):
    group_by: str
    totals: list[SummaryRow]
    overall_total: float
