/**
 * src/adapters/agents/claude.js
 * Claude adapter. Builds the SpecContext → tests.md prompt.
 * Default: prints prompt to stdout (agent reads it in chat).
 * With --api flag: calls Claude API (requires ANTHROPIC_API_KEY).
 */

import { buildPrompt } from '../../core/tests-builder.js';
import { log } from '../../utils/logger.js';

export class ClaudeAdapter {
  /**
   * @param {object} specContext
   * @param {object} config
   * @param {{ useApi: boolean }} opts
   * @returns {Promise<string>} tests.md content
   */
  async generateTests(specContext, config, opts = {}) {
    const prompt = buildPrompt(specContext, config);

    if (!opts.useApi) {
      log.info('\n─── Prompt for Claude Code (/pags-tests) ───────────────\n');
      console.log(prompt);
      log.info('\n────────────────────────────────────────────────────────\n');
      log.warn('Paste the output above into your Claude Code chat to get tests.md.');
      log.warn('Re-run with --api to call Claude API directly.');

      // Return a placeholder tests.md so the CLI can write a file
      return buildPlaceholder(specContext);
    }

    return this.#callApi(prompt, specContext, config);
  }

  async #callApi(prompt, _specContext, _config) {
    let Anthropic;
    try {
      ({ default: Anthropic } = await import('@anthropic-ai/sdk'));
    } catch {
      log.error('@anthropic-ai/sdk not installed. Run: npm install @anthropic-ai/sdk');
      process.exit(1);
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      log.error('ANTHROPIC_API_KEY env var is required for --api mode.');
      process.exit(1);
    }

    const client = new Anthropic({ apiKey });
    log.info('Calling Claude API…');

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 8192,
      messages: [{ role: 'user', content: prompt }],
    });

    return message.content[0].text;
  }
}

function buildPlaceholder(specContext) {
  const now = new Date().toISOString();
  return `---
feature: ${specContext.feature}
change: ${specContext.changeName}
generated: ${now}
sdd: ${specContext.sdd}
sdt: 0.1.0
status: placeholder — run with --api or paste the prompt into Claude Code
---

# Tests — ${specContext.feature}

> This file was generated as a placeholder. Paste the printed prompt into your Claude Code chat
> and replace this file with the output, or re-run \`testspec generate --api\`.

## Scope
_To be filled by agent_

## Out of scope
_To be filled by agent_

## Test cases
_To be filled by agent_
`;
}
