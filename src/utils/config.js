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

const SDD_CONFIG_PATHS = ['openspec', 'specs'];

/**
 * Resolves the config file path, checking SDD framework folders first then root.
 * @param {string} root  project root directory
 * @returns {string}
 */
export function resolveConfigPath(root) {
  for (const sddDir of SDD_CONFIG_PATHS) {
    const p = join(root, sddDir, 'testspec.config.json');
    if (existsSync(p)) return p;
  }
  return join(root, 'testspec.config.json');
}

/**
 * @param {string} root  project root directory
 * @returns {object}
 */
export function loadConfig(root) {
  const configPath = resolveConfigPath(root);
  if (!existsSync(configPath)) {
    return { ...DEFAULTS };
  }
  const raw = JSON.parse(readFileSync(configPath, 'utf-8'));
  return { ...DEFAULTS, ...raw };
}
