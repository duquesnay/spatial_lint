import type { LintResult, Scene } from './types.js';

const SEVERITY_GLYPH: Record<string, string> = {
  error: '✗',
  warning: '⚠',
  ok: '○',
};

export function formatResults(results: LintResult[], scene: Scene): string {
  const header = `Scene: ${scene.canvas.width}x${scene.canvas.height}\n`;

  if (results.length === 0) {
    return header;
  }

  const lines = results.map((result) => {
    const glyph = SEVERITY_GLYPH[result.severity];
    return `${glyph} ${result.rule}: ${result.message}`;
  });

  return header + '\n' + lines.join('\n') + '\n';
}
