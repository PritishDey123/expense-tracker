"""FastAPI application factory."""

from fastapi import FastAPI

from expense_tracker.routers.expenses import router as expenses_router


def create_app() -> FastAPI:
    app = FastAPI(title="Expense Tracker")
    app.include_router(expenses_router)
    return app


app = create_app()
