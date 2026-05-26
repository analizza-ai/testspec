# @analizza-ai/testspec

[![npm](https://img.shields.io/npm/v/@analizza-ai/testspec)](https://www.npmjs.com/package/@analizza-ai/testspec)
[![license](https://img.shields.io/npm/l/@analizza-ai/testspec)](./LICENSE)
[![node](https://img.shields.io/node/v/@analizza-ai/testspec)](./package.json)

**Spec Driven Test — the test layer for SDD**

testspec (SDT) inverts traditional test generation. Instead of writing code first and covering it with tests, SDT drives the entire test lifecycle from your spec artifacts. Specs are the single source of truth.

---

## Test pyramid

```
┌─────────────────────────────────────────────────┐
│              CHAOS ENGINEERING                  │  ← /testspec-run-qa
│         (resilience · DR · fault injection)     │
├─────────────────────────────────────────────────┤
│               QA LAYER                          │  ← /testspec-apply-qa
│     end-to-end tests · load tests (k6/Gatling)  │
├─────────────────────────────────────────────────┤
│             DEVELOPER LAYER                     │  ← testspec generate
│   unit tests · integration tests (Testcontainers│
│   PostgreSQL · Kafka · etc.)                    │
└─────────────────────────────────────────────────┘
         All layers driven by: tests.md
         tests.md driven by: spec.md + proposal.md + design.md
```

---

## What is SDT

testspec reads the spec artifacts produced by your SDD framework (OpenSpec, SpecKit, etc.) and generates:

1. **`tests.md`** — a technology-agnostic test document with numbered CT-01..N test cases
2. **Unit test stubs** — Jest / Vitest / Pytest / JUnit skeletons named after CTs
3. **Integration test stubs** — Testcontainers-based, pre-configured for your stack

The QA layer then consumes `tests.md` to generate k6/Gatling scripts without ambiguity.

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

## How it works

```
Spec artifacts (proposal.md · design.md · specs/**/*.md · tasks.md)
    ↓
testspec generate
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
    ↓
k6 / Gatling scripts  ·  chaos scripts
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

| Field               | Value                        |
|---------------------|------------------------------|
| Type                | integration                  |
| Layer               | developer                    |
| Precondition        | User is authenticated        |
| Input               | POST /api/items { name: "x" }|
| Expected output     | 201 Created { id: 1 }        |
| DB validation       | SELECT id FROM items WHERE id = 1 |
| Acceptance criteria | · item persisted · id returned |

## Load profile hints
## Chaos scenarios
```

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

## Adapter extension guide

See [docs/adapters-sdd.md](docs/adapters-sdd.md) to add a custom SDD framework adapter.

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Issues and PRs welcome.

---

## License

MIT © Diego Lirio
