# Project Framing: spatial_lint

## Framing Status
- [x] Motives & Success
- [x] Product Vision
- [x] What & Story Map
- [x] Architecture
- [x] Risks

---

## 1. Motives & Success

**Problem Statement**
Claude lacks spatial intuition when working with 2D game scenes. When given raw coordinates, Claude cannot reliably reason about overlap, alignment, or out-of-bounds placement. This leads to poor feedback on scene layouts.

Pre-processing scenes into human-readable lint output gives Claude a structured spatial summary to reason from — the same way a compiler gives a developer structured error output instead of raw binary.

**Who benefits**
Solo developer (Guillaume) using Claude to assist with 2D game development in Phaser / GDevelop.

**Success Criteria**
- Given a scene JSON file, the CLI outputs readable observations about spatial problems
- Claude can use that output to give useful layout feedback
- Three initial rules cover the most common spatial mistakes (out of bounds, overlaps, near-alignment)

**Scope**
Experiment. Not published. Not production. Evolves if useful, stays simple if not.

---

## 2. Product Vision

**Core idea**
A TypeScript library that reads a 2D game scene (JSON) and emits structured, human-readable lint messages about spatial problems.

Think: ESLint for game layouts.

**Unique angle**
The output is designed to be consumed by Claude, not just by developers. Text format is chosen deliberately so Claude can read it without hallucinating about coordinates.

---

## 3. What & Story Map

**Core deliverable**
`spatial-lint scene.json` prints spatial observations to stdout.

**Workflow**
1. Developer exports scene JSON from game engine (Phaser, GDevelop)
2. Runs `spatial-lint scene.json`
3. Reads (or pastes to Claude) the lint output
4. Gets informed feedback about spatial issues

**Feature priorities**

Must-have (v0.1):
- JSON input adapter with validation
- `lintScene(scene, rules)` core function
- Rule: bounds checking (objects outside canvas)
- Rule: overlap detection (objects intersecting)
- Rule: near-alignment (objects almost but not quite aligned)
- Text reporter (stdout)
- CLI entry point

Nice-to-have (deferred):
- Additional adapters (Phaser JSON, GDevelop JSON)
- Rule: density check (too many objects in one zone)
- Rule: spacing inconsistency
- Watch mode
- JSON reporter output

---

## 4. Architecture

**Coordinate system**
Top-left origin (0,0), +X right, +Y down.
Matches Phaser, GDevelop, and HTML Canvas conventions.

```
(0,0) ───── +X
  │
  +Y
```

**Data flow**
```
scene.json
  → adapter-json (parse + validate)
  → lintScene(scene, rules)
  → reporter (format text)
  → stdout
```

**Core types**
```typescript
type Scene = {
  canvas: { width: number; height: number };
  objects: SceneObject[];
};

type SceneObject = {
  id: string;
  x: number;      // top-left corner
  y: number;
  width: number;
  height: number;
  label?: string;
};

type LintResult = {
  rule: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  objectIds: string[];
};

type Rule = (scene: Scene) => LintResult[];
```

**Tech stack**
| Tool | Purpose |
|------|---------|
| TypeScript | Language |
| Vitest | Tests |
| tsup | Build (ESM + CJS) |
| tsx | Dev runner |

**Entry points**
- Library: `dist/index.js` — exports `lintScene`, types, built-in rules
- CLI: `dist/cli.js` — `spatial-lint <file.json>`

---

## 5. Risk Management

**Primary concerns**
- Overlap detection performance: naive O(n²) is fine for small scenes (< 200 objects), document the limit
- Near-alignment threshold: magic number — make it configurable from day one
- JSON format variability: game engines export very different JSON shapes — adapter layer isolates this

**What could affect approach**
- If GDevelop/Phaser JSON formats are too different from the generic schema, adapter layer may need more work than expected
- If Claude still struggles with the text output format, the reporter format may need iteration

**Confidence gaps**
- Near-alignment rule: threshold value needs empirical tuning — start with 5px, revisit after first real use
- Whether text output is actually more useful to Claude than raw JSON — to be validated in use

---

## Framing Decisions Log

| Date | Decision |
|------|----------|
| 2026-02-21 | Top-left coordinate system chosen (matches Phaser, GDevelop, Canvas) |
| 2026-02-21 | Text reporter format chosen over JSON (designed for Claude consumption) |
| 2026-02-21 | Rules as plain functions: `Rule = (scene: Scene) => LintResult[]` — no class hierarchy |
| 2026-02-21 | Three initial rules: bounds, overlap, near-alignment |
| 2026-02-21 | Experiment scope confirmed — no publishing, no production requirements |
| 2026-02-21 | Near-alignment threshold: 5px initial value, make configurable |
| 2026-02-21 | O(n²) overlap detection acceptable for scenes < 200 objects |
