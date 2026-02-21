import type { Rule, Scene, SceneElement, LintResult } from './types.js';
import { exceedsBounds, intersects } from './geometry.js';

export const NEAR_ALIGNMENT_THRESHOLD = 5;

/**
 * Get the display name for an element (uses label if available, otherwise id).
 */
function getElementLabel(element: SceneElement): string {
  return element.label || element.id;
}

/**
 * boundsRule: Detects elements that exceed canvas boundaries.
 * Reports one error per element that violates bounds.
 */
export const boundsRule: Rule = (scene: Scene): LintResult[] => {
  const results: LintResult[] = [];

  for (const element of scene.elements) {
    const exceeded = exceedsBounds(element, scene.canvas);

    if (exceeded) {
      const label = getElementLabel(element);
      const exceededEdges: string[] = [];
      let totalPixels = 0;

      if (exceeded.top) {
        exceededEdges.push('top');
        totalPixels = Math.max(totalPixels, exceeded.top);
      }
      if (exceeded.bottom) {
        exceededEdges.push('bottom');
        totalPixels = Math.max(totalPixels, exceeded.bottom);
      }
      if (exceeded.left) {
        exceededEdges.push('left');
        totalPixels = Math.max(totalPixels, exceeded.left);
      }
      if (exceeded.right) {
        exceededEdges.push('right');
        totalPixels = Math.max(totalPixels, exceeded.right);
      }

      const edgesText = exceededEdges.join(', ');
      const message = `"${label}" (${element.x}:${element.y}, ${element.width}x${element.height}) exceeds [${edgesText}] by ${totalPixels}px`;

      results.push({
        rule: 'boundsRule',
        severity: 'error',
        message,
        elementIds: [element.id],
      });
    }
  }

  return results;
};

/**
 * overlapRule: Detects elements that overlap (actual overlap, not just touching).
 * Reports one warning per overlapping pair.
 */
export const overlapRule: Rule = (scene: Scene): LintResult[] => {
  const results: LintResult[] = [];

  for (let i = 0; i < scene.elements.length; i++) {
    for (let j = i + 1; j < scene.elements.length; j++) {
      const a = scene.elements[i];
      const b = scene.elements[j];

      if (intersects(a, b)) {
        const aLabel = getElementLabel(a);
        const bLabel = getElementLabel(b);
        const message = `Elements "${aLabel}" and "${bLabel}" overlap`;

        results.push({
          rule: 'overlapRule',
          severity: 'warning',
          message,
          elementIds: [a.id, b.id],
        });
      }
    }
  }

  return results;
};

/**
 * alignmentRule: Detects elements that are aligned or nearly aligned.
 * Reports 'ok' for exact alignment (delta = 0).
 * Reports 'warning' for near-alignment (0 < delta <= NEAR_ALIGNMENT_THRESHOLD).
 */
export const alignmentRule: Rule = (scene: Scene): LintResult[] => {
  const results: LintResult[] = [];

  for (let i = 0; i < scene.elements.length; i++) {
    for (let j = i + 1; j < scene.elements.length; j++) {
      const a = scene.elements[i];
      const b = scene.elements[j];

      const aLabel = getElementLabel(a);
      const bLabel = getElementLabel(b);

      // Check X alignment (left edges)
      const xDelta = Math.abs(a.x - b.x);
      if (xDelta === 0) {
        results.push({
          rule: 'alignmentRule',
          severity: 'ok',
          message: `Elements "${aLabel}" and "${bLabel}" are aligned on X axis`,
          elementIds: [a.id, b.id],
        });
      } else if (xDelta > 0 && xDelta <= NEAR_ALIGNMENT_THRESHOLD) {
        results.push({
          rule: 'alignmentRule',
          severity: 'warning',
          message: `Elements "${aLabel}" and "${bLabel}" are nearly aligned on X axis (delta: ${xDelta}px)`,
          elementIds: [a.id, b.id],
        });
      }

      // Check Y alignment (top edges)
      const yDelta = Math.abs(a.y - b.y);
      if (yDelta === 0) {
        results.push({
          rule: 'alignmentRule',
          severity: 'ok',
          message: `Elements "${aLabel}" and "${bLabel}" are aligned on Y axis`,
          elementIds: [a.id, b.id],
        });
      } else if (yDelta > 0 && yDelta <= NEAR_ALIGNMENT_THRESHOLD) {
        results.push({
          rule: 'alignmentRule',
          severity: 'warning',
          message: `Elements "${aLabel}" and "${bLabel}" are nearly aligned on Y axis (delta: ${yDelta}px)`,
          elementIds: [a.id, b.id],
        });
      }
    }
  }

  return results;
};
