import { readFileSync } from 'fs';
import { lintScene, parseScene, formatResults } from './index.js';

const args = process.argv.slice(2);

if (args.length === 0) {
  console.error('Usage: spatial-lint <scene.json>');
  process.exit(2);
}

const filePath = args[0];

try {
  const fileContent = readFileSync(filePath, 'utf-8');
  const json = JSON.parse(fileContent);
  const scene = parseScene(json);
  const results = lintScene(scene);

  const output = formatResults(results, scene);
  console.log(output);

  // Exit with code 1 if any errors found, 0 otherwise
  const hasErrors = results.some((r) => r.severity === 'error');
  process.exit(hasErrors ? 1 : 0);
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Error: ${message}`);
  process.exit(2);
}
