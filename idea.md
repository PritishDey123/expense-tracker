# Idea — Expense Tracker

A basic single-user expense tracker.

## Summary

- Backend: Python + FastAPI
- Datastore: SQLite (single file, no external DB service needed)
- No auth / multi-tenant requirements for v1 — single implicit user
- REST API first; a UI can be added later as a separate story/epic once the
  API is stable

## Capabilities envisioned (not yet decomposed into stories)

- Record a new expense (amount, category, date, description)
- View list of past expenses
- Edit an existing expense
- Delete an expense
- Filter expenses by category and date range
- View a spending summary by category and by month


