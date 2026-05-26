/**
 * src/adapters/agents/index.js
 * Registry mapping AI agent names to their adapter implementations.
 */

import { ClaudeAdapter } from './claude.js';
import { CopilotAdapter } from './copilot.js';

const registry = {
  claude: ClaudeAdapter,
  copilot: CopilotAdapter,
};

/**
 * Returns an instantiated adapter for the given agent name.
 * @param {string} name
 */
export function getAdapter(name = 'claude') {
  const Adapter = registry[name.toLowerCase()];
  if (!Adapter) throw new Error(`Unknown agent adapter: "${name}". Supported: ${Object.keys(registry).join(', ')}`);
  return new Adapter();
}
