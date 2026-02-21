export type Severity = 'error' | 'warning' | 'ok';

export type SceneElement = {
  id: string;
  x: number;      // top-left corner
  y: number;      // top-left corner, +Y down
  width: number;
  height: number;
  label?: string;  // human-readable name, falls back to id
};

export type Scene = {
  canvas: { width: number; height: number };
  elements: SceneElement[];
};

export type LintResult = {
  rule: string;
  severity: Severity;
  message: string;
  elementIds: string[];
};

export type Rule = (scene: Scene) => LintResult[];
