import { describe, it, expect } from 'vitest';
import { lintScene } from '../src/index.js';
import { boundsRule, overlapRule, alignmentRule } from '../src/index.js';
import { makeElement, makeScene } from './fixtures.js';

describe('lintScene', () => {
  it('returns empty array for empty scene', () => {
    const scene = makeScene();
    const results = lintScene(scene);
    expect(results).toEqual([]);
  });

  it('returns empty array for scene with no violations', () => {
    const scene = makeScene({
      elements: [
        makeElement({ id: 'a', x: 0, y: 0, width: 32, height: 32 }),
        makeElement({ id: 'b', x: 50, y: 100, width: 32, height: 32 }),
      ],
    });
    const results = lintScene(scene);
    expect(results).toEqual([]);
  });

  it('detects element that exceeds canvas bounds', () => {
    const scene = makeScene({
      canvas: { width: 320, height: 240 },
      elements: [makeElement({ id: 'score', x: 155, y: -3, width: 80, height: 20 })],
    });
    const results = lintScene(scene);
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((r) => r.severity === 'error')).toBe(true);
    expect(results.some((r) => r.elementIds.includes('score'))).toBe(true);
  });

  it('detects overlapping elements', () => {
    const scene = makeScene({
      canvas: { width: 320, height: 240 },
      elements: [
        makeElement({ id: 'a', x: 0, y: 0, width: 50, height: 50 }),
        makeElement({ id: 'b', x: 25, y: 25, width: 50, height: 50 }),
      ],
    });
    const results = lintScene(scene);
    expect(results.some((r) => r.rule === 'overlapRule')).toBe(true);
    expect(results.some((r) => r.severity === 'warning')).toBe(true);
  });

  it('uses all 3 default rules when none specified', () => {
    const scene = makeScene({
      canvas: { width: 320, height: 240 },
      elements: [
        makeElement({ id: 'out', x: 0, y: -10, width: 32, height: 32 }), // bounds
        makeElement({ id: 'overlap1', x: 50, y: 50, width: 50, height: 50 }), // overlap
        makeElement({ id: 'overlap2', x: 75, y: 50, width: 50, height: 50 }), // overlap
        makeElement({ id: 'aligned', x: 100, y: 100, width: 32, height: 32 }), // alignment
        makeElement({ id: 'near', x: 104, y: 100, width: 32, height: 32 }), // alignment
      ],
    });
    const results = lintScene(scene);

    const rules = new Set(results.map((r) => r.rule));
    expect(rules.has('boundsRule')).toBe(true);
    expect(rules.has('overlapRule')).toBe(true);
    expect(rules.has('alignmentRule')).toBe(true);
  });

  it('accepts custom rule array', () => {
    const scene = makeScene({
      canvas: { width: 320, height: 240 },
      elements: [
        makeElement({ id: 'out', x: 0, y: -10, width: 32, height: 32 }),
        makeElement({ id: 'overlap1', x: 50, y: 50, width: 50, height: 50 }),
        makeElement({ id: 'overlap2', x: 75, y: 50, width: 50, height: 50 }),
      ],
    });

    const results = lintScene(scene, [boundsRule]);
    expect(results.every((r) => r.rule === 'boundsRule')).toBe(true);
  });

  it('combines results from all provided rules', () => {
    const scene = makeScene({
      canvas: { width: 320, height: 240 },
      elements: [
        makeElement({ id: 'out', x: 0, y: -10, width: 32, height: 32 }),
        makeElement({ id: 'overlap1', x: 50, y: 50, width: 50, height: 50 }),
        makeElement({ id: 'overlap2', x: 75, y: 50, width: 50, height: 50 }),
      ],
    });

    const results = lintScene(scene, [boundsRule, overlapRule]);
    const rules = new Set(results.map((r) => r.rule));
    expect(rules.has('boundsRule')).toBe(true);
    expect(rules.has('overlapRule')).toBe(true);
    expect(rules.has('alignmentRule')).toBe(false);
  });
});
