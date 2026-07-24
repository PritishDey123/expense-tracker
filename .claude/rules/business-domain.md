# Business Domain Knowledge — Expense Tracker

Canonical glossary and business-rules reference for this project. Read
before writing any story title or acceptance criterion.

## Core Entities

| Term | Definition |
| --- | --- |
| Expense | A single recorded outlay: amount, category, date, and description. The core resource of this app. |
| Category | A label classifying an Expense (e.g. Groceries, Transport, Utilities). Free-text in v1 — no fixed taxonomy enforced. |
| Summary | An aggregation of Expenses grouped by Category or by Month, computed on demand (not a stored entity). |

## Business Rules

Greenfield project — no rules pre-exist. Rules below are the v1 defaults;
flag before changing them.

| Rule | Value | Notes |
| --- | --- | --- |
| Currency | Single implicit currency, no conversion | No multi-currency support in v1 |
| Amount | Must be a positive number | Zero or negative amounts are invalid |
| Deletion | Hard delete | No soft-delete / undo in v1 |
| Ownership | Single implicit user, no auth | No multi-tenancy in v1 |

## State Machines

None — Expense has no lifecycle/status field in v1 (create/read/update/delete only).

## Usage in stories

- Role names in story titles come from [`stakeholders.md`](stakeholders.md).
- "Expense" and "Category" are capitalised as proper nouns in acceptance criteria.
- Business rules above are acceptance-criterion **inputs** ("Given the Expense amount is a positive number"), not outputs.
