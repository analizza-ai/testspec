# Getting Started — Spec Driven Test (SDT)

`@analizza-ai/testspec` installs 4 Claude Code slash commands that cover the full SDT lifecycle — from developer tests to QA automation.

---

## Prerequisites

- Node.js >= 20.19.0
- [Claude Code](https://claude.ai/code) CLI
- An SDD project using [OpenSpec](https://github.com/Fission-AI/OpenSpec) (or compatible framework)

---

## Install

```bash
npm install -D @analizza-ai/testspec
```

Then run the setup wizard inside your project:

```bash
npx testspec init
```

The wizard will:
1. Detect or select your SDD framework (OpenSpec, SpecKit, …)
2. Select your AI agent (Claude Code or GitHub Copilot)
3. Ask for an optional QA repo (`owner/repo`) for tests.md handoff
4. Write `testspec.config.json`
5. Install the 4 slash commands into `.claude/commands/`

---

## The 4 Skills

### `/testspec` — Developer layer

**When:** After `/opsx:propose` has created `design.md` + `specs/**/*.md`.

Reads all OpenSpec artifacts for a feature and generates:
- `openspec/changes/{feature}/tests.md` — technology-agnostic CT-01..N test cases
- Unit stubs (Vitest / Jest / Pytest / JUnit)
- Integration stubs (Testcontainers — PostgreSQL, Kafka)

---

### `/testspec-specify-qa` — QA repo

**When:** After `/testspec` has generated `tests.md` in the app repo.

Fetches `tests.md` via GitHub MCP, runs an interactive interview (tool, test types, technical JSON spec), and generates:
- `testspec/{feature}/spec.qa.md` — technical QA contract
- `testspec/{feature}/tasks.qa.md` — implementation checklist
- Folder structure: `src/test/features/{feature}/e2e/`, `load/`, `chaos-engineering/`

**Requires:** GitHub MCP configured with `GITHUB_PERSONAL_ACCESS_TOKEN`.

---

### `/testspec-apply-qa` — QA repo

**When:** After `/testspec-specify-qa` has generated `spec.qa.md` + `tasks.qa.md`.

Implements runnable k6/Gatling scripts for every pending task:
- E2E scripts (one per CT)
- Load scripts (one per RPS stage, happy path only)
- Chaos Engineering scripts (pod shutdown, network latency, etc.)
- A `.md` run plan alongside every script (read by `/testspec-run-qa`)

Marks each task `[x]` in `tasks.qa.md` immediately after creation.

---

### `/testspec-run-qa` — AI agent

**When:** After `/testspec-apply-qa` has generated scripts and run plans.

For each selected run plan:
1. Executes the script (k6 / Gatling)
2. Collects logs via kubectl / Splunk MCP
3. Validates DB state via MCP
4. Generates a consolidated Markdown QA report
5. Publishes to Confluence via MCP (fallback: saves to `./reports/`)

---

## Full SDT Flow

```
Idea
 └─▶ /opsx:propose
       Generates: proposal.md · design.md · specs/{feature}/spec.md · tasks.md

       └─▶ /testspec                      ← SDT ENTRY POINT (developer layer)
             Reads:   openspec/changes/{feature}/
             Writes:  tests.md  (CT-01..N, technology-agnostic)
                      ↳ unit stubs
                      ↳ integration stubs (Testcontainers)

             └─▶ /opsx:apply
                   Implements code · migrations · guided by tasks.md

                   └─▶ /testspec-specify-qa       (QA repo)
                         Reads tests.md via GitHub MCP
                         Writes: testspec/{feature}/spec.qa.md · tasks.qa.md

                         └─▶ /testspec-apply-qa
                               Writes: k6/Gatling scripts + run plans
                               Types:  e2e/ · load/ · chaos-engineering/

                               └─▶ /testspec-run-qa   ← AI agent
                                     Executes scripts
                                     Collects logs (kubectl + Splunk MCP)
                                     Validates DB via MCP
                                     Publishes report to Confluence
```

---

## Local development

To test the package locally before publishing:

```bash
# In the testspec package directory
npm link

# In your target project
npm link @analizza-ai/testspec
npx testspec init
```
