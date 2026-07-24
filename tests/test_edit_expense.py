"""EXP-12: Budget Owner edits an existing expense — PATCH /expenses/{id}."""


def _create(client, **overrides):
    payload = {"amount": 10, "category": "Food", "date": "2026-07-24", "description": "Lunch"}
    payload.update(overrides)
    return client.post("/expenses", json=payload).json()


def test_happy_path_updates_all_fields(client):
    created = _create(client)
    resp = client.patch(
        f"/expenses/{created['id']}",
        json={"amount": 25, "category": "Travel", "date": "2026-07-01", "description": "Cab"},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["amount"] == 25
    assert body["category"] == "Travel"
    assert body["date"] == "2026-07-01"
    assert body["description"] == "Cab"


def test_rejects_zero_or_negative_amount_and_keeps_original(client):
    created = _create(client, amount=10)
    resp = client.patch(f"/expenses/{created['id']}", json={"amount": 0})
    assert resp.status_code == 422

    unchanged = client.get("/expenses").json()["items"][0]
    assert unchanged["amount"] == 10


def test_editing_nonexistent_expense_fails_cleanly(client):
    resp = client.patch("/expenses/does-not-exist", json={"amount": 5})
    assert resp.status_code == 404


def test_single_field_edit_leaves_other_fields_unchanged(client):
    created = _create(client, category="Food", amount=10, description="Lunch")
    resp = client.patch(f"/expenses/{created['id']}", json={"category": "Groceries"})
    body = resp.json()
    assert body["category"] == "Groceries"
    assert body["amount"] == 10
    assert body["description"] == "Lunch"
    assert body["date"] == created["date"]


def test_rejects_blank_description_and_keeps_original(client):
    created = _create(client, description="Lunch")
    resp = client.patch(f"/expenses/{created['id']}", json={"description": ""})
    assert resp.status_code == 422

    unchanged = client.get("/expenses").json()["items"][0]
    assert unchanged["description"] == "Lunch"


def test_rejects_invalid_date_and_keeps_original(client):
    created = _create(client, date="2026-07-24")
    resp = client.patch(f"/expenses/{created['id']}", json={"date": "not-a-date"})
    assert resp.status_code == 422

    unchanged = client.get("/expenses").json()["items"][0]
    assert unchanged["date"] == "2026-07-24"


def test_expense_unchanged_when_no_edit_submitted(client):
    created = _create(client)
    unchanged = client.get("/expenses").json()["items"][0]
    assert unchanged == created
