#!/usr/bin/env node
/**
 * bin/cli.js
 * Entry point for the testspec CLI. Registers all commands and the pags-tests alias.
 */

import { program } from 'commander';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf-8'));

program
  .name('testspec')
  .description('Spec Driven Test — generate tests.md and stubs from SDD specs')
  .version(pkg.version);

const { initCommand } = await import('../src/commands/init.js');
const { generateCommand } = await import('../src/commands/generate.js');
const { validateCommand } = await import('../src/commands/validate.js');
const { reportCommand } = await import('../src/commands/report.js');

program.addCommand(initCommand);
program.addCommand(generateCommand);
program.addCommand(validateCommand);
program.addCommand(reportCommand);

// alias: pags-tests → generate
program
  .command('pags-tests')
  .description('Alias for "generate" — reads specs → writes tests.md + stubs')
  .option('-c, --change <name>', 'target a specific change folder')
  .option('--api', 'call Claude API instead of printing prompt to chat')
  .option('--no-stubs', 'skip stub generation, write tests.md only')
  .action(async (opts) => {
    const { runGenerate } = await import('../src/commands/generate.js');
    await runGenerate(opts);
  });

program.parse();
