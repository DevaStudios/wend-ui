#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { validateComponentSchema } from '../src/validate.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const packageDir = path.resolve(here, '..');
const schemasDir = path.join(packageDir, 'schemas');
const componentsDir = path.join(schemasDir, 'components');
const distDir = path.join(packageDir, 'dist');
const tokensComponentDir = path.resolve(packageDir, '../tokens/tokens/component');

function collectLeafPaths(node, prefix, paths) {
  if (node && typeof node === 'object' && 'value' in node) {
    paths.add(prefix.join('.'));
    return;
  }
  if (node && typeof node === 'object') {
    for (const [key, value] of Object.entries(node)) {
      collectLeafPaths(value, [...prefix, key], paths);
    }
  }
}

function loadValidTokenPaths(dir) {
  const paths = new Set();
  const tokenFiles = readdirSync(dir).filter((file) => file.endsWith('.json'));
  for (const file of tokenFiles) {
    const tokens = JSON.parse(readFileSync(path.join(dir, file), 'utf8'));
    collectLeafPaths(tokens, [], paths);
  }
  return paths;
}

const validTokenPaths = loadValidTokenPaths(tokensComponentDir);

const componentFiles = readdirSync(componentsDir).filter((file) => file.endsWith('.schema.json'));

for (const file of componentFiles) {
  const schema = JSON.parse(readFileSync(path.join(componentsDir, file), 'utf8'));
  const result = validateComponentSchema(schema);
  if (!result.valid) {
    console.error(`Invalid component schema: ${file}`);
    console.error(JSON.stringify(result.errors, null, 2));
    process.exit(1);
  }

  const unresolvedTokens = (schema['x-wend-tokens'] ?? []).filter((token) => !validTokenPaths.has(token));
  if (unresolvedTokens.length > 0) {
    console.error(`Invalid component schema: ${file}`);
    console.error(`Unresolved x-wend-tokens (no matching token in packages/tokens/tokens/component/*.json):`);
    for (const token of unresolvedTokens) {
      console.error(`  - ${token}`);
    }
    process.exit(1);
  }
}

if (existsSync(distDir)) {
  rmSync(distDir, { recursive: true });
}
mkdirSync(path.join(distDir, 'schemas', 'meta'), { recursive: true });
mkdirSync(path.join(distDir, 'schemas', 'components'), { recursive: true });

writeFileSync(
  path.join(distDir, 'schemas', 'meta', 'component.schema.json'),
  readFileSync(path.join(schemasDir, 'meta', 'component.schema.json'))
);

for (const file of componentFiles) {
  writeFileSync(path.join(distDir, 'schemas', 'components', file), readFileSync(path.join(componentsDir, file)));
}

console.log(`Wrote packages/component-schemas/dist/schemas (${componentFiles.length} component schema(s))`);
