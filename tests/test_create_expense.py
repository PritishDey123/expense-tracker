"""EXP-10: Budget Owner records a new expense — POST /expenses."""


def test_happy_path_creates_expense(client):
    resp = client.post(
        "/expenses",
        json={
            "amount": 12.50,
            "category": "Food",
            "date": "2026-07-24",
            "description": "Lunch",
        },
    )
    assert resp.status_code == 201
    body = resp.json()
    assert body["amount"] == 12.50
    assert body["category"] == "Food"
    assert body["date"] == "2026-07-24"
    assert body["description"] == "Lunch"
    assert body["id"]


def test_rejects_zero_amount(client):
    resp = client.post(
        "/expenses",
        json={
            "amount": 0,
            "category": "Food",
            "date": "2026-07-24",
            "description": "x",
        },
    )
    assert resp.status_code == 422


def test_rejects_negative_amount(client):
    resp = client.post(
        "/expenses",
        json={
            "amount": -5,
            "category": "Food",
            "date": "2026-07-24",
            "description": "x",
        },
    )
    assert resp.status_code == 422


def test_rejects_blank_category(client):
    resp = client.post(
        "/expenses",
        json={
            "amount": 10,
            "category": "",
            "date": "2026-07-24",
            "description": "x",
        },
    )
    assert resp.status_code == 422


def test_accepts_future_dated_expense(client):
    resp = client.post(
        "/expenses",
        json={
            "amount": 10,
            "category": "Food",
            "date": "2099-01-01",
            "description": "x",
        },
    )
    assert resp.status_code == 201


def test_rejects_blank_description(client):
    resp = client.post(
        "/expenses",
        json={
            "amount": 10,
            "category": "Food",
            "date": "2026-07-24",
            "description": "",
        },
    )
    assert resp.status_code == 422


def test_rounds_amount_to_two_decimals(client):
    resp = client.post(
        "/expenses",
        json={
            "amount": 10.126,
            "category": "Food",
            "date": "2026-07-24",
            "description": "x",
        },
    )
    assert resp.status_code == 201
    assert resp.json()["amount"] == 10.13


def test_created_expense_appears_in_repository_list(client):
    resp = client.post(
        "/expenses",
        json={
            "amount": 20,
            "category": "Travel",
            "date": "2026-07-24",
            "description": "Cab",
        },
    )
    created_id = resp.json()["id"]

    from expense_tracker.repository import list_expenses

    rows = list_expenses()
    assert any(r["id"] == created_id and r["category"] == "Travel" for r in rows)
