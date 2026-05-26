/**
 * src/core/tests-builder.js
 * Builds the agent prompt from a SpecContext, and assembles the tests.md skeleton.
 * No LLM calls — only prompt construction. Agent adapters call the LLM.
 */

/**
 * Builds the full prompt string to send to (or print for) an AI agent.
 * @param {import('./spec-parser.js').SpecContext} ctx
 * @param {object} config
 * @returns {string}
 */
export function buildPrompt(ctx, config) {
  const stackDesc = [ctx.stack.lang, ctx.stack.db, ctx.stack.broker].filter(Boolean).join(' + ');

  return `# testspec generate — ${ctx.feature}

## Task
You are generating a \`tests.md\` for the feature **${ctx.feature}** (change: \`${ctx.changeName}\`).
Follow the SDT canonical structure exactly.

## Stack
${stackDesc}

## Spec artifacts

### Scenarios detected
${ctx.scenarios.map((s) => `- ${s}`).join('\n') || '_none detected_'}

### Business rules
${ctx.rules.map((r) => `- ${r}`).join('\n') || '_none detected_'}

### API contracts (from design.md)
${ctx.contracts.map((c) => `- \`${c}\``).join('\n') || '_none detected_'}

### DB assertions (from design.md)
${ctx.dbAssertions.map((a) => `\`\`\`sql\n${a}\n\`\`\``).join('\n') || '_none detected_'}

### Out of scope
${ctx.outOfScope.map((o) => `- ${o}`).join('\n') || '_none detected_'}

${ctx.loadHints ? `### Load hints\n${ctx.loadHints}\n` : ''}
${ctx.chaosHints ? `### Chaos hints\n${ctx.chaosHints}\n` : ''}

## Raw spec content
${ctx.specs.map((s, i) => `### spec-${i + 1}\n${s}`).join('\n\n')}

## Output format
Produce a complete \`tests.md\` with this EXACT structure:

\`\`\`
---
feature: ${ctx.feature}
change: ${ctx.changeName}
generated: <ISO timestamp>
sdd: ${ctx.sdd}
sdt: 0.1.0
stack: { lang: ${ctx.stack.lang}, db: ${ctx.stack.db}${ctx.stack.broker ? `, broker: ${ctx.stack.broker}` : ''} }
---

# Tests — ${ctx.feature}

## Scope
<bullet list of what is in scope>

## Out of scope
<bullet list>

## Test cases

### CT-01 — <title>
| Field               | Value |
|---------------------|-------|
| Type                | unit \\| integration \\| e2e \\| load \\| chaos |
| Layer               | developer \\| qa \\| chaos |
| Precondition        | ... |
| Input               | ... |
| Expected output     | ... |
| DB validation       | ... |
| Acceptance criteria | · bullet |

<repeat for each CT>
${config.loadHints !== false ? `\n## Load profile hints\n| Scenario | RPS | Duration | p95 target | p99 target |\n|---|---|---|---|---|` : ''}
${config.chaosHints !== false ? `\n## Chaos scenarios\n| Scenario | Failure mode | Expected behaviour |\n|---|---|---|` : ''}
\`\`\`

Generate as many CTs as needed to cover all scenarios, rules, and contracts.
Number them CT-01, CT-02, … with no gaps.
`;
}

/**
 * Assembles a minimal tests.md skeleton (used for placeholder generation).
 * @param {import('./spec-parser.js').SpecContext} ctx
 * @returns {string}
 */
export function buildTests(ctx) {
  const now = new Date().toISOString();
  const stackYaml = `{ lang: ${ctx.stack.lang}, db: ${ctx.stack.db}${ctx.stack.broker ? `, broker: ${ctx.stack.broker}` : ''} }`;

  return `---
feature: ${ctx.feature}
change: ${ctx.changeName}
generated: ${now}
sdd: ${ctx.sdd}
sdt: 0.1.0
stack: ${stackYaml}
---

# Tests — ${ctx.feature}

## Scope

## Out of scope
${ctx.outOfScope.map((o) => `- ${o}`).join('\n')}

## Test cases

`;
}
