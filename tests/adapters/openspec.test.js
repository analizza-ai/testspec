import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { OpenSpecAdapter } from '../../src/adapters/sdd/openspec.js';
import { mkdirSync, writeFileSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

let tmpRoot;
let adapter;

beforeAll(() => {
  tmpRoot = join(tmpdir(), `testspec-openspec-${Date.now()}`);
  const changeDir = join(tmpRoot, 'openspec', 'changes', 'my-feature', 'specs');
  mkdirSync(changeDir, { recursive: true });

  writeFileSync(join(tmpRoot, 'openspec', 'changes', 'my-feature', 'proposal.md'), '# My Feature\nSome context.');
  writeFileSync(join(tmpRoot, 'openspec', 'changes', 'my-feature', 'design.md'), '`POST /api/items`');
  writeFileSync(join(changeDir, 'spec.md'), '## Scenario: Happy path');
  writeFileSync(join(tmpRoot, 'openspec', 'changes', 'my-feature', 'tasks.md'), '- [ ] task');

  adapter = new OpenSpecAdapter();
});

afterAll(() => {
  rmSync(tmpRoot, { recursive: true, force: true });
});

describe('OpenSpecAdapter', () => {
  it('discovers change folders', () => {
    const changes = adapter.discoverChanges(tmpRoot);
    expect(changes).toContain('my-feature');
  });

  it('loads artifacts for a change', () => {
    const artifacts = adapter.loadArtifacts(tmpRoot, 'my-feature');
    expect(artifacts.proposal).toContain('My Feature');
    expect(artifacts.design).toContain('POST /api/items');
    expect(artifacts.specs.length).toBe(1);
    expect(artifacts.tasks).toContain('task');
  });

  it('returns correct output path', () => {
    const path = adapter.getOutputPath(tmpRoot, 'my-feature');
    expect(path).toContain('my-feature/tests.md');
  });
});
