import { describe, it, expect } from 'vitest';
import { boundsRule, overlapRule, alignmentRule, NEAR_ALIGNMENT_THRESHOLD } from '../src/rules.js';
import { makeElement, makeScene } from './fixtures.js';

describe('boundsRule', () => {
  it('returns no results when all elements are inside canvas', () => {
    const scene = makeScene({
      elements: [
        makeElement({ id: 'a', x: 10, y: 10, width: 20, height: 20 }),
        makeElement({ id: 'b', x: 100, y: 100, width: 30, height: 30 }),
      ],
    });
    const results = boundsRule(scene);
    expect(results).toHaveLength(0);
  });

  it('reports error when element exceeds top boundary', () => {
    const scene = makeScene({
      elements: [makeElement({ id: 'a', label: 'elem-a', x: 100, y: -10, width: 20, height: 20 })],
    });
    const results = boundsRule(scene);
    expect(results).toHaveLength(1);
    expect(results[0].severity).toBe('error');
    expect(results[0].elementIds).toContain('a');
    expect(results[0].message).toMatch(/elem-a/);
    expect(results[0].message).toMatch(/\d+:-?\d+/); // position x:y (allowing negative y)
    expect(results[0].message).toMatch(/\d+x\d+/); // size WxH
    expect(results[0].message).toMatch(/top/i);
  });

  it('reports error when element exceeds right boundary', () => {
    const scene = makeScene({
      elements: [makeElement({ id: 'a', label: 'elem-a', x: 310, y: 100, width: 20, height: 20 })],
    });
    const results = boundsRule(scene);
    expect(results).toHaveLength(1);
    expect(results[0].severity).toBe('error');
    expect(results[0].elementIds).toContain('a');
    expect(results[0].message).toMatch(/elem-a/);
    expect(results[0].message).toMatch(/right/i);
  });

  it('reports error when element exceeds bottom boundary', () => {
    const scene = makeScene({
      elements: [makeElement({ id: 'a', label: 'elem-a', x: 100, y: 230, width: 20, height: 20 })],
    });
    const results = boundsRule(scene);
    expect(results).toHaveLength(1);
    expect(results[0].severity).toBe('error');
    expect(results[0].elementIds).toContain('a');
    expect(results[0].message).toMatch(/elem-a/);
    expect(results[0].message).toMatch(/bottom/i);
  });

  it('reports error when element exceeds left boundary', () => {
    const scene = makeScene({
      elements: [makeElement({ id: 'a', label: 'elem-a', x: -15, y: 100, width: 20, height: 20 })],
    });
    const results = boundsRule(scene);
    expect(results).toHaveLength(1);
    expect(results[0].severity).toBe('error');
    expect(results[0].elementIds).toContain('a');
    expect(results[0].message).toMatch(/elem-a/);
    expect(results[0].message).toMatch(/left/i);
  });

  it('reports one error per element (not per edge) when exceeding multiple edges', () => {
    const scene = makeScene({
      elements: [makeElement({ id: 'a', label: 'elem-a', x: -10, y: -10, width: 20, height: 20 })],
    });
    const results = boundsRule(scene);
    expect(results).toHaveLength(1);
    expect(results[0].elementIds).toContain('a');
  });

  it('includes pixel count in error message', () => {
    const scene = makeScene({
      elements: [makeElement({ id: 'a', label: 'elem-a', x: -15, y: 100, width: 20, height: 20 })],
    });
    const results = boundsRule(scene);
    expect(results[0].message).toMatch(/15/); // exceeded by 15px
  });

  it('uses element id as fallback when label is missing', () => {
    const scene = makeScene({
      elements: [makeElement({ id: 'elem-without-label', x: -10, y: 100, width: 20, height: 20 })],
    });
    const results = boundsRule(scene);
    expect(results).toHaveLength(1);
    expect(results[0].message).toMatch(/elem-without-label/);
  });
});

