/**
 * src/utils/sdd-detector.js
 * Auto-detects which SDD framework is in use by scanning known folder patterns.
 */

import { existsSync } from 'fs';
import { join } from 'path';

const SIGNATURES = [
  { name: 'openspec', path: 'openspec/changes' },
  { name: 'speckit', path: 'specs' },
];

/**
 * @param {string} root  project root directory
 * @returns {string|null}  detected SDD name, or null if none found
 */
export function detectSdd(root) {
  for (const sig of SIGNATURES) {
    if (existsSync(join(root, sig.path))) return sig.name;
  }
  return null;
}
