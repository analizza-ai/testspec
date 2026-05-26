/**
 * src/utils/config.js
 * Reads and validates testspec.config.json from the project root.
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const DEFAULTS = {
  sdd: 'openspec',
  agent: 'claude',
  unitFramework: 'vitest',
  stubs: { unit: true, integration: true },
  loadHints: true,
  chaosHints: true,
};

/**
 * @param {string} root  project root directory
 * @returns {object}
 */
export function loadConfig(root) {
  const configPath = join(root, 'testspec.config.json');
  if (!existsSync(configPath)) {
    return { ...DEFAULTS };
  }
  const raw = JSON.parse(readFileSync(configPath, 'utf-8'));
  return { ...DEFAULTS, ...raw };
}
