import { describe, it, expect } from 'vitest';
import { parseScene } from '../src/adapter-json.js';

describe('parseScene - JSON adapter', () => {
  describe('valid scene JSON', () => {
    it('returns typed Scene from valid JSON', () => {
      const json = {
        canvas: { width: 320, height: 240 },
        elements: [{ id: 'a', x: 0, y: 0, width: 32, height: 32 }],
      };

      const scene = parseScene(json);

      expect(scene).toEqual({
        canvas: { width: 320, height: 240 },
        elements: [{ id: 'a', x: 0, y: 0, width: 32, height: 32 }],
      });
    });

    it('preserves element label when provided', () => {
      const json = {
        canvas: { width: 320, height: 240 },
        elements: [
          {
            id: 'player',
            x: 100,
            y: 100,
            width: 16,
            height: 16,
            label: 'Player Character',
          },
        ],
      };

      const scene = parseScene(json);

      expect(scene.elements[0].label).toBe('Player Character');
    });

    it('accepts multiple elements', () => {
      const json = {
        canvas: { width: 640, height: 480 },
        elements: [
          { id: 'a', x: 0, y: 0, width: 32, height: 32 },
          { id: 'b', x: 100, y: 100, width: 64, height: 64 },
          { id: 'c', x: 200, y: 200, width: 16, height: 16 },
        ],
      };

      const scene = parseScene(json);

      expect(scene.elements).toHaveLength(3);
      expect(scene.elements.map((e) => e.id)).toEqual(['a', 'b', 'c']);
    });
  });

  describe('missing or invalid canvas', () => {
    it('throws descriptive error when canvas is missing', () => {
      const json = {
        elements: [],
      };

      expect(() => parseScene(json)).toThrow(/canvas/i);
    });

    it('throws descriptive error when canvas.width is missing', () => {
      const json = {
        canvas: { height: 240 },
        elements: [],
      };

      expect(() => parseScene(json)).toThrow(/canvas/i);
      expect(() => parseScene(json)).toThrow(/width/i);
    });

    it('throws descriptive error when canvas.height is missing', () => {
      const json = {
        canvas: { width: 320 },
        elements: [],
      };

      expect(() => parseScene(json)).toThrow(/canvas/i);
      expect(() => parseScene(json)).toThrow(/height/i);
    });

    it('throws when canvas.width is not a number', () => {
      const json = {
        canvas: { width: '320', height: 240 },
        elements: [],
      };

      expect(() => parseScene(json)).toThrow(/canvas/i);
      expect(() => parseScene(json)).toThrow(/width/i);
    });

    it('throws when canvas.height is not a number', () => {
      const json = {
        canvas: { width: 320, height: '240' },
        elements: [],
      };

      expect(() => parseScene(json)).toThrow(/canvas/i);
      expect(() => parseScene(json)).toThrow(/height/i);
    });
  });

  describe('missing or invalid elements', () => {
    it('throws descriptive error when elements is missing', () => {
      const json = {
        canvas: { width: 320, height: 240 },
      };

      expect(() => parseScene(json)).toThrow(/elements/i);
    });

    it('throws when elements is not an array', () => {
      const json = {
        canvas: { width: 320, height: 240 },
        elements: { a: 'not an array' },
      };

      expect(() => parseScene(json)).toThrow(/elements/i);
      expect(() => parseScene(json)).toThrow(/array/i);
    });
  });

  describe('element validation', () => {
    it('throws when element id is missing', () => {
      const json = {
        canvas: { width: 320, height: 240 },
        elements: [{ x: 0, y: 0, width: 32, height: 32 }],
      };

      expect(() => parseScene(json)).toThrow(/id/i);
    });

    it('throws when element id is not a string', () => {
      const json = {
        canvas: { width: 320, height: 240 },
        elements: [{ id: 123, x: 0, y: 0, width: 32, height: 32 }],
      };

      expect(() => parseScene(json)).toThrow(/id/i);
    });

    it('throws when element x is missing', () => {
      const json = {
        canvas: { width: 320, height: 240 },
        elements: [{ id: 'a', y: 0, width: 32, height: 32 }],
      };

      expect(() => parseScene(json)).toThrow(/x/i);
    });

    it('throws when element x is not a number', () => {
      const json = {
        canvas: { width: 320, height: 240 },
        elements: [{ id: 'a', x: '0', y: 0, width: 32, height: 32 }],
      };

      expect(() => parseScene(json)).toThrow(/x/i);
    });

    it('throws when element y is missing', () => {
      const json = {
        canvas: { width: 320, height: 240 },
        elements: [{ id: 'a', x: 0, width: 32, height: 32 }],
      };

      expect(() => parseScene(json)).toThrow(/y/i);
    });

    it('throws when element y is not a number', () => {
      const json = {
        canvas: { width: 320, height: 240 },
        elements: [{ id: 'a', x: 0, y: '0', width: 32, height: 32 }],
      };

      expect(() => parseScene(json)).toThrow(/y/i);
    });

    it('throws when element width is missing', () => {
      const json = {
        canvas: { width: 320, height: 240 },
        elements: [{ id: 'a', x: 0, y: 0, height: 32 }],
      };

      expect(() => parseScene(json)).toThrow(/width/i);
    });

    it('throws when element width is not a number', () => {
      const json = {
        canvas: { width: 320, height: 240 },
        elements: [{ id: 'a', x: 0, y: 0, width: '32', height: 32 }],
      };

      expect(() => parseScene(json)).toThrow(/width/i);
    });

    it('throws when element height is missing', () => {
      const json = {
        canvas: { width: 320, height: 240 },
        elements: [{ id: 'a', x: 0, y: 0, width: 32 }],
      };

      expect(() => parseScene(json)).toThrow(/height/i);
    });

    it('throws when element height is not a number', () => {
      const json = {
        canvas: { width: 320, height: 240 },
        elements: [{ id: 'a', x: 0, y: 0, width: 32, height: '32' }],
      };

      expect(() => parseScene(json)).toThrow(/height/i);
    });

    it('throws when element label is present but not a string', () => {
      const json = {
        canvas: { width: 320, height: 240 },
        elements: [
          {
            id: 'a',
            x: 0,
            y: 0,
            width: 32,
            height: 32,
            label: 123,
          },
        ],
      };

      expect(() => parseScene(json)).toThrow(/label/i);
    });
  });

  describe('non-object input', () => {
    it('throws when input is a string', () => {
      expect(() => parseScene('not an object')).toThrow();
    });

    it('throws when input is a number', () => {
      expect(() => parseScene(42)).toThrow();
    });

    it('throws when input is null', () => {
      expect(() => parseScene(null)).toThrow();
    });

    it('throws when input is undefined', () => {
      expect(() => parseScene(undefined)).toThrow();
    });

    it('throws when input is an array', () => {
      expect(() => parseScene([])).toThrow();
    });
  });

  describe('fail-fast behavior', () => {
    it('throws on first validation error encountered', () => {
      const json = {
        canvas: { width: 320 }, // Missing height
        elements: 'not an array', // Also missing elements type check
      };

      // Should fail on canvas validation first
      expect(() => parseScene(json)).toThrow(/canvas/i);
    });

    it('throws on first element error when validating elements', () => {
      const json = {
        canvas: { width: 320, height: 240 },
        elements: [
          { id: 'a', x: 0, y: 0, width: 32, height: 32 }, // Valid
          { id: 123, x: 0, y: 0, width: 32, height: 32 }, // Invalid id
        ],
      };

      // Should fail on second element's id validation
      expect(() => parseScene(json)).toThrow(/id/i);
    });
  });
});
