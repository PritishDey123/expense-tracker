# PROJECT.md — Expense Tracker

Configuration for the TrieDatum Agentic SDLC agents operating on this repo.

```yaml
# === Project identity ===
project_name: expense-tracker
project_owner: pritish.dey@triedatum.com
repo_url: https://github.com/PritishDey123/expense-tracker.git

# === Ticket system (see tdm-aisdlc-shared/.claude/rules/ticketing.md) ===
ticket_system: plane
ticket_prefix: EXP
ticket_mcp: mcp__plane

# === Plane-specific config (only when ticket_system: plane) ===
# Non-secret connection details only — API key stays in PLANE_API_KEY env var.
# Ticket is primary for Plane (manifest is the fallback) — see
# tdm-aisdlc-shared/.claude/rules/handoff-protocol.md#plane-integration
plane:
  workspace_slug: tdworkspace
  project_id: 5a087632-ff87-4a53-83a5-9f1aaf067a82
  master_work_item_id: cca6e52d-7912-45c3-925b-17def23d1231

# === Workflow state names (canonical → Plane state names in this project) ===
workflow_states:
  Raw / Inbox: Backlog
  Ready for Planning: Backlog
  Planning: Backlog
  Ready for Dev: Ready for Dev
  In Progress: In Progress
  In Review: In Review
  Needs Standards Fix: Needs Standards Fix
  Bug Open: Bug Open
  Blocked: Blocked
  Done: Done

# === Source control ===
default_branch: main
protected_branches: [main]
pr_template: null

# === Languages in scope ===
languages:
  - python

# === Per-language overrides ===
python:
  line_length: 100
  test_framework: pytest
  package_manager: uv

# === Standards & quality ===
component_size_ceiling: 100
component_size_target: 50
coverage_target: 85

# === Tooling commands (the blessed entrypoints; agents must use these) ===
lint_command: uv run ruff check .
format_command: uv run ruff format .
test_command: uv run pytest
security_scan_command: uv run pip-audit

# === Environments / connectivity ===
environments: []

# === Secrets layer (see tdm-aisdlc-shared/.claude/rules/secrets.md) ===
secrets_layer: env-file

# === MCP servers wired into this project's workspace ===
mcp_servers:
  required:
    - mcp__plane
    - mcp__filesystem
    - mcp__git
  optional: []

# === Solution Architect outputs (used by ea-alignment.md) ===
design_docs_root: docs/design
adr_root: docs/adr

# === Human-in-the-loop overrides ===
human_review:
  every_pr: true
  exempt_for_bug_fix: false
```

## Free-form sections

### Architecture notes

Basic single-user expense tracker. Backend: Python + FastAPI, SQLite as the
datastore (single file, no external DB service needed). No auth/multi-tenant
requirements for v1 — single implicit user. REST API first; a UI can be
added later as a separate story/epic once the API is stable.

### What this framework should NOT touch

(none yet — greenfield project)

### Contact points

- Project owner: pritish.dey@triedatum.com
