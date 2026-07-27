<!-- Last updated: 2026-07-27 -->

# ADR 0002 — React + Vite single-page frontend, served via dev-time API proxy

**Status:** Accepted
**Date:** 2026-07-27
**Deciders:** Developer agent (implementation), Project owner pritish.dey@triedatum.com (approved via PR review per handoff manifests)
**PR / Story:** EXP-17 through EXP-22 (see `handoffs/EXP-17.json` through `handoffs/EXP-22.json` in the target project, and commits `d681751`, `0a597fa`, `ce8c9ae`, `44feace`, `e8d3132`, `7b6d291` on https://github.com/PritishDey123/expense-tracker.git)
**Supersedes:** —

## Context

`idea.md` scoped v1 as "REST API first; a UI can be added later as a separate
story/epic once the API is stable" ([ADR 0001](0001-raw-sqlite-no-orm.md)
covers the backend persistence decision made under that same scope). By
EXP-16 the API surface (create, list, edit, delete, filter, summary) was
implemented and stable, so the UI epic was picked up as its own set of
stories (EXP-17 through EXP-22). A decision was needed on frontend stack,
project layout relative to the existing backend, and how the frontend talks
to the API in local development, given the backend has no auth and no CORS
configuration of its own.

## Decision

Build the UI as a standalone React 19 + TypeScript single-page app in a
sibling `frontend/` directory, scaffolded with Vite and its official
`@vitejs/plugin-react` plugin. State is managed with local component state
and two data-fetching hooks (`useExpenses`, `useSummary`) that call a thin
typed API client (`src/api/client.ts` + `src/api/types.ts`) — no external
state-management or data-fetching library (e.g. Redux, React Query) was
added. In development, Vite's dev server proxies requests under `/expenses`
to `http://localhost:8000` (configured in `vite.config.ts`), so the frontend
calls same-origin relative paths (`/expenses`, `/expenses/summary`, etc.)
and never hard-codes a backend host — this avoids needing CORS
configuration on the FastAPI side during local development.

> TODO: verify — no production build/deploy configuration exists yet
> (`PROJECT.md` lists `environments: []`), so how the built `frontend/dist`
> assets would be served alongside the API in production (e.g. reverse
> proxy, static file mount, or a separate origin requiring CORS) is not yet
> decided.

## Alternatives considered

### Option A — React + Vite, standalone `frontend/` dir, dev-proxy to backend (chosen)
**Pros:** Vite's dev server + HMR gives fast local iteration; TypeScript
gives the API client and component props static typing that mirrors the
Pydantic models on the backend; the dev proxy means zero CORS setup is
needed anywhere in the app; keeping frontend and backend as separate
top-level directories matches the "REST API first, UI added later as a
separate epic" scoping from `idea.md` — the UI can be deployed, replaced, or
removed independently of the API.
**Cons:** two separate toolchains (`uv` for Python, `npm` for the frontend)
in one repo; no shared types between Pydantic models and TypeScript types —
`api/types.ts` is hand-maintained and can drift from `models.py` if either
changes without the other.
**Why chosen:** matches the project's actual scope (single-user, no
multi-tenant complexity) and the explicit "separate story/epic" framing in
`idea.md` without introducing infrastructure (a BFF, a shared schema
codegen pipeline) the project doesn't yet need.

### Option B — Server-rendered UI from FastAPI (e.g. Jinja2 templates)
**Pros:** one process, one toolchain, no separate dev server or build step,
no CORS/proxy concerns at all.
**Cons:** loses client-side interactivity (inline editing, filter controls
updating the list without a full page reload) without significant extra
JS; mixes presentation concerns into the same service that owns the REST
API, working against the "REST API first" scoping that treated the UI as a
separate concern.
**Why rejected:** the envisioned capabilities (inline edit, filters,
summary view) are inherently interactive; a template-rendered UI would
need a comparable amount of client-side JS anyway, without the toolchain
benefits (typed API client, component tests, HMR) Vite/React provide.

### Option C — React Query / Redux for data fetching and state
**Pros:** built-in caching, request deduplication, and background refetch
patterns that scale to larger apps.
**Cons:** adds a dependency and abstraction layer for an app with two data
shapes (a paginated list and a summary) and no shared/cross-component state
beyond what `App.tsx` already passes down as props.
**Why rejected:** the two custom hooks (`useExpenses`, `useSummary`) cover
the app's actual data-fetching needs in isolation and are simple enough to
test directly; adding a library for caching/invalidation semantics the app
doesn't exercise (single user, no concurrent multi-tab writes handled) would
be disproportionate at current scope.

## Consequences

**Positive:**
- Frontend and backend can be developed, tested, and deployed independently
  — the frontend has its own `package.json`, test suite (Vitest +
  Testing Library), and lint config (`oxlint`), separate from the backend's
  `pyproject.toml`/`ruff`/`pytest`.
- No CORS configuration needed anywhere in the stack during local
  development, because the Vite dev proxy makes all API calls same-origin.
- The typed API client (`api/client.ts`, `api/types.ts`) gives every
  component a single, typed point of contact with the backend, isolating
  `fetch` calls and error handling (`ApiError`) from UI components.

**Negative / accepted tradeoffs:**
- Two toolchains and two dependency lockfiles (`uv.lock`, `frontend/package-lock.json`)
  to keep in sync when either side changes.
- `frontend/src/api/types.ts` is hand-written and not generated from the
  backend's Pydantic models — a backend schema change requires a matching
  manual edit on the frontend side, with no automated drift check between
  the two today.
- No production serving strategy is decided yet (see `> TODO: verify`
  above) — the dev proxy setup does not by itself describe how the app runs
  outside local development.

**Risks to monitor:**
- If the API surface grows or changes shape frequently, the hand-maintained
  `api/types.ts` is a manual-drift risk — watch for divergence between it
  and `src/expense_tracker/models.py`, and consider schema codegen if this
  becomes a recurring source of bugs.
- A production deployment/serving decision (reverse proxy vs. separate
  origin with CORS) is still open and should be captured in its own ADR
  once `PROJECT.md`'s `environments` list is populated.

## Related decisions

- [ADR 0001 — Raw sqlite3 persistence, no ORM or migration framework](0001-raw-sqlite-no-orm.md)