describe('overlapRule', () => {
  it('returns no results when elements do not overlap', () => {
    const scene = makeScene({
      elements: [
        makeElement({ id: 'a', x: 0, y: 0, width: 20, height: 20 }),
        makeElement({ id: 'b', x: 30, y: 30, width: 20, height: 20 }),
      ],
    });
    const results = overlapRule(scene);
    expect(results).toHaveLength(0);
  });

  it('returns no results when elements only touch at edges', () => {
    const scene = makeScene({
      elements: [
        makeElement({ id: 'a', x: 0, y: 0, width: 20, height: 20 }),
        makeElement({ id: 'b', x: 20, y: 0, width: 20, height: 20 }),
      ],
    });
    const results = overlapRule(scene);
    expect(results).toHaveLength(0);
  });

  it('returns warning when two elements overlap', () => {
    const scene = makeScene({
      elements: [
        makeElement({ id: 'a', label: 'elem-a', x: 0, y: 0, width: 20, height: 20 }),
        makeElement({ id: 'b', label: 'elem-b', x: 10, y: 10, width: 20, height: 20 }),
      ],
    });
    const results = overlapRule(scene);
    expect(results).toHaveLength(1);
    expect(results[0].severity).toBe('warning');
    expect(results[0].elementIds).toContain('a');
    expect(results[0].elementIds).toContain('b');
    expect(results[0].message).toMatch(/elem-a/);
    expect(results[0].message).toMatch(/elem-b/);
  });

  it('reports only overlapping pair when three elements exist and only two overlap', () => {
    const scene = makeScene({
      elements: [
        makeElement({ id: 'a', label: 'elem-a', x: 0, y: 0, width: 20, height: 20 }),
        makeElement({ id: 'b', label: 'elem-b', x: 10, y: 10, width: 20, height: 20 }),
        makeElement({ id: 'c', label: 'elem-c', x: 100, y: 100, width: 20, height: 20 }),
      ],
    });
    const results = overlapRule(scene);
    expect(results).toHaveLength(1);
    expect(results[0].elementIds).toContain('a');
    expect(results[0].elementIds).toContain('b');
    expect(results[0].elementIds).not.toContain('c');
  });

  it('reports multiple pairs if several pairs overlap', () => {
    const scene = makeScene({
      elements: [
        makeElement({ id: 'a', label: 'elem-a', x: 0, y: 0, width: 20, height: 20 }),
        makeElement({ id: 'b', label: 'elem-b', x: 10, y: 10, width: 20, height: 20 }),
        makeElement({ id: 'c', label: 'elem-c', x: 15, y: 15, width: 20, height: 20 }),
      ],
    });
    const results = overlapRule(scene);
    expect(results.length).toBeGreaterThanOrEqual(2);
  });
});

