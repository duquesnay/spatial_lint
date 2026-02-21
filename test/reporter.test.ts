import { describe, it, expect } from 'vitest';
import { formatResults } from '../src/reporter.js';
import { makeScene } from './fixtures.js';
import type { LintResult } from '../src/types.js';

describe('formatResults', () => {
  it('returns just the scene header when results are empty', () => {
    const scene = makeScene();
    const output = formatResults([], scene);
    expect(output).toBe('Scene: 320x240\n');
  });

  it('formats error severity with cross glyph', () => {
    const scene = makeScene();
    const errorResult: LintResult = {
      rule: 'BOUNDS',
      severity: 'error',
      message: '"score" exceeds top by 3px',
      elementIds: ['score'],
    };
    const output = formatResults([errorResult], scene);
    expect(output).toContain('✗ BOUNDS: "score" exceeds top by 3px');
  });

  it('formats warning severity with triangle glyph', () => {
    const scene = makeScene();
    const warningResult: LintResult = {
      rule: 'ALIGNMENT',
      severity: 'warning',
      message: '"player" and "enemy" nearly aligned',
      elementIds: ['player', 'enemy'],
    };
    const output = formatResults([warningResult], scene);
    expect(output).toContain('⚠ ALIGNMENT: "player" and "enemy" nearly aligned');
  });

  it('formats ok severity with circle glyph', () => {
    const scene = makeScene();
    const okResult: LintResult = {
      rule: 'ALIGNMENT',
      severity: 'ok',
      message: 'confirmed alignment',
      elementIds: [],
    };
    const output = formatResults([okResult], scene);
    expect(output).toContain('○ ALIGNMENT: confirmed alignment');
  });

  it('formats multiple results with each on its own line', () => {
    const scene = makeScene();
    const results: LintResult[] = [
      {
        rule: 'BOUNDS',
        severity: 'error',
        message: 'exceeds bounds',
        elementIds: ['elem1'],
      },
      {
        rule: 'SPACING',
        severity: 'warning',
        message: 'too close',
        elementIds: ['elem2', 'elem3'],
      },
      {
        rule: 'ALIGNMENT',
        severity: 'ok',
        message: 'looks good',
        elementIds: [],
      },
    ];
    const output = formatResults(results, scene);

    // Should include header with blank line after
    expect(output).toMatch(/^Scene: 320x240\n\n/);

    // Each result should be on its own line
    expect(output).toContain('✗ BOUNDS: exceeds bounds\n');
    expect(output).toContain('⚠ SPACING: too close\n');
    expect(output).toContain('○ ALIGNMENT: looks good\n');
  });

  it('includes blank line after scene header before results', () => {
    const scene = makeScene();
    const results: LintResult[] = [
      {
        rule: 'TEST',
        severity: 'error',
        message: 'test message',
        elementIds: [],
      },
    ];
    const output = formatResults(results, scene);
    expect(output).toMatch(/^Scene: 320x240\n\n✗/);
  });
});
