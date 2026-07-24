"""EXP-15: Spending summary by category/month — GET /expenses/summary."""


def _create(client, **overrides):
    payload = {"amount": 10, "category": "Food", "date": "2026-07-24", "description": "x"}
    payload.update(overrides)
    return client.post("/expenses", json=payload).json()


def test_group_by_category_sums_to_overall_total(client):
    _create(client, category="Food", amount=10)
    _create(client, category="Food", amount=5)
    _create(client, category="Travel", amount=20)

    resp = client.get("/expenses/summary?group_by=category")
    body = resp.json()
    totals = {row["key"]: row["total"] for row in body["totals"]}
    assert totals == {"Food": 15, "Travel": 20}
    assert body["overall_total"] == 35


def test_group_by_month_sums_to_overall_total(client):
    _create(client, date="2026-01-15", amount=10)
    _create(client, date="2026-02-15", amount=5)

    resp = client.get("/expenses/summary?group_by=month")
    body = resp.json()
    totals = {row["key"]: row["total"] for row in body["totals"]}
    assert totals == {"2026-01": 10, "2026-02": 5}
    assert body["overall_total"] == 15


def test_no_expenses_in_period_returns_empty_result_not_error(client):
    resp = client.get(
        "/expenses/summary?group_by=category&start_date=2099-01-01&end_date=2099-12-31"
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["totals"] == []
    assert body["overall_total"] == 0


def test_no_group_by_is_rejected(client):
    resp = client.get("/expenses/summary")
    assert resp.status_code == 422


def test_missing_category_bucketed_as_uncategorized(client):
    from expense_tracker.repository import insert_expense

    insert_expense(expense_id="seed-1", amount=7, category="", date="2026-07-24", description="x")
    resp = client.get("/expenses/summary?group_by=category")
    totals = {row["key"]: row["total"] for row in resp.json()["totals"]}
    assert totals["Uncategorized"] == 7


def test_month_boundary_expense_attributed_to_exactly_one_month(client):
    _create(client, date="2026-01-31", amount=10)
    _create(client, date="2026-02-01", amount=5)

    resp = client.get("/expenses/summary?group_by=month")
    totals = {row["key"]: row["total"] for row in resp.json()["totals"]}
    assert totals == {"2026-01": 10, "2026-02": 5}


def test_start_after_end_date_is_rejected(client):
    resp = client.get(
        "/expenses/summary?group_by=category&start_date=2026-12-31&end_date=2026-01-01"
    )
    assert resp.status_code == 422
