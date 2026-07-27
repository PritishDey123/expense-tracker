<!-- Last updated: 2026-07-27 -->

# ADR 0001 — Raw sqlite3 persistence, no ORM or migration framework

**Status:** Accepted
**Date:** 2026-07-27
**Deciders:** Developer agent (implementation), Project owner pritish.dey@triedatum.com (approved via PR review per handoff manifests)
**PR / Story:** EXP-10 through EXP-16 (see `handoffs/EXP-10.json` through `handoffs/EXP-16.json` in the target project, and commit `bedac9e` on https://github.com/PritishDey123/expense-tracker.git)
**Supersedes:** —

## Context

expense-tracker is a single-user application — no auth, no multi-tenancy; the
"Budget Owner" is the sole actor — built as a greenfield FastAPI service whose
only persistence need is a simple `expenses` resource (amount, category, date,
description). There is no existing infrastructure to integrate with, and the
project's own idea document scoped the datastore explicitly as "SQLite (single
file, no external DB service needed)". The team building it is small — a
single agentic developer plus one human reviewer — with a component size
ceiling of 100 lines per component and an 85% coverage target, so any added
dependency or abstraction layer needed to earn its place against a genuinely
simple schema surface (one table). A decision was needed before any endpoint
could read or write expense data.

## Decision

Use Python's stdlib `sqlite3` module directly for all persistence — no ORM
(e.g. no SQLAlchemy) and no migration framework (e.g. no Alembic). A single
`expenses` table is created idempotently via `CREATE TABLE IF NOT EXISTS` in
`db.py:init_db()`, invoked from the FastAPI `lifespan` startup hook in
`app.py`, so schema exists automatically on startup with no manual migration
step. All raw SQL is isolated to one data-access module, `repository.py`;
routers and the service layer never issue SQL directly. The database file
path is a single module-level variable in `db.py`, overridable via the
`EXPENSE_TRACKER_DB_PATH` environment variable.

## Alternatives considered

### Option A — Raw `sqlite3` stdlib, no ORM (chosen)
**Pros:** zero added dependencies; SQL fully visible and auditable in one
file; trivial to reason about for a single-table schema; fastest path to
implementation and test given the 100-line component ceiling.
**Cons:** no schema migration tooling; any future column/table change needs
a hand-written migration step; no query builder to lean on if the schema
grows.
**Why chosen:** matches the project's actual scope — one table, one user, no
external DB service — without paying for abstraction the app doesn't need.

### Option B — SQLAlchemy (Core or ORM) with Alembic migrations
**Pros:** schema migrations are version-controlled and repeatable via
Alembic; richer query building; would ease a future move to Postgres or
another networked database.
**Cons:** adds a dependency and an abstraction layer disproportionate to a
single-table, single-user app; more boilerplate (models, session
management, migration scripts) for no functional gain at current scope.
**Why rejected:** the project's `idea.md` explicitly scoped out an external
DB service, and the schema surface (one table) doesn't yet justify
migration tooling or an ORM's query layer.

### Option C — Managed/external database (Postgres, MySQL)
**Pros:** production-grade concurrency handling; easier horizontal scaling;
mature operational tooling.
**Cons:** requires provisioning and operating separate infrastructure,
directly contradicting the project's explicit "SQLite, no external DB
service needed" scope for a single-user local app.
**Why rejected:** disproportionate to v1 scope — there is no multi-user or
concurrency requirement to justify the operational cost.

## Consequences

**Positive:**
- Zero external infrastructure to provision or operate — the entire
  datastore is one file.
- Trivial local setup: `uv sync` and run, no DB server to start.
- SQL is centralized in `repository.py`, making it easy to audit and test in
  isolation; each test gets its own isolated tmp SQLite file via the
  `client` fixture, so tests stay fast and independent.

**Negative / accepted tradeoffs:**
- No schema migration tooling: `CREATE TABLE IF NOT EXISTS` only creates a
  table that doesn't yet exist — it does not evolve an existing one, so any
  future schema change (e.g. a new column) requires a hand-written,
  backward-compatible `ALTER TABLE` or data-migration step.
- The module-level `_active_db_path` global in `db.py` is not
  thread-safe/concurrency-safe by design — acceptable for the current
  single-user use case, but would need rework before any multi-user or
  concurrent-write scenario.
- No connection pooling.

**Risks to monitor:**
- If the project later needs multi-user support, concurrent writes, or a
  migration off SQLite to a networked database, this decision will need to
  be revisited — most likely superseded by a future ADR introducing an ORM
  and a migration tool at that point. Watch for: growth in schema
  complexity beyond the single `expenses` table, or any requirement change
  that reintroduces the auth/multi-tenancy scope currently excluded per
  `stakeholders.md`.

## Related decisions

- None — this is the first ADR recorded for this project.
