"""EXP-14: Budget Owner filters expenses by category and date range."""


def _create(client, **overrides):
    payload = {"amount": 10, "category": "Food", "date": "2026-07-24", "description": "x"}
    payload.update(overrides)
    return client.post("/expenses", json=payload).json()


def test_category_filter_returns_only_matching(client):
    _create(client, category="Food")
    _create(client, category="Travel")
    items = client.get("/expenses?category=Food").json()["items"]
    assert len(items) == 1
    assert items[0]["category"] == "Food"


def test_date_range_filter_is_inclusive_and_excludes_outside(client):
    _create(client, date="2026-01-01")
    _create(client, date="2026-06-15")
    _create(client, date="2026-12-31")
    items = client.get("/expenses?start_date=2026-01-01&end_date=2026-06-30").json()["items"]
    dates = {i["date"] for i in items}
    assert dates == {"2026-01-01", "2026-06-15"}


def test_combined_category_and_date_filter(client):
    _create(client, category="Food", date="2026-01-01")
    _create(client, category="Travel", date="2026-01-01")
    _create(client, category="Food", date="2026-12-31")
    items = client.get("/expenses?category=Food&start_date=2026-01-01&end_date=2026-06-30").json()[
        "items"
    ]
    assert len(items) == 1
    assert items[0]["category"] == "Food"
    assert items[0]["date"] == "2026-01-01"


def test_no_match_returns_empty_list_not_error(client):
    _create(client, category="Food")
    resp = client.get("/expenses?category=Nonexistent")
    assert resp.status_code == 200
    assert resp.json()["items"] == []


def test_start_after_end_date_is_rejected(client):
    resp = client.get("/expenses?start_date=2026-12-31&end_date=2026-01-01")
    assert resp.status_code == 422


def test_no_filters_returns_full_unfiltered_list(client):
    _create(client, category="Food")
    _create(client, category="Travel")
    items = client.get("/expenses").json()["items"]
    assert len(items) == 2


def test_boundary_dates_are_included(client):
    _create(client, date="2026-01-01")
    _create(client, date="2026-01-31")
    items = client.get("/expenses?start_date=2026-01-01&end_date=2026-01-31").json()["items"]
    assert len(items) == 2


def test_clearing_filters_returns_to_full_list(client):
    _create(client, category="Food")
    _create(client, category="Travel")
    filtered = client.get("/expenses?category=Food").json()["items"]
    assert len(filtered) == 1

    cleared = client.get("/expenses").json()["items"]
    assert len(cleared) == 2
