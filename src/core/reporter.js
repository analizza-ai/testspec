/**
 * src/core/reporter.js
 * Generates a CT coverage/gap report by comparing tests.md CTs to existing stub files.
 */

import { existsSync, readdirSync } from 'fs';
import { join } from 'path';

/**
 * @param {string} testsContent  raw tests.md string
 * @param {string} cwd
 * @param {object} config
 * @returns {{ change: string, total: number, covered: number, missing: Array<{id,title}> }}
 */
export function generateReport(testsContent, cwd, _config) {
  const ctMatches = [...testsContent.matchAll(/^### (CT-\d+)\s+[—–-]\s+(.+)$/gm)];
  const all = ctMatches.map((m) => ({ id: m[1], title: m[2].trim() }));

  const stubsDir = join(cwd, 'tests');
  const stubFiles = existsSync(stubsDir) ? getAllFiles(stubsDir) : [];

  const missing = all.filter((ct) => !stubFiles.some((f) => f.includes(ct.id.toLowerCase())));

  const featureMatch = testsContent.match(/^feature:\s*(.+)$/m);
  const changeMatch = testsContent.match(/^change:\s*(.+)$/m);

  return {
    change: changeMatch ? changeMatch[1].trim() : 'unknown',
    feature: featureMatch ? featureMatch[1].trim() : 'unknown',
    total: all.length,
    covered: all.length - missing.length,
    missing,
  };
}

function getAllFiles(dir) {
  const results = [];
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    if (e.isDirectory()) results.push(...getAllFiles(join(dir, e.name)));
    else results.push(join(dir, e.name));
  }
  return results;
}
