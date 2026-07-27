"""FastAPI application factory."""

from contextlib import asynccontextmanager

from fastapi import FastAPI

from expense_tracker.db import init_db
from expense_tracker.routers.expenses import router as expenses_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


def create_app() -> FastAPI:
    app = FastAPI(title="Expense Tracker", lifespan=lifespan)
    app.include_router(expenses_router)
    return app


app = create_app()
