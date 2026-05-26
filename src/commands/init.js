/**
 * src/commands/init.js
 * Setup wizard: detects or selects SDD framework, selects AI agent,
 * writes testspec.config.json, and installs agent instruction files into the project.
 */

import { Command } from 'commander';
import { createInterface } from 'readline';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { log } from '../utils/logger.js';
import { detectSdd } from '../utils/sdd-detector.js';

export const initCommand = new Command('init')
  .description('Setup wizard — SDD framework + AI agent + writes testspec.config.json')
  .action(runInit);

export async function runInit() {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  let rlClosed = false;
  rl.once('close', () => { rlClosed = true; });
  const ask = (q) => new Promise((res) => {
    if (rlClosed) return res('');
    rl.question(q, (ans) => res(ans));
    rl.once('close', () => res(''));
  });

  log.info('testspec init — Spec Driven Test setup\n');

  // Step 1: detect SDD framework
  const detected = detectSdd(process.cwd());
  let sdd;

  if (detected) {
    const ans = await ask(`Detected SDD framework: ${detected}. Use it? [Y/n] `);
    sdd = ans.toLowerCase() === 'n' ? await selectSdd(ask) : detected;
  } else {
    sdd = await selectSdd(ask);
  }

  // Step 2: select AI agent
  log.info('\nWhich AI agent for test generation?');
  log.info('  1) Claude Code (default)');
  log.info('  2) GitHub Copilot');
  const agentAns = await ask('Choose [1/2]: ');
  const agent = agentAns.trim() === '2' ? 'copilot' : 'claude';

  // Step 3: optional QA repo
  const qaRepo = await ask('\nQA repo (owner/repo) for tests.md handoff [leave blank to skip]: ');

  rl.close();

  // Step 4: write testspec.config.json
  const config = {
    sdd,
    agent,
    stubs: { unit: true, integration: true },
    unitFramework: 'vitest',
    ...(qaRepo.trim() && { qaRepo: qaRepo.trim() }),
    loadHints: true,
    chaosHints: true,
  };

  writeFileSync(join(process.cwd(), 'testspec.config.json'), JSON.stringify(config, null, 2) + '\n');
  log.success('testspec.config.json written');

  // Step 5: install agent instruction files
  if (agent === 'claude') {
    const { readFileSync } = await import('fs');
    const { fileURLToPath } = await import('url');
    const { dirname, join: pjoin } = await import('path');
    const __dirname = dirname(fileURLToPath(import.meta.url));
    const skillsDir = pjoin(__dirname, '../../templates/agent-instructions/skills');
    const commandsDir = join(process.cwd(), '.claude', 'commands');
    mkdirSync(commandsDir, { recursive: true });

    const skills = [
      'testspec-generate.md',
      'testspec-specify-qa.md',
      'testspec-apply-qa.md',
      'testspec-run-qa.md',
    ];
    for (const skill of skills) {
      const tpl = readFileSync(pjoin(skillsDir, skill), 'utf-8');
      writeFileSync(join(commandsDir, skill), tpl);
      log.success(`.claude/commands/${skill} written`);
    }
  } else {
    const dir = join(process.cwd(), '.github');
    mkdirSync(dir, { recursive: true });
    const { readFileSync } = await import('fs');
    const { fileURLToPath } = await import('url');
    const { dirname, join: pjoin } = await import('path');
    const __dirname = dirname(fileURLToPath(import.meta.url));
    const tpl = readFileSync(pjoin(__dirname, '../../templates/agent-instructions/copilot.md'), 'utf-8');
    writeFileSync(join(dir, 'copilot-instructions.md'), tpl);
    log.success('.github/copilot-instructions.md written');
  }

  log.info('\nSetup complete. Run: testspec generate');
}

async function selectSdd(ask) {
  log.info('\nSelect SDD framework:');
  log.info('  1) OpenSpec (default)');
  log.info('  2) SpecKit (coming soon)');
  const ans = await ask('Choose [1/2]: ');
  if (ans.trim() === '2') {
    log.warn('SpecKit adapter is not yet implemented. Defaulting to OpenSpec.');
  }
  return 'openspec';
}
