import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { generateStubs } from '../../src/core/stub-generator.js';
import { mkdirSync, rmSync, existsSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

const ctx = {
  feature: 'Item Creation',
  changeName: 'item-creation',
  sdd: 'openspec',
  stack: { lang: 'node', db: 'postgresql', broker: null },
  scenarios: ['Happy path', 'Missing auth'],
};

let tmpDir;

beforeEach(() => {
  tmpDir = join(tmpdir(), `testspec-test-${Date.now()}`);
  mkdirSync(tmpDir, { recursive: true });
});

afterEach(() => {
  rmSync(tmpDir, { recursive: true, force: true });
});

describe('generateStubs', () => {
  it('generates unit stubs for each scenario', () => {
    const config = { unitFramework: 'vitest', stubs: { unit: true, integration: true } };
    const result = generateStubs(ctx, config, tmpDir);
    expect(result.unit.length).toBe(ctx.scenarios.length);
    expect(existsSync(result.unit[0])).toBe(true);
  });

  it('generates integration stub for the change', () => {
    const config = { unitFramework: 'vitest', stubs: { unit: true, integration: true } };
    const result = generateStubs(ctx, config, tmpDir);
    expect(result.integration.length).toBe(1);
    expect(existsSync(result.integration[0])).toBe(true);
  });

  it('skips unit stubs when config.stubs.unit is false', () => {
    const config = { unitFramework: 'vitest', stubs: { unit: false, integration: true } };
    const result = generateStubs(ctx, config, tmpDir);
    expect(result.unit.length).toBe(0);
  });
});
