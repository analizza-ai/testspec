/**
 * src/core/spec-parser.js
 * Parses raw SDD artifact strings into a structured SpecContext object.
 * No LLM calls — pure text parsing.
 */

import matter from 'gray-matter';

/**
 * @typedef {object} SpecContext
 * @property {string} feature
 * @property {string} changeName
 * @property {string} sdd
 * @property {object} stack
 * @property {string[]} specs          raw spec content strings
 * @property {string[]} scenarios      extracted scenario titles
 * @property {string[]} rules          extracted business rules
 * @property {string[]} contracts      API contracts from design.md
 * @property {string[]} dbAssertions   DB validation hints from design.md
 * @property {string[]} outOfScope
 * @property {string|null} loadHints
 * @property {string|null} chaosHints
 * @property {object} rawArtifacts
 */

/**
 * @param {object} artifacts   output of SDD adapter.loadArtifacts()
 * @param {object} config      testspec.config.json
 * @returns {SpecContext}
 */
export function parseSpecs(artifacts, config) {
  const { proposal, design, specs, tasks, config: sddConfig, changeName } = artifacts;

  const feature = extractFeatureName(changeName, proposal);
  const stack = buildStack(sddConfig, config);

  return {
    feature,
    changeName,
    sdd: config.sdd || 'openspec',
    stack,
    specs,
    scenarios: extractScenarios(specs),
    rules: extractRules(specs),
    contracts: extractContracts(design),
    dbAssertions: extractDbAssertions(design),
    outOfScope: extractOutOfScope(proposal, specs),
    loadHints: config.loadHints ? extractLoadHints(specs, proposal) : null,
    chaosHints: config.chaosHints ? extractChaosHints(specs, design) : null,
    rawArtifacts: { proposal, design, specs, tasks },
  };
}

function extractFeatureName(changeName, proposal) {
  if (proposal) {
    const m = proposal.match(/^#\s+(.+)$/m);
    if (m) return m[1].trim();
    const fm = matter(proposal);
    if (fm.data.feature) return fm.data.feature;
  }
  return changeName;
}

function buildStack(sddConfig, testspecConfig) {
  return {
    lang: sddConfig?.stack?.lang || testspecConfig?.stack?.lang || 'node',
    db: sddConfig?.stack?.db || testspecConfig?.stack?.db || 'postgresql',
    broker: sddConfig?.stack?.broker || testspecConfig?.stack?.broker || null,
  };
}

function extractScenarios(specs) {
  const scenarios = [];
  for (const spec of specs) {
    const matches = spec.matchAll(/^#{2,4}\s+(?:Scenario|Cenário|Scenario:)\s*(.+)$/gim);
    for (const m of matches) scenarios.push(m[1].trim());
    // Also extract "Given/When/Then" blocks as scenario titles
    const gwt = spec.matchAll(/^#{2,4}\s+(.+)$/gm);
    for (const m of gwt) {
      const title = m[1].trim();
      if (!scenarios.includes(title)) scenarios.push(title);
    }
  }
  return [...new Set(scenarios)].slice(0, 50);
}

function extractRules(specs) {
  const rules = [];
  for (const spec of specs) {
    const matches = spec.matchAll(/^[-*]\s+(?:Rule|Regra):\s*(.+)$/gim);
    for (const m of matches) rules.push(m[1].trim());
    // Also capture bullet points under "Rules" / "Business Rules" headers
    const ruleSection = spec.match(/^#{2,3}\s+(?:Rules?|Business Rules?|Regras?)[^\n]*\n([\s\S]*?)(?=\n#{2,3}|$)/im);
    if (ruleSection) {
      const bullets = ruleSection[1].matchAll(/^[-*]\s+(.+)$/gm);
      for (const b of bullets) rules.push(b[1].trim());
    }
  }
  return [...new Set(rules)].slice(0, 30);
}

function extractContracts(design) {
  if (!design) return [];
  const contracts = [];
  const endpointMatches = design.matchAll(/`((?:GET|POST|PUT|PATCH|DELETE)\s+\/[^`]+)`/gi);
  for (const m of endpointMatches) contracts.push(m[1].trim());
  return [...new Set(contracts)];
}

function extractDbAssertions(design) {
  if (!design) return [];
  const assertions = [];
  const sqlMatches = design.matchAll(/```sql([\s\S]*?)```/gi);
  for (const m of sqlMatches) assertions.push(m[1].trim());
  return assertions;
}

function extractOutOfScope(proposal, specs) {
  const outOfScope = [];
  const sources = [proposal, ...specs].filter(Boolean);
  for (const src of sources) {
    const section = src.match(/^#{2,3}\s+Out of [Ss]cope[^\n]*\n([\s\S]*?)(?=\n#{2,3}|$)/im);
    if (section) {
      const bullets = section[1].matchAll(/^[-*]\s+(.+)$/gm);
      for (const b of bullets) outOfScope.push(b[1].trim());
    }
  }
  return [...new Set(outOfScope)];
}

function extractLoadHints(specs, proposal) {
  const sources = [...specs, proposal].filter(Boolean).join('\n');
  const section = sources.match(/^#{2,3}\s+(?:Load|Performance|NFR)[^\n]*\n([\s\S]*?)(?=\n#{2,3}|$)/im);
  return section ? section[1].trim() : null;
}

function extractChaosHints(specs, design) {
  const sources = [design, ...specs].filter(Boolean).join('\n');
  const section = sources.match(/^#{2,3}\s+(?:Chaos|Failure|Resilience)[^\n]*\n([\s\S]*?)(?=\n#{2,3}|$)/im);
  return section ? section[1].trim() : null;
}
