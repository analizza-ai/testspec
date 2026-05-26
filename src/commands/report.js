/**
 * src/commands/report.js
 * Gap report: which CTs in tests.md have no corresponding test stub yet.
 */

import { Command } from 'commander';
import { readFileSync, existsSync } from 'fs';
import { log } from '../utils/logger.js';
import { loadConfig } from '../utils/config.js';
import { getAdapter as getSddAdapter } from '../adapters/sdd/index.js';
import { generateReport } from '../core/reporter.js';

export const reportCommand = new Command('report')
  .description('Coverage/gap report: which CTs have no test stub yet')
  .option('-c, --change <name>', 'target a specific change folder')
  .option('--format <fmt>', 'output format: text | json | markdown', 'text')
  .action(runReport);

export async function runReport(opts = {}) {
  const config = loadConfig(process.cwd());
  const sddAdapter = getSddAdapter(config.sdd);

  const changes = sddAdapter.discoverChanges(process.cwd());
  const changeName = opts.change || changes[changes.length - 1];
  const outputPath = sddAdapter.getOutputPath(process.cwd(), changeName);

  if (!existsSync(outputPath)) {
    log.error(`tests.md not found at ${outputPath}. Run "testspec generate" first.`);
    process.exit(1);
  }

  const testsContent = readFileSync(outputPath, 'utf-8');
  const report = generateReport(testsContent, process.cwd(), config);

  if (opts.format === 'json') {
    console.log(JSON.stringify(report, null, 2));
  } else if (opts.format === 'markdown') {
    console.log(formatMarkdown(report));
  } else {
    formatText(report);
  }
}

function formatText(report) {
  log.info(`\nCoverage report — ${report.change}`);
  log.info(`Total CTs: ${report.total} | Covered: ${report.covered} | Missing: ${report.missing.length}`);
  if (report.missing.length > 0) {
    log.warn('\nCTs with no stub:');
    report.missing.forEach((ct) => log.warn(`  · ${ct.id} — ${ct.title}`));
  } else {
    log.success('\nAll CTs have stubs.');
  }
}

function formatMarkdown(report) {
  const rows = report.missing.map((ct) => `| ${ct.id} | ${ct.title} | ❌ no stub |`).join('\n');
  return `## testspec coverage — ${report.change}\n\n` +
    `Total: ${report.total} | Covered: ${report.covered} | Missing: ${report.missing.length}\n\n` +
    (rows ? `| CT | Title | Status |\n|---|---|---|\n${rows}` : '_All CTs have stubs._');
}
