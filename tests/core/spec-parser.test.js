import { describe, it, expect } from 'vitest';
import { parseSpecs } from '../../src/core/spec-parser.js';

const baseArtifacts = {
  changeName: 'my-feature',
  proposal: '# My Feature\n\nSome context.\n\n## Out of scope\n- Notifications',
  design: '`POST /api/items` creates an item\n\n```sql\nSELECT id FROM items WHERE id = 1;\n```',
  specs: [
    '## Scenario: Happy path\nGiven a valid request\nWhen POST /api/items\nThen 201 Created\n\n## Rules\n- Rule: Must be authenticated',
  ],
  tasks: '- [ ] Implement POST /api/items',
  config: { stack: { lang: 'node', db: 'postgresql' } },
};

const config = { sdd: 'openspec', loadHints: true, chaosHints: true };

describe('parseSpecs', () => {
  it('extracts feature name from proposal heading', () => {
    const ctx = parseSpecs(baseArtifacts, config);
    expect(ctx.feature).toBe('My Feature');
  });

  it('uses changeName as fallback feature name', () => {
    const ctx = parseSpecs({ ...baseArtifacts, proposal: '' }, config);
    expect(ctx.feature).toBe('my-feature');
  });

  it('extracts scenarios from spec markdown', () => {
    const ctx = parseSpecs(baseArtifacts, config);
    expect(ctx.scenarios.length).toBeGreaterThan(0);
  });

  it('extracts business rules', () => {
    const ctx = parseSpecs(baseArtifacts, config);
    expect(ctx.rules).toContain('Must be authenticated');
  });

  it('extracts API contracts from design.md', () => {
    const ctx = parseSpecs(baseArtifacts, config);
    expect(ctx.contracts).toContain('POST /api/items');
  });

  it('extracts DB assertions from SQL blocks in design.md', () => {
    const ctx = parseSpecs(baseArtifacts, config);
    expect(ctx.dbAssertions[0]).toContain('SELECT id FROM items');
  });

  it('extracts out-of-scope items from proposal', () => {
    const ctx = parseSpecs(baseArtifacts, config);
    expect(ctx.outOfScope).toContain('Notifications');
  });

  it('sets stack from SDD config', () => {
    const ctx = parseSpecs(baseArtifacts, config);
    expect(ctx.stack.lang).toBe('node');
    expect(ctx.stack.db).toBe('postgresql');
  });

  it('returns null loadHints when config.loadHints is false', () => {
    const ctx = parseSpecs(baseArtifacts, { ...config, loadHints: false });
    expect(ctx.loadHints).toBeNull();
  });
});
