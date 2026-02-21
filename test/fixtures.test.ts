import { describe, it, expect, beforeEach } from 'vitest';
import { makeElement, makeScene } from './fixtures.js';

describe('makeElement', () => {
  beforeEach(() => {
    // Reset counter between tests by re-importing
    // (This is handled by the fixture module)
  });

  it('returns a SceneElement with sensible defaults', () => {
    const element = makeElement();
    expect(element).toHaveProperty('id');
    expect(element).toHaveProperty('x');
    expect(element).toHaveProperty('y');
    expect(element).toHaveProperty('width');
    expect(element).toHaveProperty('height');
    expect(typeof element.id).toBe('string');
    expect(typeof element.x).toBe('number');
    expect(typeof element.y).toBe('number');
    expect(typeof element.width).toBe('number');
    expect(typeof element.height).toBe('number');
  });

  it('overrides just x and keeps other defaults', () => {
    const element = makeElement({ x: 50 });
    expect(element.x).toBe(50);
    expect(element.y).toBe(0);
    expect(element.width).toBe(32);
    expect(element.height).toBe(32);
    expect(element.id).toBeDefined();
  });

  it('generates unique ids for multiple elements', () => {
    const el1 = makeElement();
    const el2 = makeElement();
    expect(el1.id).not.toBe(el2.id);
  });
});

describe('makeScene', () => {
  it('returns a Scene with 320x240 canvas and empty elements', () => {
    const scene = makeScene();
    expect(scene).toHaveProperty('canvas');
    expect(scene).toHaveProperty('elements');
    expect(scene.canvas.width).toBe(320);
    expect(scene.canvas.height).toBe(240);
    expect(scene.elements).toEqual([]);
  });

  it('includes elements when provided', () => {
    const element = makeElement();
    const scene = makeScene({ elements: [element] });
    expect(scene.elements).toHaveLength(1);
    expect(scene.elements[0]).toBe(element);
  });

  it('can override canvas dimensions', () => {
    const scene = makeScene({ canvas: { width: 640, height: 480 } });
    expect(scene.canvas.width).toBe(640);
    expect(scene.canvas.height).toBe(480);
  });
});
