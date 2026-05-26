/**
 * src/adapters/agents/copilot.js
 * GitHub Copilot adapter. Prints the prompt so Copilot can read it via copilot-instructions.md context.
 * Does not call an API — Copilot reads the prompt in the editor chat.
 */

import { buildPrompt } from '../../core/tests-builder.js';
import { log } from '../../utils/logger.js';

export class CopilotAdapter {
  /**
   * @param {object} specContext
   * @param {object} config
   * @returns {Promise<string>} placeholder tests.md
   */
  async generateTests(specContext, config) {
    const prompt = buildPrompt(specContext, config);

    log.info('\n─── Prompt for GitHub Copilot ───────────────────────────\n');
    console.log(prompt);
    log.info('\n────────────────────────────────────────────────────────\n');
    log.warn('Paste the above into GitHub Copilot Chat to generate tests.md.');

    const now = new Date().toISOString();
    return `---
feature: ${specContext.feature}
change: ${specContext.changeName}
generated: ${now}
sdd: ${specContext.sdd}
sdt: 0.1.0
status: placeholder — paste the prompt into GitHub Copilot Chat
---

# Tests — ${specContext.feature}

> Paste the printed prompt into GitHub Copilot Chat and replace this file with the output.
`;
  }
}
