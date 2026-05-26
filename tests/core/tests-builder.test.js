import { describe, it, expect } from 'vitest';
import { buildPrompt, buildTests } from '../../src/core/tests-builder.js';

const ctx = {
  feature: 'Item Creation',
  changeName: 'item-creation',
  sdd: 'openspec',
  stack: { lang: 'node', db: 'postgresql', broker: null },
  specs: ['## Scenario: Happy path\nGiven a valid payload'],
  scenarios: ['Happy path'],
  rules: ['Must be authenticated'],
  contracts: ['POST /api/items'],
  dbAssertions: ['SELECT id FROM items WHERE id = $1'],
  outOfScope: ['Notifications'],
  loadHints: null,
  chaosHints: null,
};

const config = { sdd: 'openspec', loadHints: true, chaosHints: true };

describe('buildPrompt', () => {
  it('includes the feature name', () => {
    const prompt = buildPrompt(ctx, config);
    expect(prompt).toContain('Item Creation');
  });

  it('includes extracted scenarios', () => {
    const prompt = buildPrompt(ctx, config);
    expect(prompt).toContain('Happy path');
  });

  it('includes API contracts', () => {
    const prompt = buildPrompt(ctx, config);
    expect(prompt).toContain('POST /api/items');
  });

  it('instructs the agent to use CT-01..N format', () => {
    const prompt = buildPrompt(ctx, config);
    expect(prompt).toContain('CT-01');
  });
});

describe('buildTests', () => {
  it('returns a string with YAML front-matter', () => {
    const result = buildTests(ctx);
    expect(result).toContain('feature: Item Creation');
    expect(result).toContain('change: item-creation');
  });

  it('includes out-of-scope items', () => {
    const result = buildTests(ctx);
    expect(result).toContain('Notifications');
  });
});
