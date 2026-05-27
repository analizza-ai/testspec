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

const SDD_DIRS = { openspec: 'openspec', speckit: 'specs' };

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

  // Step 4: write testspec.config.json inside the SDD framework folder
  const config = {
    sdd,
    agent,
    stubs: { unit: true, integration: true },
    unitFramework: 'vitest',
    ...(qaRepo.trim() && { qaRepo: qaRepo.trim() }),
    loadHints: true,
    chaosHints: true,
  };

  const sddDir = SDD_DIRS[sdd] ?? sdd;
  const configDir = join(process.cwd(), sddDir);
  mkdirSync(configDir, { recursive: true });
  const configPath = join(configDir, 'testspec.config.json');
  writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n');
  log.success(`${sddDir}/testspec.config.json written`);

  // Step 5: install agent instruction files
  const { readFileSync } = await import('fs');
  const { fileURLToPath } = await import('url');
  const { dirname, join: pjoin } = await import('path');
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const skillsDir = pjoin(__dirname, '../../templates/agent-instructions/skills');

  const skills = [
    'testspec-generate',
    'testspec-specify-qa',
    'testspec-apply-qa',
    'testspec-run-qa',
  ];

  if (agent === 'claude') {
    const commandsDir = join(process.cwd(), '.claude', 'commands');
    mkdirSync(commandsDir, { recursive: true });

    for (const skill of skills) {
      const tpl = readFileSync(pjoin(skillsDir, skill, 'SKILL.md'), 'utf-8');
      writeFileSync(join(commandsDir, `${skill}.md`), tpl);
      log.success(`.claude/commands/${skill}.md written`);
    }
  } else {
    // global copilot instructions
    const githubDir = join(process.cwd(), '.github');
    mkdirSync(githubDir, { recursive: true });
    const tpl = readFileSync(pjoin(__dirname, '../../templates/agent-instructions/copilot.md'), 'utf-8');
    writeFileSync(join(githubDir, 'copilot-instructions.md'), tpl);
    log.success('.github/copilot-instructions.md written');

    // skills → .github/skills/{skill-name}/SKILL.md
    for (const skill of skills) {
      const skillTpl = readFileSync(pjoin(skillsDir, skill, 'SKILL.md'), 'utf-8');
      const destDir = join(process.cwd(), '.github', 'skills', skill);
      mkdirSync(destDir, { recursive: true });
      writeFileSync(join(destDir, 'SKILL.md'), skillTpl);
      log.success(`.github/skills/${skill}/SKILL.md written`);
    }

    // prompts → .github/prompts/{skill-name}.prompt.md  (slash commands)
    const promptsTemplateDir = pjoin(__dirname, '../../templates/agent-instructions/prompts');
    const promptsDir = join(process.cwd(), '.github', 'prompts');
    mkdirSync(promptsDir, { recursive: true });

    for (const skill of skills) {
      const promptTpl = readFileSync(pjoin(promptsTemplateDir, `${skill}.prompt.md`), 'utf-8');
      writeFileSync(join(promptsDir, `${skill}.prompt.md`), promptTpl);
      log.success(`.github/prompts/${skill}.prompt.md written`);
    }
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
