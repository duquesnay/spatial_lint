import type { Scene, Rule, LintResult } from './types.js';
import { boundsRule, overlapRule, alignmentRule } from './rules.js';
import { formatResults } from './reporter.js';

export type { Scene, SceneElement, LintResult, Rule, Severity } from './types.js';
export type { AABB, BoundsExceeded } from './geometry.js';
export { bounds, intersects, overlapArea, exceedsBounds } from './geometry.js';
export { parseScene } from './adapter-json.js';
export { boundsRule, overlapRule, alignmentRule, NEAR_ALIGNMENT_THRESHOLD } from './rules.js';
export { formatResults } from './reporter.js';

/**
 * Run lint rules on a scene and return all results.
 *
 * @param scene - Scene to lint
 * @param rules - Array of rules to apply. Defaults to all 3 built-in rules.
 * @returns Array of LintResult objects from all applied rules
 */
export function lintScene(scene: Scene, rules?: Rule[]): LintResult[] {
  const rulesToUse = rules ?? [boundsRule, overlapRule, alignmentRule];
  const results: LintResult[] = [];

  for (const rule of rulesToUse) {
    const ruleResults = rule(scene);
    results.push(...ruleResults);
  }

  return results;
}
