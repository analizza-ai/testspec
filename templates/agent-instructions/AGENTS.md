# testspec — Agent instructions (unified)

This project uses **@analizza-ai/testspec** (SDT — Spec Driven Test).

## Generate tests.md

```bash
testspec generate [--change <name>] [--api] [--no-stubs]
```

Reads SDD spec artifacts → builds a prompt → writes `tests.md` + optional test stubs.

## SDD framework: OpenSpec

Artifacts are in `openspec/changes/{change-name}/`:
- `proposal.md` — intent, non-goals, scope
- `design.md` — API contracts, DB schema
- `specs/**/*.md` — behaviour, scenarios, rules
- `tasks.md` — implementation boundary
- `tests.md` — **output**: CT-01..N test cases (written by testspec)

## tests.md CT structure

| Field               | Description                              |
|---------------------|------------------------------------------|
| Type                | unit / integration / e2e / load / chaos  |
| Layer               | developer / qa / chaos                   |
| Precondition        | Required system state before the test    |
| Input               | Request body / method params             |
| Expected output     | HTTP response / return value             |
| DB validation       | SQL query or description of DB state     |
| Acceptance criteria | Bullet checklist from spec               |

## Other commands

```bash
testspec validate --results <test-results.json>  # map pass/fail to CTs
testspec report                                   # gap: which CTs have no stub
```
