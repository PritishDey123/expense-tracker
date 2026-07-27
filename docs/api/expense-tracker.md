<!-- Last updated: 2026-07-27 -->

# Expense Tracker API

**Audience:** Developer

Reference documentation for the Expense Tracker REST API — the `/expenses`
resource, mounted at `router = APIRouter(prefix="/expenses", tags=["expenses"])`
in `src/expense_tracker/routers/expenses.py`.

## Authentication

**None** — this API has no authentication of any kind in v1. It is designed
for single-user local/trusted-network use only (single implicit user,
"Budget Owner"; no multi-tenancy). Do not expose this service to an untrusted
network without adding an authentication layer first.

## Pagination, rate limits, and idempotency

- **Pagination**: `GET /expenses` supports offset-style pagination via
  `page` and `page_size` query parameters (see below). There is no
  cursor-based pagination.
- **Rate limits**: None are implemented. No endpoint enforces a request
  rate limit.
- **Idempotency**: No idempotency keys are implemented anywhere in this API.
  Retrying a `POST /expenses` request with the same payload creates a
  duplicate expense record.

## Known gap

There is **no `GET /expenses/{expense_id}`** single-item lookup endpoint in
this API. Clients that need to read a single expense must currently do so by
paging through `GET /expenses` (or `GET /expenses/summary` for aggregate
data) and filtering client-side. This is a documented limitation, not an
oversight — track any future single-item read requirement as a separate
enhancement.

---

## GET /expenses

List expenses, most-recently-created first, with pagination and optional
category/date-range filters.

