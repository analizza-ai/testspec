# testspec — Spec Driven Test context for GitHub Copilot

This project uses **testspec** (`@analizza-ai/testspec`) to generate `tests.md` from SDD spec artifacts.

## How to generate tests.md

Run in terminal:
```bash
testspec generate
```

This prints a structured prompt. Paste it here (in Copilot Chat) and I will generate the full `tests.md`.

## tests.md format

```
---
feature: <name>
change: <change-folder>
generated: <ISO timestamp>
sdd: openspec
sdt: <version>
stack: { lang, db }
---

# Tests — <feature>

## Scope
## Out of scope

## Test cases

### CT-01 — <title>
| Field               | Value |
|---------------------|-------|
| Type                | unit / integration / e2e / load / chaos |
| Layer               | developer / qa / chaos |
| Precondition        | ... |
| Input               | ... |
| Expected output     | ... |
| DB validation       | ... |
| Acceptance criteria | · bullet |

## Load profile hints
## Chaos scenarios
```

## SDD artifact locations (OpenSpec)
- `openspec/changes/{name}/proposal.md`
- `openspec/changes/{name}/design.md`
- `openspec/changes/{name}/specs/**/*.md`
- `openspec/changes/{name}/tasks.md`
