/**
 * src/core/stub-generator.js
 * Generates unit and integration test stubs from a SpecContext.
 * Reads templates from templates/stubs/ and substitutes CT placeholders.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = join(__dirname, '../../templates/stubs');

/**
 * @param {import('./spec-parser.js').SpecContext} ctx
 * @param {object} config
 * @param {string} outputDir  directory where tests.md was written
 * @returns {{ unit: string[], integration: string[] }}
 */
export function generateStubs(ctx, config, outputDir) {
  const unitFramework = config.unitFramework || 'vitest';
  const unit = [];
  const integration = [];

  if (config.stubs?.unit !== false) {
    const unitStubs = generateUnitStubs(ctx, unitFramework, outputDir);
    unit.push(...unitStubs);
  }

  if (config.stubs?.integration !== false) {
    const intStubs = generateIntegrationStubs(ctx, config, outputDir);
    integration.push(...intStubs);
  }

  return { unit, integration };
}

function generateUnitStubs(ctx, framework, outputDir) {
  const tplPath = join(TEMPLATES_DIR, framework, 'unit.template.js');
  if (!existsSync(tplPath)) return [];

  const template = readFileSync(tplPath, 'utf-8');
  const written = [];

  ctx.scenarios.forEach((scenario, i) => {
    const ctId = `CT-${String(i + 1).padStart(2, '0')}`;
    const fileName = `${ctId.toLowerCase()}-${slugify(scenario)}.unit.test.js`;
    const outPath = join(outputDir, 'tests', 'unit', fileName);

    const content = template
      .replace(/\{\{CT_ID\}\}/g, ctId)
      .replace(/\{\{TITLE\}\}/g, scenario)
      .replace(/\{\{FEATURE\}\}/g, ctx.feature);

    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, content);
    written.push(outPath);
  });

  return written;
}

function generateIntegrationStubs(ctx, config, outputDir) {
  const stack = ctx.stack;
  let tplName;

  if (stack.broker) {
    tplName = stack.lang === 'node' ? 'node-pg-kafka.template.js' : 'spring-pg-kafka.template.java';
  } else {
    tplName = 'node-pg.template.js';
  }

  const tplPath = join(TEMPLATES_DIR, 'testcontainers', tplName);
  if (!existsSync(tplPath)) return [];

  const template = readFileSync(tplPath, 'utf-8');
  const outPath = join(outputDir, 'tests', 'integration', `${slugify(ctx.feature)}.integration.test.js`);

  const content = template
    .replace(/\{\{FEATURE\}\}/g, ctx.feature)
    .replace(/\{\{CHANGE\}\}/g, ctx.changeName)
    .replace(/\{\{SCENARIOS\}\}/g, ctx.scenarios.map((s, i) =>
      `  // CT-${String(i + 1).padStart(2, '0')}: ${s}`).join('\n'));

  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, content);
  return [outPath];
}

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