**Authentication:** None (see [Authentication](#authentication))

### Request

**Path parameters**

None.

**Query parameters**

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `page` | integer | No | `1` | Page number, 1-indexed. |
| `page_size` | integer | No | `20` | Number of items per page. |
| `category` | string | No | — | Exact-match filter on category. |
| `start_date` | string (date, `YYYY-MM-DD`) | No | — | Inclusive lower bound on expense date. |
| `end_date` | string (date, `YYYY-MM-DD`) | No | — | Inclusive upper bound on expense date. |

**Request body**

None.

### Responses

**200 OK**

Ordering is deterministic: `created_at DESC`, with `rowid DESC` as a
tiebreak, so no items are duplicated or skipped across pages.

```json
{
  "items": [
    {
      "id": "a3f1c2d4-5e6f-4a1b-8c9d-0e1f2a3b4c5d",
      "amount": 42.50,
      "category": "Groceries",
      "date": "2026-07-25",
      "description": "Weekly grocery run"
    },
    {
      "id": "b7e2d3c5-6f7a-4b2c-9d0e-1f2a3b4c5d6e",
      "amount": 18.00,
      "category": "Transport",
      "date": "2026-07-24",
      "description": "Monthly transit pass top-up"
    }
  ],
  "page": 1,
  "page_size": 20,
  "total": 37,
  "has_next": true
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `items` | array of `Expense` | Yes | Page of expense records. See fields below. |
| `items[].id` | string (uuid4) | Yes | Expense identifier. |
| `items[].amount` | number | Yes | Amount, rounded to 2 decimals. |
| `items[].category` | string | Yes | Expense category. |
| `items[].date` | string (date) | Yes | Expense date, `YYYY-MM-DD`. |
| `items[].description` | string | Yes | Free-text description. |
| `page` | integer | Yes | Echoed current page number. |
| `page_size` | integer | Yes | Echoed page size. |
| `total` | integer | Yes | Total matching records across all pages. |
| `has_next` | boolean | Yes | Whether a further page exists. |

**422 Unprocessable Entity** — `start_date` is after `end_date`

```json
{
  "detail": "start_date must not be after end_date"
}
```

**500 Internal Server Error** — retrieval failed; no partial page is returned

```json
{
  "detail": "Could not retrieve expenses"
}
```

### Example

```bash
curl -X GET "https://api.example.com/expenses?page=1&page_size=20&category=Groceries&start_date=2026-07-01&end_date=2026-07-31"
```

**Response:**
```json
{
  "items": [
    {
      "id": "a3f1c2d4-5e6f-4a1b-8c9d-0e1f2a3b4c5d",
      "amount": 42.50,
      "category": "Groceries",
      "date": "2026-07-25",
      "description": "Weekly grocery run"
    }
  ],
  "page": 1,
  "page_size": 20,
  "total": 1,
  "has_next": false
}
```

---

## GET /expenses/summary

Return total spending grouped by category or by month, within an optional
date range.

**Authentication:** None (see [Authentication](#authentication))

### Request

**Path parameters**

None.

**Query parameters**

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `group_by` | string enum (`"category"` \| `"month"`) | Yes | — | Grouping dimension. 422 if omitted or any other value. |
| `start_date` | string (date, `YYYY-MM-DD`) | No | — | Inclusive lower bound on expense date. |
| `end_date` | string (date, `YYYY-MM-DD`) | No | — | Inclusive upper bound on expense date. |

**Request body**

None.

Grouping rules:
- `group_by=category`: blank or `NULL` categories bucket into `"Uncategorized"`.
- `group_by=month`: expenses bucket by the date's `YYYY-MM` prefix; a
  boundary date (e.g. the last day of a month) lands in exactly one bucket.

### Responses

**200 OK**

```json
{
  "group_by": "category",
  "totals": [
    { "key": "Groceries", "total": 312.47 },
    { "key": "Transport", "total": 96.00 },
    { "key": "Utilities", "total": 210.15 }
  ],
  "overall_total": 618.62
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `group_by` | string | Yes | Echoes the requested grouping dimension. |
| `totals` | array of `SummaryRow` | Yes | One row per bucket. |
| `totals[].key` | string | Yes | Category name, `"Uncategorized"`, or `YYYY-MM` month string. |
| `totals[].total` | number | Yes | Sum of amounts in this bucket. |
| `overall_total` | number | Yes | Sum of all matching amounts across every bucket. |

**422 Unprocessable Entity** — `group_by` missing/invalid, or `start_date` is after `end_date`

```json
{
  "detail": "group_by must be one of: category, month"
}
```

```json
{
  "detail": "start_date must not be after end_date"
}
```

### Example

```bash
curl -X GET "https://api.example.com/expenses/summary?group_by=month&start_date=2026-01-01&end_date=2026-07-31"
```

**Response:**
```json
{
  "group_by": "month",
  "totals": [
    { "key": "2026-06", "total": 540.10 },
    { "key": "2026-07", "total": 618.62 }
  ],
  "overall_total": 1158.72
}
```

---

## POST /expenses

Record a new expense.

**Authentication:** None (see [Authentication](#authentication))

### Request

**Path parameters**

None.

**Query parameters**

None.

**Request body** (`application/json`)

```json
{
  "amount": 54.99,
  "category": "Utilities",
  "date": "2026-07-20",
  "description": "Electricity bill — July"
}
```

| Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `amount` | number | Yes | Must be > 0; rounded to 2 decimals | Expense amount. |
| `category` | string | Yes | Non-blank | Expense category (e.g. Groceries, Transport, Utilities). |
| `date` | string (date) | Yes | ISO 8601 `YYYY-MM-DD`; future dates are allowed | Date the expense occurred. |
| `description` | string | Yes | Non-blank | Free-text description. |

### Responses

**201 Created**

```json
{
  "id": "c9d4e5f6-7a8b-4c3d-9e0f-1a2b3c4d5e6f",
  "amount": 54.99,
  "category": "Utilities",
  "date": "2026-07-20",
  "description": "Electricity bill — July"
}
```

**422 Unprocessable Entity** — Validation error (standard FastAPI/Pydantic shape)

Raised for: zero or negative `amount`, blank `category`, blank `description`,
or an invalid `date` format.

```json
{
  "detail": [
    {
      "loc": ["body", "amount"],
      "msg": "ensure this value is greater than 0",
      "type": "value_error.number.not_gt"
    }
  ]
}
```

### Example

```bash
curl -X POST https://api.example.com/expenses \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 54.99,
    "category": "Utilities",
    "date": "2026-07-20",
    "description": "Electricity bill — July"
  }'
```

**Response:**
```json
{
  "id": "c9d4e5f6-7a8b-4c3d-9e0f-1a2b3c4d5e6f",
  "amount": 54.99,
  "category": "Utilities",
  "date": "2026-07-20",
  "description": "Electricity bill — July"
}
```

---

## PATCH /expenses/{expense_id}

Partially edit an existing expense — only fields present in the JSON payload
are validated and applied; omitted fields are left untouched.

**Authentication:** None (see [Authentication](#authentication))

### Request

**Path parameters**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `expense_id` | string (uuid4) | Yes | Identifier of the expense to edit. |

**Query parameters**

None.

**Request body** (`application/json`)

All fields are optional; include only the fields you want to change.

```json
{
  "amount": 60.00
}
```

| Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `amount` | number | No | If present, must be > 0; rounded to 2 decimals | New amount. |
| `category` | string | No | If present, non-blank | New category. |
| `date` | string (date) | No | If present, ISO 8601 `YYYY-MM-DD`; future dates allowed | New date. |
| `description` | string | No | If present, non-blank | New description. |

### Responses

**200 OK**

```json
{
  "id": "c9d4e5f6-7a8b-4c3d-9e0f-1a2b3c4d5e6f",
  "amount": 60.00,
  "category": "Utilities",
  "date": "2026-07-20",
  "description": "Electricity bill — July"
}
```

**404 Not Found** — expense with the given id does not exist

```json
{
  "detail": "Expense not found"
}
```

**422 Unprocessable Entity** — a field present in the payload fails validation (standard FastAPI/Pydantic shape)

```json
{
  "detail": [
    {
      "loc": ["body", "amount"],
      "msg": "ensure this value is greater than 0",
      "type": "value_error.number.not_gt"
    }
  ]
}
```

### Example

```bash
curl -X PATCH https://api.example.com/expenses/c9d4e5f6-7a8b-4c3d-9e0f-1a2b3c4d5e6f \
  -H "Content-Type: application/json" \
  -d '{ "amount": 60.00 }'
```

**Response:**
```json
{
  "id": "c9d4e5f6-7a8b-4c3d-9e0f-1a2b3c4d5e6f",
  "amount": 60.00,
  "category": "Utilities",
  "date": "2026-07-20",
  "description": "Electricity bill — July"
}
```

---

## DELETE /expenses/{expense_id}

Permanently delete an expense. This is a hard delete — there is no
soft-delete or undo capability.

**Authentication:** None (see [Authentication](#authentication))

### Request

**Path parameters**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `expense_id` | string (uuid4) | Yes | Identifier of the expense to delete. |

**Query parameters**

None.

**Request body**

None.

### Responses

**204 No Content** — deletion succeeded; response body is empty.

**404 Not Found** — expense with the given id does not exist

```json
{
  "detail": "Expense not found"
}
```

### Example

```bash
curl -X DELETE https://api.example.com/expenses/c9d4e5f6-7a8b-4c3d-9e0f-1a2b3c4d5e6f
```

**Response:** `204 No Content` (empty body)
