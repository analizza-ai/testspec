# @analizza-ai/testspec

[![npm](https://img.shields.io/npm/v/@analizza-ai/testspec)](https://www.npmjs.com/package/@analizza-ai/testspec)
[![CI](https://github.com/analizza-ai/testspec/actions/workflows/ci.yml/badge.svg)](https://github.com/analizza-ai/testspec/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/@analizza-ai/testspec)](./LICENSE)
[![node](https://img.shields.io/node/v/@analizza-ai/testspec)](./package.json)

**Spec Driven Testing — the test layer for SDD**

> `Spec Driven Development` — Unit tests · Integration tests · Testcontainers
> `Spec Driven Testing` — End-to-end · Load · Chaos Engineering · UI · Exploratory

testspec installs 4 Claude Code slash commands that cover the full SDT lifecycle — from developer tests to QA automation. Specs are the single source of truth. Tests are derived, never invented.

---

## Test pyramid

<img width="521" height="478" alt="image" src="https://github.com/user-attachments/assets/a07d3ab0-8cd9-4746-b59a-bb8ea2773f63" />

```
┌─────────────────────────────────────────────────┐
│              CHAOS ENGINEERING                  │  ← /testspec-run-qa
│         (resilience · DR · fault injection)     │
├─────────────────────────────────────────────────┤
│               QA LAYER                          │  ← /testspec-specify-qa → /testspec-apply-qa
│     end-to-end tests · load tests (k6/Gatling)  │
├─────────────────────────────────────────────────┤
│             DEVELOPER LAYER                     │  ← /testspec-generate
│   unit tests · integration tests (Testcontainers│
│   PostgreSQL · Kafka · etc.)                    │
└─────────────────────────────────────────────────┘
         All layers driven by: tests.md
         tests.md driven by: spec.md + proposal.md + design.md
```

---

## Full development + test flow

```mermaid
flowchart TD
    IDEA["💡 Idea / Demand"]

    IDEA --> PROPOSE

    subgraph OPENSPEC["OpenSpec — Spec-Driven Development (app repo)"]
        PROPOSE["/opsx:propose\nDescribes what will be built"]

        PROPOSE --> PROPOSAL["proposal.md\nIntent · Goals · Non-goals"]
        PROPOSE --> SPECS["specs/{feature}/spec.md\nWhat the system must do"]
        PROPOSE --> DESIGN["design.md\nHow — Architecture · Contracts · Decisions"]

        PROPOSAL --> TESTS_CMD
        SPECS    --> TESTS_CMD
        DESIGN   --> TESTS_CMD

        TESTS_CMD["/testspec-generate\nConsolidates specs and generates test cases"]
        TESTS_CMD --> TESTS_MD["tests.md\nCT-01..N · Happy path · Business rules · DB"]

        TESTS_MD --> TASKS["tasks.md\nTasks in chunks of up to 2h"]
    end

    TASKS --> APPLY

    subgraph IMPL["Implementation (app repo)"]
        APPLY["/opsx:apply\nExecutes tasks from the change"]
        APPLY --> CODE["Code · Migrations · Integration tests"]
        CODE --> VERIFY["Testcontainers\nPostgreSQL + Kafka"]
    end

    VERIFY --> ARCHIVE["/opsx:archive\nChange archived as complete"]

    ARCHIVE --> SPECIFY_QA

    subgraph QA["Autonomous QA (separate QA repo)"]
        SPECIFY_QA["/testspec-specify-qa\nQuestionnaire: tool · types · technical contract"]
        SPECIFY_QA --> SPEC_MD["spec.qa.md\nCT → k6/Gatling script mapping"]
        SPECIFY_QA --> TASKS_MD["tasks.qa.md\nChecklist of scripts to implement"]

        TASKS_MD --> APPLY_QA
        SPEC_MD  --> APPLY_QA

        APPLY_QA["/testspec-apply-qa\nGenerates scripts + run plans .md"]
        APPLY_QA --> E2E["e2e/\nk6-e2e-{action}-{scenario}.js\nk6-e2e-{action}-{scenario}.md"]
        APPLY_QA --> LOAD["load/\nk6-load-{action}-{scenario}-{rps}-rps-{dur}.js\nk6-load-{action}-{scenario}-{rps}-rps-{dur}.md"]
        APPLY_QA --> CHAOS["chaos-engineering/\nk6-dr-{action}-{scenario}-{type}.js\nk6-dr-{action}-{scenario}-{type}.md"]

        E2E   --> RUN_QA
        LOAD  --> RUN_QA
        CHAOS --> RUN_QA

        RUN_QA["/testspec-run-qa\nAI execution agent"]
        RUN_QA --> EXEC["Runs script\nCaptures stdout · p95/p99/RPS metrics"]
        EXEC   --> LOGS["Collects logs\nkubectl + Splunk via MCP"]
        LOGS   --> DB["Analyzes DB\nSELECT via MCP DB"]
        DB     --> REPORT["Generates Markdown report\nSummary · Metrics · Criteria · Logs · DB"]
        REPORT --> CONFLUENCE["Publishes to Confluence via MCP\n(fallback: ./reports/ local)"]
    end

    style OPENSPEC     fill:#1e1e2e,stroke:#cba6f7,color:#cdd6f4
    style IMPL         fill:#1e1e2e,stroke:#89b4fa,color:#cdd6f4
    style QA           fill:#1e1e2e,stroke:#a6e3a1,color:#cdd6f4
    style IDEA         fill:#313244,stroke:#f38ba8,color:#cdd6f4
    style ARCHIVE      fill:#313244,stroke:#a6e3a1,color:#cdd6f4
    style TESTS_CMD    fill:#45475a,stroke:#f9e2af,color:#cdd6f4
    style SPECIFY_QA   fill:#45475a,stroke:#f9e2af,color:#cdd6f4
    style APPLY_QA     fill:#45475a,stroke:#89b4fa,color:#cdd6f4
    style RUN_QA       fill:#45475a,stroke:#a6e3a1,color:#cdd6f4
    style CONFLUENCE   fill:#313244,stroke:#a6e3a1,color:#cdd6f4
```

---

## Quick start

```bash
# install globally
npm install -g @analizza-ai/testspec

# in your project root (must have openspec/ or similar)
testspec init       # detects SDD framework, selects AI agent, writes config
testspec generate   # reads specs → writes tests.md + stubs
testspec validate --results test-results.json
testspec report
```

---

## Skills

`testspec init` installs these 4 slash commands into your project's `.claude/commands/`:

| # | Skill | Layer | What it does |
|---|-------|-------|--------------|
| 1 | `/testspec-generate` | Developer | Consolidates all `spec.md` files for the feature and generates `tests.md` — a technology-agnostic document with numbered test cases (CT-01..N), acceptance criteria, DB validations, and out-of-scope boundaries |
| 2 | `/testspec-specify-qa` | QA | Creates `testspec/` and `instructions.md` automatically if missing. Reads `tests.md` via GitHub MCP, runs a questionnaire (tool, test types, technical contract JSON) and generates `spec.qa.md` + `tasks.qa.md` + folder structure |
| 3 | `/testspec-apply-qa` | QA | Implements k6/Gatling scripts from `tasks.qa.md` using `spec.qa.md` as the contract. Auto-generates a `.md` run plan alongside each script. Marks tasks `[x]` immediately after each pair is created |
| 4 | `/testspec-run-qa` | QA / Chaos | AI agent: reads the run plan `.md`, executes the script, collects logs (kubectl + Splunk via MCP), queries the DB via MCP, generates a Markdown report, and publishes to Confluence. Never cancels the suite on failure — reports everything and continues |

---

## How it works

```
Spec artifacts (proposal.md · design.md · specs/**/*.md · tasks.md)
    ↓
testspec generate  (/testspec-generate)
    ↓
SpecContext (scenarios, rules, contracts, dbAssertions)
    ↓
Agent prompt (printed to chat or sent via --api)
    ↓
tests.md  (CT-01..N)
    ↓
Unit stubs + Integration stubs (Testcontainers)
    ↓
QA repo reads tests.md via GitHub MCP
    ↓  /testspec-specify-qa
spec.qa.md + tasks.qa.md
    ↓  /testspec-apply-qa
k6 / Gatling scripts  ·  run plans .md
    ↓  /testspec-run-qa
Execution · Metrics · Logs · Report → Confluence
```

---

## OpenSpec structure (app repo)

```
openspec/
├── config.yaml                          # stack, conventions and global rules
├── specs/                               # reusable specs (global)
└── changes/
    ├── archive/                         # completed changes (/opsx:archive)
    └── {change-name}/
        ├── proposal.md                  # context, goals, non-goals
        ├── design.md                    # architecture, contracts, decisions
        ├── specs/
        │   └── {feature}/
        │       └── spec.md              # behaviour specification
        ├── tests.md                     # test cases generated by /testspec-generate
        └── tasks.md                     # tasks ready for /opsx:apply
```

## QA repo structure

```
testspec/
├── instructions.md              # app_repo (GitHub owner/repo), MCPs, QA project standards
├── current-feature.md           # feature in focus for the current session (written by skills)
└── {feature-name}/
    ├── spec.qa.md               # technical contract: request · response · rules · CT → script mapping
    └── tasks.qa.md              # checklist [ ] / [x] of scripts to implement

src/test/features/
└── {feature-name}/
    ├── e2e/
    │   ├── {tool}-e2e-{action}-{scenario}.js    # functional script — 1 per CT
    │   └── {tool}-e2e-{action}-{scenario}.md    # run plan — read by /testspec-run-qa
    ├── load/
    │   ├── {tool}-load-{action}-{scenario}-{rps}-rps-{dur}.js
    │   └── {tool}-load-{action}-{scenario}-{rps}-rps-{dur}.md
    └── chaos-engineering/
        ├── {tool}-dr-{action}-{scenario}-{type}.js
        └── {tool}-dr-{action}-{scenario}-{type}.md

reports/
└── {feature-name}/
    └── {script}-{YYYY-MM-DD-HHmm}.md   # report generated by /testspec-run-qa
                                          # (fallback when Confluence unavailable)
```

---

## tests.md format

```yaml
---
feature: Item Creation
change: item-creation
generated: 2026-05-25T10:00:00.000Z
sdd: openspec
sdt: 0.1.0
stack: { lang: node, db: postgresql }
qa-repo: analizza-ai/qa
---

# Tests — Item Creation

## Scope
## Out of scope

## Test cases

### CT-01 — Create item with valid payload

| Field               | Value                              |
|---------------------|------------------------------------|
| Type                | integration                        |
| Layer               | developer                          |
| Precondition        | User is authenticated              |
| Input               | POST /api/items { name: "x" }      |
| Expected output     | 201 Created { id: 1 }              |
| DB validation       | SELECT id FROM items WHERE id = 1  |
| Acceptance criteria | · item persisted · id returned     |

## Load profile hints
## Chaos scenarios
```

---

## Supported SDD frameworks

| Framework | Status |
|-----------|--------|
| OpenSpec (`@fission-ai/openspec`) | ✅ v1 |
| SpecKit | planned |
| BMAD | planned |
| Kiro (AWS) | planned |
| Custom | planned |

## Supported AI agents

| Agent | Status |
|-------|--------|
| Claude Code | ✅ print-to-chat + `--api` |
| GitHub Copilot | ✅ print-to-chat |

## Supported unit test frameworks

| Framework | Status |
|-----------|--------|
| Vitest | ✅ |
| Jest | ✅ |
| Pytest | ✅ |
| JUnit | ✅ |

## Supported integration runtimes

| Runtime | Status |
|---------|--------|
| Testcontainers + PostgreSQL | ✅ |
| Testcontainers + PostgreSQL + Kafka | ✅ |
| Testcontainers + Spring Boot + Kafka | ✅ |

---

## Configuration

`testspec.config.json` in your project root:

```json
{
  "sdd": "openspec",
  "agent": "claude",
  "unitFramework": "vitest",
  "stubs": { "unit": true, "integration": true },
  "loadHints": true,
  "chaosHints": true,
  "qaRepo": "your-org/qa-repo"
}
```

---

## CI/CD

This package is published to npmjs automatically via GitHub Actions on every `v*` tag.

| Workflow | Trigger | What it does |
|----------|---------|--------------|
| `ci.yml` | Push / PR to `main` | Lint + test on Node 20 and 22 |
| `release.yml` | Manual (`workflow_dispatch`) | Bumps version, commits, pushes tag |
| `publish.yml` | Tag `v*` push or manual | Publishes to npmjs with provenance |

To release a new version: **GitHub → Actions → Release → Run workflow → pick `patch` / `minor` / `major`**.

---

## Adapter extension guide

See [docs/adapters-sdd.md](docs/adapters-sdd.md) to add a custom SDD framework adapter.

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Issues and PRs welcome.

---

## License

MIT © Diego Lirio
