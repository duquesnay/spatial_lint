import type { SceneElement } from './types.js';

export type AABB = {
  left: number;
  top: number;
  right: number;
  bottom: number;
};

export type BoundsExceeded = {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
} | null;

/**
 * Compute the axis-aligned bounding box (AABB) of an element.
 * Uses top-left origin coordinate system: +X right, +Y down.
 */
export function bounds(element: SceneElement): AABB {
  return {
    left: element.x,
    top: element.y,
    right: element.x + element.width,
    bottom: element.y + element.height,
  };
}

/**
 * Test if two AABBs overlap (actual overlap, not just touching).
 * Touching at edges does NOT count as overlapping.
 */
export function intersects(a: SceneElement, b: SceneElement): boolean {
  const aBounds = bounds(a);
  const bBounds = bounds(b);

  // Two AABBs overlap if:
  // a.left < b.right AND a.right > b.left AND a.top < b.bottom AND a.bottom > b.top
  return (
    aBounds.left < bBounds.right &&
    aBounds.right > bBounds.left &&
    aBounds.top < bBounds.bottom &&
    aBounds.bottom > bBounds.top
  );
}

/**
 * Compute the area of overlap between two AABBs.
 * Returns 0 if AABBs do not overlap (including touching at edges).
 */
export function overlapArea(a: SceneElement, b: SceneElement): number {
  const aBounds = bounds(a);
  const bBounds = bounds(b);

  // Compute overlap in each dimension
  const overlapX = Math.max(0, Math.min(aBounds.right, bBounds.right) - Math.max(aBounds.left, bBounds.left));
  const overlapY = Math.max(0, Math.min(aBounds.bottom, bBounds.bottom) - Math.max(aBounds.top, bBounds.top));

  return overlapX * overlapY;
}

/**
 * Check if an element exceeds canvas boundaries and by how much.
 * Canvas bounds: x ∈ [0, width], y ∈ [0, height]
 *
 * Returns an object with the amount exceeded on each edge, or null if fully inside.
 */
export function exceedsBounds(
  element: SceneElement,
  canvas: { width: number; height: number }
): BoundsExceeded {
  const elementBounds = bounds(element);
  const result: Omit<BoundsExceeded, null> = {};

  // Check each boundary
  if (elementBounds.left < 0) {
    result.left = -elementBounds.left;
  }
  if (elementBounds.top < 0) {
    result.top = -elementBounds.top;
  }
  if (elementBounds.right > canvas.width) {
    result.right = elementBounds.right - canvas.width;
  }
  if (elementBounds.bottom > canvas.height) {
    result.bottom = elementBounds.bottom - canvas.height;
  }

  // Return null if no boundaries exceeded
  return Object.keys(result).length === 0 ? null : (result as Exclude<BoundsExceeded, null>);
}
