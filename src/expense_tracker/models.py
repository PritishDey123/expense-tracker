"""Expense schema — the shape all EXP-10..EXP-15 stories build on."""

from datetime import date as date_type

from pydantic import BaseModel, field_validator


class ExpenseCreate(BaseModel):
    amount: float
    category: str
    date: date_type
    description: str

    @field_validator("amount")
    @classmethod
    def amount_must_be_positive(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("amount must be greater than zero")
        return round(v, 2)

    @field_validator("category")
    @classmethod
    def category_must_not_be_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("category must not be blank")
        return v

    @field_validator("description")
    @classmethod
    def description_must_not_be_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("description must not be blank")
        return v


class ExpenseOut(BaseModel):
    id: str
    amount: float
    category: str
    date: date_type
    description: str
