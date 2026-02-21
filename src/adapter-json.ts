import type { Scene, SceneElement } from './types.js';

/**
 * Parses unknown input into a typed Scene, validating all required fields.
 * Uses fail-fast approach: throws on first validation error.
 *
 * @param input - Unknown input to parse (typically from JSON)
 * @returns Typed Scene if validation succeeds
 * @throws Error with descriptive message on validation failure
 */
export function parseScene(input: unknown): Scene {
  // Validate input is an object and not null/array
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    throw new Error('Scene must be an object');
  }

  const obj = input as Record<string, unknown>;

  // Validate canvas exists
  if (!('canvas' in obj)) {
    throw new Error('Scene must have a canvas property');
  }

  const canvas = obj.canvas;
  if (typeof canvas !== 'object' || canvas === null || Array.isArray(canvas)) {
    throw new Error('canvas must be an object');
  }

  const canvasObj = canvas as Record<string, unknown>;

  // Validate canvas.width
  if (!('width' in canvasObj)) {
    throw new Error('canvas must have a width property');
  }
  if (typeof canvasObj.width !== 'number') {
    throw new Error('canvas.width must be a number');
  }

  // Validate canvas.height
  if (!('height' in canvasObj)) {
    throw new Error('canvas must have a height property');
  }
  if (typeof canvasObj.height !== 'number') {
    throw new Error('canvas.height must be a number');
  }

  // Validate elements exists
  if (!('elements' in obj)) {
    throw new Error('Scene must have an elements property');
  }

  const elements = obj.elements;
  if (!Array.isArray(elements)) {
    throw new Error('elements must be an array');
  }

  // Validate each element
  const validatedElements: SceneElement[] = [];
  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];

    if (typeof el !== 'object' || el === null || Array.isArray(el)) {
      throw new Error(`Element at index ${i} must be an object`);
    }

    const elObj = el as Record<string, unknown>;

    // Validate element.id
    if (!('id' in elObj)) {
      throw new Error(`Element at index ${i} must have an id property`);
    }
    if (typeof elObj.id !== 'string') {
      throw new Error(`Element at index ${i} id must be a string`);
    }

    // Validate element.x
    if (!('x' in elObj)) {
      throw new Error(`Element at index ${i} must have an x property`);
    }
    if (typeof elObj.x !== 'number') {
      throw new Error(`Element at index ${i} x must be a number`);
    }

    // Validate element.y
    if (!('y' in elObj)) {
      throw new Error(`Element at index ${i} must have a y property`);
    }
    if (typeof elObj.y !== 'number') {
      throw new Error(`Element at index ${i} y must be a number`);
    }

    // Validate element.width
    if (!('width' in elObj)) {
      throw new Error(`Element at index ${i} must have a width property`);
    }
    if (typeof elObj.width !== 'number') {
      throw new Error(`Element at index ${i} width must be a number`);
    }

    // Validate element.height
    if (!('height' in elObj)) {
      throw new Error(`Element at index ${i} must have a height property`);
    }
    if (typeof elObj.height !== 'number') {
      throw new Error(`Element at index ${i} height must be a number`);
    }

    // Validate element.label (optional, but if present must be string)
    let label: string | undefined;
    if ('label' in elObj) {
      if (typeof elObj.label !== 'string') {
        throw new Error(`Element at index ${i} label must be a string`);
      }
      label = elObj.label;
    }

    // All validations passed, add to validated elements
    validatedElements.push({
      id: elObj.id,
      x: elObj.x,
      y: elObj.y,
      width: elObj.width,
      height: elObj.height,
      label,
    });
  }

  return {
    canvas: {
      width: canvasObj.width as number,
      height: canvasObj.height as number,
    },
    elements: validatedElements,
  };
}