describe('alignmentRule', () => {
  it('returns no results when single element', () => {
    const scene = makeScene({
      elements: [makeElement({ id: 'a', x: 10, y: 20, width: 20, height: 20 })],
    });
    const results = alignmentRule(scene);
    expect(results).toHaveLength(0);
  });

  it('returns ok result when two elements are aligned on X (same left edge)', () => {
    const scene = makeScene({
      elements: [
        makeElement({ id: 'a', label: 'elem-a', x: 50, y: 10, width: 20, height: 20 }),
        makeElement({ id: 'b', label: 'elem-b', x: 50, y: 100, width: 20, height: 20 }),
      ],
    });
    const results = alignmentRule(scene);
    const xAligned = results.filter((r) => r.message.toLowerCase().includes('x'));
    expect(xAligned.length).toBeGreaterThan(0);
    expect(xAligned[0].severity).toBe('ok');
    expect(xAligned[0].elementIds).toContain('a');
    expect(xAligned[0].elementIds).toContain('b');
  });

  it('returns ok result when two elements are aligned on Y (same top edge)', () => {
    const scene = makeScene({
      elements: [
        makeElement({ id: 'a', label: 'elem-a', x: 10, y: 50, width: 20, height: 20 }),
        makeElement({ id: 'b', label: 'elem-b', x: 100, y: 50, width: 20, height: 20 }),
      ],
    });
    const results = alignmentRule(scene);
    const yAligned = results.filter((r) => r.message.toLowerCase().includes('y'));
    expect(yAligned.length).toBeGreaterThan(0);
    expect(yAligned[0].severity).toBe('ok');
    expect(yAligned[0].elementIds).toContain('a');
    expect(yAligned[0].elementIds).toContain('b');
  });

  it('returns warning when two elements are nearly aligned on X with delta within threshold', () => {
    const scene = makeScene({
      elements: [
        makeElement({ id: 'a', label: 'elem-a', x: 50, y: 10, width: 20, height: 20 }),
        makeElement({ id: 'b', label: 'elem-b', x: 52, y: 100, width: 20, height: 20 }), // delta = 2px
      ],
    });
    const results = alignmentRule(scene);
    const xNear = results.filter((r) => r.message.toLowerCase().includes('x'));
    expect(xNear.length).toBeGreaterThan(0);
    expect(xNear[0].severity).toBe('warning');
    expect(xNear[0].message).toMatch(/2/); // delta value
  });

  it('returns warning when two elements are nearly aligned on Y with delta within threshold', () => {
    const scene = makeScene({
      elements: [
        makeElement({ id: 'a', label: 'elem-a', x: 10, y: 50, width: 20, height: 20 }),
        makeElement({ id: 'b', label: 'elem-b', x: 100, y: 54, width: 20, height: 20 }), // delta = 4px
      ],
    });
    const results = alignmentRule(scene);
    const yNear = results.filter((r) => r.message.toLowerCase().includes('y'));
    expect(yNear.length).toBeGreaterThan(0);
    expect(yNear[0].severity).toBe('warning');
    expect(yNear[0].message).toMatch(/4/); // delta value
  });

  it('returns no result when elements are far apart on both axes', () => {
    const scene = makeScene({
      elements: [
        makeElement({ id: 'a', x: 10, y: 20, width: 20, height: 20 }),
        makeElement({ id: 'b', x: 200, y: 200, width: 20, height: 20 }),
      ],
    });
    const results = alignmentRule(scene);
    expect(results).toHaveLength(0);
  });

  it('threshold constant is defined and equals 5', () => {
    expect(NEAR_ALIGNMENT_THRESHOLD).toBe(5);
  });

  it('returns warning when delta is exactly at threshold (5px)', () => {
    const scene = makeScene({
      elements: [
        makeElement({ id: 'a', label: 'elem-a', x: 50, y: 10, width: 20, height: 20 }),
        makeElement({ id: 'b', label: 'elem-b', x: 55, y: 100, width: 20, height: 20 }), // delta = 5px (at threshold)
      ],
    });
    const results = alignmentRule(scene);
    const xNear = results.filter((r) => r.message.toLowerCase().includes('x'));
    expect(xNear.length).toBeGreaterThan(0);
    expect(xNear[0].severity).toBe('warning');
  });

  it('returns no result when delta exceeds threshold (6px)', () => {
    const scene = makeScene({
      elements: [
        makeElement({ id: 'a', x: 50, y: 10, width: 20, height: 20 }),
        makeElement({ id: 'b', x: 56, y: 100, width: 20, height: 20 }), // delta = 6px (beyond threshold)
      ],
    });
    const results = alignmentRule(scene);
    // Should have no near-alignment warnings for X, only results far outside threshold
    const xNear = results.filter((r) => r.message.toLowerCase().includes('x') && r.severity === 'warning');
    expect(xNear).toHaveLength(0);
  });

  it('correctly handles both positive and negative deltas', () => {
    const scene = makeScene({
      elements: [
        makeElement({ id: 'a', label: 'elem-a', x: 50, y: 10, width: 20, height: 20 }),
        makeElement({ id: 'b', label: 'elem-b', x: 45, y: 100, width: 20, height: 20 }), // delta = 5px (negative direction)
      ],
    });
    const results = alignmentRule(scene);
    const xNear = results.filter((r) => r.message.toLowerCase().includes('x'));
    expect(xNear.length).toBeGreaterThan(0);
    expect(xNear[0].severity).toBe('warning');
  });
});
