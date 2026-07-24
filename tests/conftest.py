"""Shared pytest fixtures — isolated temp SQLite DB per test."""

import pytest
from fastapi.testclient import TestClient


@pytest.fixture()
def client(tmp_path, monkeypatch):
    db_path = tmp_path / "expenses_test.db"
    monkeypatch.setenv("EXPENSE_TRACKER_DB_PATH", str(db_path))

    from expense_tracker import db as db_module

    db_module.init_db(str(db_path))

    from expense_tracker.app import create_app

    app = create_app()
    return TestClient(app)
