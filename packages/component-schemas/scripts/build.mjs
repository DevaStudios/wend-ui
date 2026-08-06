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

const componentFiles = readdirSync(componentsDir).filter((file) => file.endsWith('.schema.json'));

for (const file of componentFiles) {
  const schema = JSON.parse(readFileSync(path.join(componentsDir, file), 'utf8'));
  const result = validateComponentSchema(schema);
  if (!result.valid) {
    console.error(`Invalid component schema: ${file}`);
    console.error(JSON.stringify(result.errors, null, 2));
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
