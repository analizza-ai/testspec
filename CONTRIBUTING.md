# Contributing to @analizza-ai/testspec

## Prerequisites

- Node.js >= 20.19.0
- npm >= 10

## Setup

```bash
git clone https://github.com/analizza-ai/testspec.git
cd testspec
npm install
npm test
```

## Adding an SDD adapter

1. Create `src/adapters/sdd/{name}.js` implementing `discoverChanges`, `loadArtifacts`, `getOutputPath`
2. Register it in `src/adapters/sdd/index.js`
3. Add tests in `tests/adapters/{name}.test.js`

## Adding an agent adapter

1. Create `src/adapters/agents/{name}.js` implementing `generateTests(specContext, config, opts)`
2. Register it in `src/adapters/agents/index.js`
3. Add an agent instruction template in `templates/agent-instructions/`

## Constraints

- ESM only (`import`/`export`) — no CommonJS
- No LLM calls in `src/core/` — only in `src/adapters/agents/`
- No unnecessary dependencies
- All docs and comments in English

## Pull request checklist

- [ ] `npm test` passes
- [ ] `npm run lint` passes
- [ ] CHANGELOG.md updated under `[Unreleased]`
