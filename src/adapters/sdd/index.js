/**
 * src/adapters/sdd/index.js
 * Registry mapping SDD framework names to their adapter implementations.
 */

import { OpenSpecAdapter } from './openspec.js';
import { SpecKitAdapter } from './speckit.js';

const registry = {
  openspec: OpenSpecAdapter,
  speckit: SpecKitAdapter,
};

/**
 * Returns an instantiated adapter for the given SDD framework name.
 * @param {string} name
 * @returns {OpenSpecAdapter | SpecKitAdapter}
 */
export function getAdapter(name = 'openspec') {
  const Adapter = registry[name.toLowerCase()];
  if (!Adapter) throw new Error(`Unknown SDD adapter: "${name}". Supported: ${Object.keys(registry).join(', ')}`);
  return new Adapter();
}
