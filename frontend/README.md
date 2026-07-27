<!-- Last updated: 2026-07-27 -->

# expense-tracker frontend

**Audience:** Developer

A React 19 + TypeScript + Vite single-page app that is the UI for the
expense-tracker REST API — record, list, edit, delete, filter, and
summarize expenses.

## Contents
- [Overview](#overview)
- [Getting started](#getting-started)
- [Architecture](#architecture)
- [API](#api)
- [Configuration](#configuration)
- [Runbook](#runbook)
- [Contributing](#contributing)

## Overview

This is the browser client for the expense-tracker service (see the
[root README](../README.md) for the backend). It renders a two-panel
layout — a fixed "ledger stub" (this month's total, filters, spending
summary) and a scrolling "tape" of expense entries — and talks to the
backend's `/expenses` REST API for all data. It was added over stories
EXP-17 through EXP-22 (tracked in Plane), covering create, edit, delete,
filter, and summary views on top of the existing API.

## Getting started

### Prerequisites
- Node.js and npm (no specific version is pinned in `package.json` or a
  `.nvmrc`/`.node-version` file — use a current LTS Node release)
- The expense-tracker backend running separately (see the
  [root README](../README.md#getting-started)) — the frontend has no
  built-in mock/offline mode

### Local setup
```bash
cd frontend
npm install

# Start the backend first, in a separate terminal, from the repo root:
# uv run uvicorn expense_tracker.app:app --reload

# Then start the dev server
npm run dev
```

The dev server (Vite) proxies any request to `/expenses` to
`http://localhost:8000` (configured in `vite.config.ts`), so the backend
must already be listening on port 8000 for the app to load or save any
data.

### Running tests
```bash
npx vitest run
```

`package.json` has no `test` script defined, so `vitest` must be invoked
directly via `npx`. Tests run under `jsdom` (configured in
`vite.config.ts`'s `test` block) with a shared setup file at
`src/test/setup.ts`. Component test files sit alongside their
components (e.g. `src/components/ExpenseRow.test.tsx`). To run in watch
mode instead, use `npx vitest`.

### Build and lint
```bash
npm run build   # tsc -b && vite build — type-checks then produces a production bundle
npm run lint    # oxlint
npm run preview # serves the production build locally
```

## Architecture

The app is a single page with no client-side router — one root component
(`App.tsx`) owns the expense list and filter state, and passes data and
callbacks down to presentational components.

**Key components:**
| Component | Responsibility |
|---|---|
| `src/App.tsx` | App shell — owns filters and expense list state, wires create/edit/delete handlers into the API client |
| `src/hooks/useExpenses.ts` | Loads a paginated, filterable expense list; resets to page 1 when filters change; exposes `loadMore` for pagination |
| `src/hooks/useSummary.ts` | Loads spending totals grouped by category or month; reloads when its params change |
| `src/api/client.ts` | Typed fetch wrapper (`listExpenses`, `createExpense`, `editExpense`, `deleteExpense`, `getSummary`) and the `ApiError` class carrying the server's error message and status |
| `src/api/types.ts` | Shared TypeScript types mirroring the backend's request/response schemas (`Expense`, `ExpenseListResponse`, `SummaryResponse`, etc.) |
| `src/components/LedgerStub.tsx` | Fixed left panel: this month's running total, filter controls, and the spending summary |
| `src/components/Tape.tsx` | Scrolling right panel: renders the expense rows (or the empty/error state), and triggers `loadMore` via an `IntersectionObserver` sentinel when the last row scrolls into view |
| `src/components/ExpenseRow.tsx` | One read-only tape entry: date, category, description, amount, and Edit/Delete buttons |
| `src/components/EditableExpenseRow.tsx` | Toggles a tape row between its read-only view, the inline edit form, and the delete confirmation |
| `src/components/NewExpenseForm.tsx` | Form to record a new expense, with inline validation (amount > 0, category and description required) |
| `src/components/ExpenseEditForm.tsx` | Inline edit form for one row, pre-filled with its current values |
| `src/components/DeleteConfirm.tsx` | Inline delete confirmation shown in place of a tape row |
| `src/components/FilterControls.tsx` | Category and date-range filter inputs; validates that the start date is not after the end date |
| `src/components/SummaryPanel.tsx` | Category/month spending breakdown with a grouping toggle, shown inside the ledger stub |
| `src/components/EmptyState.tsx` | Shown when there are no expenses at all |
| `src/components/ErrorBanner.tsx` | Renders an API or validation error message |

**External dependencies:**
| System | Purpose | Notes |
|---|---|---|
| expense-tracker backend API | All expense and summary data — no local persistence in the frontend | Reached at `/expenses` and `/expenses/summary`; proxied to `http://localhost:8000` in dev via `vite.config.ts`. |

> TODO: verify — there is no Dockerfile, nginx config, or other production
> deployment configuration in this repo, so how `/expenses` requests would
> reach the backend outside of the dev proxy (e.g. same-origin reverse
> proxy in production) is not yet established.

> TODO: verify — no architecture diagram exists yet for this app.

## API

The frontend consumes the same `/expenses` REST API described in the
backend docs — it does not define or expose any API of its own.

[Full API reference](../docs/api/expense-tracker.md)

## Configuration

| Variable | Required | Default | Description |
|---|---|---|---|
| — | — | — | The frontend reads no environment variables of its own. The backend URL is fixed by the Vite dev proxy (`/expenses` → `http://localhost:8000`) in `vite.config.ts`; there is no `.env`-driven API base URL. |

## Runbook

No runbook exists yet for this app — see the
[root README's Runbook section](../README.md#runbook) for why (no
configured production environment). A runbook should be created via
`runbook-writer` once a production environment is configured for the
frontend.

## Contributing

There is no separate contributing guide for the frontend. Follow the
[root README's Contributing section](../README.md#contributing), substituting
the frontend-specific test/lint commands above (`npx vitest run`, `npm run
lint`) for the backend ones.
