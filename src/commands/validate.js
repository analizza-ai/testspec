/**
 * src/commands/validate.js
 * Maps test run results back to CT-01..N pass/fail status in tests.md.
 */

import { Command } from 'commander';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { log } from '../utils/logger.js';
import { loadConfig } from '../utils/config.js';
import { getAdapter as getSddAdapter } from '../adapters/sdd/index.js';

export const validateCommand = new Command('validate')
  .description('Map test run results to CT-01..N pass/fail in tests.md')
  .option('-c, --change <name>', 'target a specific change folder')
  .option('-r, --results <file>', 'path to test results JSON (vitest/jest --reporter=json)')
  .action(runValidate);

export async function runValidate(opts = {}) {
  const config = loadConfig(process.cwd());
  const sddAdapter = getSddAdapter(config.sdd);

  const changes = sddAdapter.discoverChanges(process.cwd());
  const changeName = opts.change || changes[changes.length - 1];
  const outputPath = sddAdapter.getOutputPath(process.cwd(), changeName);

  if (!existsSync(outputPath)) {
    log.error(`tests.md not found at ${outputPath}. Run "testspec generate" first.`);
    process.exit(1);
  }

  if (!opts.results) {
    log.error('Provide test results with --results <file>');
    process.exit(1);
  }

  const testsContent = readFileSync(outputPath, 'utf-8');
  const results = JSON.parse(readFileSync(opts.results, 'utf-8'));

  const updated = applyResults(testsContent, results);
  writeFileSync(outputPath, updated);
  log.success(`tests.md updated with validation results → ${outputPath}`);
}

/**
 * Appends pass/fail badges to CT headings based on test result names
 * that contain the CT identifier (e.g. "CT-01").
 */
function applyResults(content, results) {
  const testNames = extractTestNames(results);
  return content.replace(/^(### CT-(\d+)[^\n]*)/gm, (line, _full, num) => {
    const id = `CT-${num.padStart(2, '0')}`;
    const passed = testNames.filter((n) => n.includes(id) && n.status === 'passed').length;
    const failed = testNames.filter((n) => n.includes(id) && n.status === 'failed').length;
    if (passed > 0 && failed === 0) return `${line} ✅`;
    if (failed > 0) return `${line} ❌`;
    return line;
  });
}

function extractTestNames(results) {
  const names = [];
  const traverse = (suite) => {
    if (suite.tests) suite.tests.forEach((t) => names.push({ name: t.name, status: t.status }));
    if (suite.suites) suite.suites.forEach(traverse);
  };
  if (results.testResults) results.testResults.forEach(traverse);
  return names;
}
