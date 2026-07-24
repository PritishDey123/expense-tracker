"""EXP-11: Budget Owner views list of expenses — GET /expenses."""

from unittest.mock import patch


def _create(client, category="Food", amount=10):
    return client.post(
        "/expenses",
        json={"amount": amount, "category": category, "date": "2026-07-24", "description": "x"},
    )


def test_empty_state_when_no_expenses(client):
    resp = client.get("/expenses")
    assert resp.status_code == 200
    body = resp.json()
    assert body["items"] == []
    assert body["has_next"] is False


def test_lists_most_recent_first_with_all_fields(client):
    _create(client, category="Food")
    _create(client, category="Travel")
    resp = client.get("/expenses")
    items = resp.json()["items"]
    assert [i["category"] for i in items] == ["Travel", "Food"]
    assert set(items[0]) >= {"id", "amount", "category", "date", "description"}


def test_first_page_has_next_control_when_more_results_exist(client):
    for i in range(5):
        _create(client, category=f"C{i}")
    resp = client.get("/expenses?page=1&page_size=2")
    body = resp.json()
    assert len(body["items"]) == 2
    assert body["has_next"] is True


def test_next_page_continues_order_without_repeats_or_skips(client):
    for i in range(5):
        _create(client, category=f"C{i}")
    page1 = client.get("/expenses?page=1&page_size=2").json()["items"]
    page2 = client.get("/expenses?page=2&page_size=2").json()["items"]
    ids_seen = [i["id"] for i in page1] + [i["id"] for i in page2]
    assert len(ids_seen) == len(set(ids_seen))


def test_last_page_has_no_next_control(client):
    for i in range(3):
        _create(client, category=f"C{i}")
    resp = client.get("/expenses?page=2&page_size=2")
    assert resp.json()["has_next"] is False


def test_same_date_ties_are_stable_across_repeated_views(client):
    for i in range(3):
        _create(client, category=f"C{i}")
    first = client.get("/expenses").json()["items"]
    second = client.get("/expenses").json()["items"]
    assert [i["id"] for i in first] == [i["id"] for i in second]


def test_retrieval_failure_returns_error_without_partial_data(client):
    with patch("expense_tracker.service.list_expenses_page", side_effect=RuntimeError("db down")):
        resp = client.get("/expenses")
    assert resp.status_code == 500
    assert "items" not in resp.json()
