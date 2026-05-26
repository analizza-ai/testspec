/**
 * src/adapters/sdd/speckit.js
 * SpecKit adapter stub. Interface only — not yet implemented.
 * Implement discoverChanges / loadArtifacts / getOutputPath when SpecKit is supported.
 */

export class SpecKitAdapter {
  discoverChanges(_root) {
    throw new Error('SpecKit adapter is not yet implemented.');
  }

  loadArtifacts(_root, _changeName) {
    throw new Error('SpecKit adapter is not yet implemented.');
  }

  getOutputPath(_root, _changeName) {
    throw new Error('SpecKit adapter is not yet implemented.');
  }
}
