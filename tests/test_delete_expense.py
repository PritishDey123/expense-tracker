"""EXP-13: Budget Owner deletes an expense — DELETE /expenses/{id}."""


def _create(client, **overrides):
    payload = {"amount": 10, "category": "Food", "date": "2026-07-24", "description": "Lunch"}
    payload.update(overrides)
    return client.post("/expenses", json=payload).json()


def test_happy_path_removes_expense_permanently(client):
    created = _create(client)
    resp = client.delete(f"/expenses/{created['id']}")
    assert resp.status_code == 204

    remaining = client.get("/expenses").json()["items"]
    assert all(i["id"] != created["id"] for i in remaining)


def test_expense_unchanged_when_delete_not_called(client):
    created = _create(client)
    unchanged = client.get("/expenses").json()["items"][0]
    assert unchanged == created


def test_deleting_nonexistent_expense_returns_clear_error(client):
    _create(client, category="Untouched")
    resp = client.delete("/expenses/does-not-exist")
    assert resp.status_code == 404

    remaining = client.get("/expenses").json()["items"]
    assert len(remaining) == 1
    assert remaining[0]["category"] == "Untouched"


def test_deleted_expense_is_not_found_on_view_or_edit(client):
    created = _create(client)
    client.delete(f"/expenses/{created['id']}")

    assert client.patch(f"/expenses/{created['id']}", json={"amount": 5}).status_code == 404
    remaining = client.get("/expenses").json()["items"]
    assert all(i["id"] != created["id"] for i in remaining)


def test_deleting_one_expense_leaves_others_unaffected(client):
    a = _create(client, category="A")
    b = _create(client, category="B")
    client.delete(f"/expenses/{a['id']}")

    remaining = client.get("/expenses").json()["items"]
    assert len(remaining) == 1
    assert remaining[0]["id"] == b["id"]
