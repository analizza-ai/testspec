/**
 * src/index.js
 * Public API surface for programmatic use of @analizza-ai/testspec.
 */

export { parseSpecs } from './core/spec-parser.js';
export { buildTests } from './core/tests-builder.js';
export { generateStubs } from './core/stub-generator.js';
export { loadConfig, resolveConfigPath } from './utils/config.js';
export { detectSdd } from './utils/sdd-detector.js';
