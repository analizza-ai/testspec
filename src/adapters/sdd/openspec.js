/**
 * src/adapters/sdd/openspec.js
 * Full OpenSpec adapter. Reads change folders under openspec/changes/{name}/
 * and loads proposal.md, design.md, specs/**\/*.md, tasks.md, config.yaml.
 */

import { existsSync, readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { glob } from 'glob';
import yaml from 'js-yaml';

export class OpenSpecAdapter {
  /** @returns {string[]} list of change names (non-archived) */
  discoverChanges(root) {
    const changesDir = join(root, 'openspec', 'changes');
    if (!existsSync(changesDir)) return [];
    return readdirSync(changesDir, { withFileTypes: true })
      .filter((e) => e.isDirectory() && e.name !== 'archive')
      .map((e) => e.name)
      .sort();
  }

  /**
   * Loads all spec artifacts for a change.
   * @returns {{ proposal: string, design: string, specs: string[], tasks: string, config: object }}
   */
  loadArtifacts(root, changeName) {
    const base = join(root, 'openspec', 'changes', changeName);

    const read = (file) => {
      const p = join(base, file);
      return existsSync(p) ? readFileSync(p, 'utf-8') : '';
    };

    const specFiles = glob.sync('specs/**/*.md', { cwd: base });
    const specs = specFiles.map((f) => readFileSync(join(base, f), 'utf-8'));

    const configPath = join(root, 'openspec', 'config.yaml');
    const config = existsSync(configPath)
      ? yaml.load(readFileSync(configPath, 'utf-8'))
      : {};

    return {
      proposal: read('proposal.md'),
      design: read('design.md'),
      specs,
      specFiles,
      tasks: read('tasks.md'),
      config,
      changeName,
    };
  }

  /** @returns {string} absolute path where tests.md should be written */
  getOutputPath(root, changeName) {
    return join(root, 'openspec', 'changes', changeName, 'tests.md');
  }
}
