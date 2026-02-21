import type { SceneElement, Scene } from '../src/types.js';

let counter = 0;

export function makeElement(overrides?: Partial<SceneElement>): SceneElement {
  counter++;
  return {
    id: `el-${counter}`,
    x: 0,
    y: 0,
    width: 32,
    height: 32,
    ...overrides,
  };
}

export function makeScene(overrides?: Partial<Scene>): Scene {
  return {
    canvas: { width: 320, height: 240 },
    elements: [],
    ...overrides,
  };
}
