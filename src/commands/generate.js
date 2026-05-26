/**
 * src/commands/generate.js
 * Core command: reads SDD spec artifacts → builds tests.md + optional stubs.
 * Also registered as the "testspec-generate" alias in bin/cli.js.
 */

import { Command } from 'commander';
import { log } from '../utils/logger.js';
import { loadConfig } from '../utils/config.js';
import { getAdapter as getSddAdapter } from '../adapters/sdd/index.js';
import { getAdapter as getAgentAdapter } from '../adapters/agents/index.js';
import { parseSpecs } from '../core/spec-parser.js';
import { generateStubs } from '../core/stub-generator.js';
import { writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';

export const generateCommand = new Command('generate')
  .description('Read specs → write tests.md + optional unit/integration stubs')
  .option('-c, --change <name>', 'target a specific change folder')
  .option('--api', 'call Claude API instead of printing prompt to chat')
  .option('--no-stubs', 'skip stub generation, write tests.md only')
  .action(runGenerate);

export async function runGenerate(opts = {}) {
  const config = loadConfig(process.cwd());
  const sddAdapter = getSddAdapter(config.sdd);
  const agentAdapter = getAgentAdapter(config.agent);

  // 1. Discover and load artifacts
  const changes = sddAdapter.discoverChanges(process.cwd());
  if (changes.length === 0) {
    log.error('No changes found. Run from a project root with SDD artifacts.');
    process.exit(1);
  }

  const changeName = opts.change || changes[changes.length - 1];
  log.info(`Processing change: ${changeName}`);

  const artifacts = sddAdapter.loadArtifacts(process.cwd(), changeName);
  const outputPath = sddAdapter.getOutputPath(process.cwd(), changeName);

  // 2. Parse into SpecContext
  const specContext = parseSpecs(artifacts, config);
  log.info(`Parsed ${specContext.specs.length} spec file(s)`);

  // 3. Generate tests.md via agent adapter
  const testsContent = await agentAdapter.generateTests(specContext, config, {
    useApi: opts.api ?? false,
  });

  // 4. Write tests.md
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, testsContent);
  log.success(`tests.md written → ${outputPath}`);

  // 5. Optional stubs
  const stubsEnabled = opts.stubs !== false && config.stubs?.unit !== false;
  if (stubsEnabled) {
    const stubResults = generateStubs(specContext, config, dirname(outputPath));
    log.success(`Unit stubs: ${stubResults.unit.length} file(s)`);
    log.success(`Integration stubs: ${stubResults.integration.length} file(s)`);
  }

  const ctCount = (testsContent.match(/^### CT-\d+/gm) || []).length;
  log.info(`\nSummary: ${specContext.specs.length} spec(s) → ${ctCount} CT(s) → tests.md written`);
}
