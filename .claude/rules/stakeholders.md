# Stakeholders — Expense Tracker

Single-user, no-auth v1. There is exactly one story actor.

## Business roles (story actors)

| Canonical role | Description | Notes |
| --- | --- | --- |
| Budget Owner | The single implicit user of this app who records and reviews their own expenses. | No multi-tenancy in v1 — one Budget Owner per deployment. |

## Roles that are NOT valid story actors

| Invalid | Correct replacement |
| --- | --- |
| User | Budget Owner |
| Admin | Budget Owner (no admin/user distinction in v1) |
| System | Not a story actor — describe the outcome for the Budget Owner |

## Stakeholder contact map

| Role | Requirement owner | Contact method |
| --- | --- | --- |
| Budget Owner | Project owner (pritish.dey@triedatum.com) | Direct — sole stakeholder for v1 |

## Adding a new role

Not expected until multi-user/auth is introduced in a later version. When it is, add the new role here before any story uses it.
