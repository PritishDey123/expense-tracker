"""EXP-16: app must initialize its DB schema on startup, without relying on
a caller (test fixture or otherwise) to call init_db() first."""

from fastapi.testclient import TestClient


def test_fresh_app_serves_requests_without_manual_init_db(tmp_path, monkeypatch):
    db_path = tmp_path / "fresh_startup.db"
    monkeypatch.setenv("EXPENSE_TRACKER_DB_PATH", str(db_path))

    from expense_tracker.app import create_app

    app = create_app()
    with TestClient(app) as client:
        resp = client.get("/expenses")

    assert resp.status_code == 200
    assert resp.json()["items"] == []
