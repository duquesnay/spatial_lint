import { describe, it, expect } from 'vitest';
import { bounds, intersects, overlapArea, exceedsBounds } from '../src/geometry.js';
import { makeElement, makeScene } from './fixtures.js';

describe('bounds', () => {
  it('returns AABB bounds from element position and size', () => {
    const element = makeElement({ x: 10, y: 20, width: 30, height: 40 });
    const result = bounds(element);
    expect(result).toEqual({ left: 10, top: 20, right: 40, bottom: 60 });
  });

  it('handles element at origin', () => {
    const element = makeElement({ x: 0, y: 0, width: 32, height: 32 });
    const result = bounds(element);
    expect(result).toEqual({ left: 0, top: 0, right: 32, bottom: 32 });
  });

  it('handles negative coordinates', () => {
    const element = makeElement({ x: -10, y: -20, width: 50, height: 50 });
    const result = bounds(element);
    expect(result).toEqual({ left: -10, top: -20, right: 40, bottom: 30 });
  });
});

describe('intersects', () => {
  it('returns true when AABBs overlap', () => {
    const a = makeElement({ x: 0, y: 0, width: 20, height: 20 });
    const b = makeElement({ x: 10, y: 10, width: 20, height: 20 });
    expect(intersects(a, b)).toBe(true);
  });

  it('returns false when AABBs touch but do not overlap', () => {
    const a = makeElement({ x: 0, y: 0, width: 20, height: 20 });
    const b = makeElement({ x: 20, y: 0, width: 20, height: 20 });
    expect(intersects(a, b)).toBe(false);
  });

  it('returns false when AABBs are separated', () => {
    const a = makeElement({ x: 0, y: 0, width: 20, height: 20 });
    const b = makeElement({ x: 30, y: 30, width: 20, height: 20 });
    expect(intersects(a, b)).toBe(false);
  });

  it('returns true when one AABB is fully contained inside another', () => {
    const a = makeElement({ x: 0, y: 0, width: 40, height: 40 });
    const b = makeElement({ x: 10, y: 10, width: 10, height: 10 });
    expect(intersects(a, b)).toBe(true);
  });

  it('returns true when AABBs are identical', () => {
    const a = makeElement({ x: 5, y: 5, width: 20, height: 20 });
    const b = makeElement({ x: 5, y: 5, width: 20, height: 20 });
    expect(intersects(a, b)).toBe(true);
  });
});

describe('overlapArea', () => {
  it('returns correct area for partial overlap', () => {
    const a = makeElement({ x: 0, y: 0, width: 20, height: 20 });
    const b = makeElement({ x: 10, y: 10, width: 20, height: 20 });
    // Overlap region: x [10, 20], y [10, 20] = 10x10 = 100
    expect(overlapArea(a, b)).toBe(100);
  });

  it('returns 0 when AABBs do not overlap', () => {
    const a = makeElement({ x: 0, y: 0, width: 20, height: 20 });
    const b = makeElement({ x: 30, y: 30, width: 20, height: 20 });
    expect(overlapArea(a, b)).toBe(0);
  });

  it('returns 0 when AABBs only touch at edges', () => {
    const a = makeElement({ x: 0, y: 0, width: 20, height: 20 });
    const b = makeElement({ x: 20, y: 0, width: 20, height: 20 });
    expect(overlapArea(a, b)).toBe(0);
  });

  it('returns area of smaller element when one is fully contained', () => {
    const a = makeElement({ x: 0, y: 0, width: 40, height: 40 });
    const b = makeElement({ x: 10, y: 10, width: 10, height: 10 });
    // Smaller element area: 10x10 = 100
    expect(overlapArea(a, b)).toBe(100);
  });

  it('returns full area when AABBs are identical', () => {
    const a = makeElement({ x: 0, y: 0, width: 20, height: 20 });
    const b = makeElement({ x: 0, y: 0, width: 20, height: 20 });
    expect(overlapArea(a, b)).toBe(400);
  });
});

describe('exceedsBounds', () => {
  it('returns null when element is fully inside canvas', () => {
    const scene = makeScene();
    const element = makeElement({ x: 10, y: 10, width: 20, height: 20 });
    const result = exceedsBounds(element, scene.canvas);
    expect(result).toBeNull();
  });

  it('returns { top: N } when element exceeds top boundary', () => {
    const canvas = { width: 320, height: 240 };
    const element = makeElement({ x: 100, y: -10, width: 20, height: 20 });
    const result = exceedsBounds(element, canvas);
    expect(result).toEqual({ top: 10 });
  });

  it('returns { bottom: N } when element exceeds bottom boundary', () => {
    const canvas = { width: 320, height: 240 };
    const element = makeElement({ x: 100, y: 230, width: 20, height: 20 });
    const result = exceedsBounds(element, canvas);
    expect(result).toEqual({ bottom: 10 });
  });

  it('returns { left: N } when element exceeds left boundary', () => {
    const canvas = { width: 320, height: 240 };
    const element = makeElement({ x: -15, y: 100, width: 20, height: 20 });
    const result = exceedsBounds(element, canvas);
    expect(result).toEqual({ left: 15 });
  });

  it('returns { right: N } when element exceeds right boundary', () => {
    const canvas = { width: 320, height: 240 };
    const element = makeElement({ x: 310, y: 100, width: 20, height: 20 });
    const result = exceedsBounds(element, canvas);
    expect(result).toEqual({ right: 10 });
  });

  it('returns multiple edges exceeded with their amounts', () => {
    const canvas = { width: 320, height: 240 };
    const element = makeElement({ x: -10, y: -10, width: 20, height: 20 });
    const result = exceedsBounds(element, canvas);
    expect(result).toEqual({ top: 10, left: 10 });
  });

  it('handles element exceeding all four boundaries', () => {
    const canvas = { width: 320, height: 240 };
    const element = makeElement({ x: -10, y: -10, width: 340, height: 260 });
    const result = exceedsBounds(element, canvas);
    expect(result).toEqual({ top: 10, left: 10, right: 10, bottom: 10 });
  });

  it('returns null when element exactly matches canvas boundaries', () => {
    const canvas = { width: 320, height: 240 };
    const element = makeElement({ x: 0, y: 0, width: 320, height: 240 });
    const result = exceedsBounds(element, canvas);
    expect(result).toBeNull();
  });
});
