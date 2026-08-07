# Component Schemas Package Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create `@wend-ui/component-schemas`, a new internal workspace package holding schema-first JSON Schema definitions for wend-ui components, with `wend-button` as the first instance and a small AJV-based validator.

**Architecture:** A meta-schema (`schemas/meta/component.schema.json`) defines what a valid wend-ui component schema document looks like. Each component gets its own file under `schemas/components/` (matching the existing `packages/tokens/tokens/component/*.json` one-file-per-component convention) that both validates against the meta-schema and is itself directly usable to validate a props object via AJV. `src/validate.mjs` exposes two pure functions; `scripts/build.mjs` validates and copies the schemas into `dist/`.

**Tech Stack:** Plain Node.js ESM (`.mjs`), `node --test`, AJV 8 (2020-12 draft build), `rimraf` for clean — mirrors `packages/manifest`'s and `packages/design-sync-mcp`'s existing conventions exactly. No bundler, no TypeScript.

## Global Constraints

- Package tier: **internal tool** — `private: true`, independent `0.1.0` version, no `publishConfig`, no `files` field, added to `.changeset/config.json`'s `ignore` array. Matches `@wend-ui/design-sync-mcp`'s `package.json` shape exactly.
- JSON Schema draft: **2020-12** (`"$schema": "https://json-schema.org/draft/2020-12/schema"`) for every schema document, validated with AJV's `ajv/dist/2020.js` build.
- One JSON file per component under `schemas/components/` — never a combined file.
- Reserved root-level vendor-extension keys on every component schema: `x-wend-component` (string, the tag), `x-wend-slots` (array of `{ name, description }`), `x-wend-tokens` (array of token dot-path strings). All three are required (may be empty arrays where applicable) and enforced by the meta-schema.
- The `wend-button` schema codifies the **current** implementation only — `variant: "primary" | "secondary"`, `disabled: boolean` — no new variants (success/warning/error) in this plan.
- Token dot-paths in `x-wend-tokens` must match the real key path inside `packages/tokens/tokens/component/button.json` (no `component.` prefix — that's a directory name, not part of the token path; confirmed against `style-dictionary.config.js`, which sources `tokens/component/**/*.json` with no added namespace).

---

### Task 1: Package scaffold, meta-schema, and `validateComponentSchema()`

**Files:**
- Create: `packages/component-schemas/package.json`
- Create: `packages/component-schemas/schemas/meta/component.schema.json`
- Create: `packages/component-schemas/src/validate.mjs`
- Test: `packages/component-schemas/test/validate.test.mjs`

**Interfaces:**
- Produces: `validateComponentSchema(schema: object): { valid: boolean, errors: object[] }`, exported from `src/validate.mjs`. Task 2's test, Task 3's `createPropsValidator`, and Task 4's `scripts/build.mjs` all import this by name from `../src/validate.mjs`.

- [ ] **Step 1: Create the package scaffold**

Create `packages/component-schemas/package.json`:

```json
{
  "name": "@wend-ui/component-schemas",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "description": "Schema-first JSON Schema definitions for wend-ui components — the spec components are built against, and a validator for component prop objects",
  "license": "MIT",
  "scripts": {
    "build": "node scripts/build.mjs",
    "test": "node --test",
    "clean": "rimraf dist"
  },
  "dependencies": {
    "ajv": "^8.17.0"
  },
  "devDependencies": {
    "rimraf": "^5.0.5"
  }
}
```

- [ ] **Step 2: Install dependencies and link the new workspace**

Run from the repo root:

```bash
npm install
```

Expected: npm recognizes `packages/component-schemas` as a new workspace (root `package.json`'s `workspaces` is `["packages/*"]`) and installs `ajv` + `rimraf` into it. No errors.

- [ ] **Step 3: Create the meta-schema**

Create `packages/component-schemas/schemas/meta/component.schema.json`:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://schemas.wend-ui.dev/meta/component.schema.json",
  "title": "Wend UI Component Schema",
  "description": "Meta-schema describing what a valid wend-ui component schema document must look like.",
  "type": "object",
  "required": [
    "$schema",
    "$id",
    "title",
    "description",
    "type",
    "x-wend-component",
    "x-wend-slots",
    "x-wend-tokens",
    "properties",
    "additionalProperties"
  ],
  "properties": {
    "$schema": {
      "type": "string",
      "const": "https://json-schema.org/draft/2020-12/schema"
    },
    "$id": {
      "type": "string",
      "format": "uri"
    },
    "title": {
      "type": "string",
      "minLength": 1
    },
    "description": {
      "type": "string",
      "minLength": 1
    },
    "type": {
      "const": "object"
    },
    "x-wend-component": {
      "type": "string",
      "pattern": "^wend-[a-z][a-z0-9-]*$"
    },
    "x-wend-slots": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["name", "description"],
        "properties": {
          "name": { "type": "string" },
          "description": { "type": "string", "minLength": 1 }
        },
        "additionalProperties": false
      }
    },
    "x-wend-tokens": {
      "type": "array",
      "items": { "type": "string", "minLength": 1 }
    },
    "properties": {
      "type": "object",
      "additionalProperties": {
        "type": "object",
        "required": ["type", "description"],
        "properties": {
          "type": { "type": "string" },
          "description": { "type": "string", "minLength": 1 },
          "enum": { "type": "array" },
          "default": {}
        }
      }
    },
    "additionalProperties": { "const": false }
  },
  "additionalProperties": true
}
```

- [ ] **Step 4: Write the failing test**

Create `packages/component-schemas/test/validate.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateComponentSchema } from '../src/validate.mjs';

test('validateComponentSchema accepts a well-formed component schema', () => {
  const schema = {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    $id: 'https://schemas.wend-ui.dev/components/wend-test.schema.json',
    title: 'WendTest',
    description: 'A test component.',
    type: 'object',
    'x-wend-component': 'wend-test',
    'x-wend-slots': [{ name: 'default', description: 'Content.' }],
    'x-wend-tokens': [],
    properties: {
      size: { type: 'string', enum: ['small', 'large'], default: 'small', description: 'Size of the thing.' }
    },
    additionalProperties: false
  };

  const result = validateComponentSchema(schema);
  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, []);
});

test('validateComponentSchema rejects a schema missing required x-wend-* metadata', () => {
  const schema = {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    $id: 'https://schemas.wend-ui.dev/components/wend-test.schema.json',
    title: 'WendTest',
    description: 'A test component.',
    type: 'object',
    properties: {},
    additionalProperties: false
  };

  const result = validateComponentSchema(schema);
  assert.equal(result.valid, false);
  assert.ok(result.errors.length > 0);
});

test('validateComponentSchema rejects a property definition missing a description', () => {
  const schema = {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    $id: 'https://schemas.wend-ui.dev/components/wend-test.schema.json',
    title: 'WendTest',
    description: 'A test component.',
    type: 'object',
    'x-wend-component': 'wend-test',
    'x-wend-slots': [],
    'x-wend-tokens': [],
    properties: {
      size: { type: 'string' }
    },
    additionalProperties: false
  };

  const result = validateComponentSchema(schema);
  assert.equal(result.valid, false);
});
```

- [ ] **Step 5: Run the test to verify it fails**

Run: `npm test -w packages/component-schemas`
Expected: FAIL — `Cannot find module '.../src/validate.mjs'` (the module doesn't exist yet).

- [ ] **Step 6: Implement `validateComponentSchema`**

Create `packages/component-schemas/src/validate.mjs`:

```js
import Ajv2020 from 'ajv/dist/2020.js';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const metaSchemaPath = path.resolve(here, '../schemas/meta/component.schema.json');
const metaSchema = JSON.parse(readFileSync(metaSchemaPath, 'utf8'));

export function validateComponentSchema(schema) {
  const ajv = new Ajv2020({ strict: false });
  const validate = ajv.compile(metaSchema);
  const valid = validate(schema);
  return { valid, errors: validate.errors ?? [] };
}
```

- [ ] **Step 7: Run the test to verify it passes**

Run: `npm test -w packages/component-schemas`
Expected: PASS (3 tests).

- [ ] **Step 8: Commit**

```bash
git add packages/component-schemas/package.json packages/component-schemas/schemas/meta/component.schema.json packages/component-schemas/src/validate.mjs packages/component-schemas/test/validate.test.mjs package-lock.json
git commit -m "Add @wend-ui/component-schemas package with meta-schema and validateComponentSchema"
```

---

### Task 2: `wend-button.schema.json`

**Files:**
- Create: `packages/component-schemas/schemas/components/wend-button.schema.json`
- Test: `packages/component-schemas/test/wend-button.schema.test.mjs`

**Interfaces:**
- Consumes: `validateComponentSchema` from `../src/validate.mjs` (Task 1).
- Produces: `schemas/components/wend-button.schema.json` on disk. Task 3 loads this same file to build a props validator; Task 4's build script copies it into `dist/`.

- [ ] **Step 1: Write the failing test**

Create `packages/component-schemas/test/wend-button.schema.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { validateComponentSchema } from '../src/validate.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const schemaPath = path.resolve(here, '../schemas/components/wend-button.schema.json');
const buttonSchema = JSON.parse(readFileSync(schemaPath, 'utf8'));

test('wend-button.schema.json is a well-formed component schema', () => {
  const result = validateComponentSchema(buttonSchema);
  assert.equal(result.valid, true, JSON.stringify(result.errors));
});

test("wend-button.schema.json declares the current implementation's props", () => {
  assert.deepEqual(Object.keys(buttonSchema.properties).sort(), ['disabled', 'variant']);
  assert.deepEqual(buttonSchema.properties.variant.enum, ['primary', 'secondary']);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -w packages/component-schemas`
Expected: FAIL — `ENOENT: no such file or directory, open '.../schemas/components/wend-button.schema.json'`.

- [ ] **Step 3: Create the button schema**

Create `packages/component-schemas/schemas/components/wend-button.schema.json`:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://schemas.wend-ui.dev/components/wend-button.schema.json",
  "title": "WendButton",
  "description": "A clickable button.",
  "type": "object",
  "x-wend-component": "wend-button",
  "x-wend-slots": [{ "name": "default", "description": "Button label content." }],
  "x-wend-tokens": [
    "button.padding-block",
    "button.padding-inline",
    "button.radius",
    "button.font-size",
    "button.font-weight",
    "color.button.primary.background.default",
    "color.button.primary.background.hover",
    "color.button.primary.background.active",
    "color.button.primary.background.disabled",
    "color.button.primary.foreground.default",
    "color.button.primary.foreground.disabled",
    "color.button.secondary.foreground.default",
    "color.button.secondary.border.default"
  ],
  "properties": {
    "variant": {
      "type": "string",
      "enum": ["primary", "secondary"],
      "default": "primary",
      "description": "Visual style of the button."
    },
    "disabled": {
      "type": "boolean",
      "default": false,
      "description": "Disables the button."
    }
  },
  "additionalProperties": false
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -w packages/component-schemas`
Expected: PASS (5 tests total: 3 from Task 1, 2 from this file).

- [ ] **Step 5: Commit**

```bash
git add packages/component-schemas/schemas/components/wend-button.schema.json packages/component-schemas/test/wend-button.schema.test.mjs
git commit -m "Add wend-button component schema"
```

---

### Task 3: `createPropsValidator()`

**Files:**
- Modify: `packages/component-schemas/src/validate.mjs`
- Modify: `packages/component-schemas/test/wend-button.schema.test.mjs`

**Interfaces:**
- Consumes: `wend-button.schema.json` (Task 2) as the schema under test.
- Produces: `createPropsValidator(schema: object): (props: object) => { valid: boolean, errors: object[] }`, exported from `src/validate.mjs`. No later task consumes this directly, but it's the package's primary external-facing API (documented in Task 5's README) for the SDUI/runtime-validation use case.

- [ ] **Step 1: Write the failing test**

Replace the full contents of `packages/component-schemas/test/wend-button.schema.test.mjs` with:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { validateComponentSchema, createPropsValidator } from '../src/validate.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const schemaPath = path.resolve(here, '../schemas/components/wend-button.schema.json');
const buttonSchema = JSON.parse(readFileSync(schemaPath, 'utf8'));

test('wend-button.schema.json is a well-formed component schema', () => {
  const result = validateComponentSchema(buttonSchema);
  assert.equal(result.valid, true, JSON.stringify(result.errors));
});

test("wend-button.schema.json declares the current implementation's props", () => {
  assert.deepEqual(Object.keys(buttonSchema.properties).sort(), ['disabled', 'variant']);
  assert.deepEqual(buttonSchema.properties.variant.enum, ['primary', 'secondary']);
});

const validateButtonProps = createPropsValidator(buttonSchema);

test('a valid button props object passes', () => {
  const result = validateButtonProps({ variant: 'primary', disabled: false });
  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, []);
});

test('an unknown variant value fails', () => {
  const result = validateButtonProps({ variant: 'tertiary' });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.instancePath === '/variant'));
});

test('an undeclared prop fails because additionalProperties is false', () => {
  const result = validateButtonProps({ variant: 'primary', color: 'red' });
  assert.equal(result.valid, false);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -w packages/component-schemas`
Expected: FAIL — `createPropsValidator is not a function` (not yet exported).

- [ ] **Step 3: Implement `createPropsValidator`**

Replace the full contents of `packages/component-schemas/src/validate.mjs` with:

```js
import Ajv2020 from 'ajv/dist/2020.js';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const metaSchemaPath = path.resolve(here, '../schemas/meta/component.schema.json');
const metaSchema = JSON.parse(readFileSync(metaSchemaPath, 'utf8'));

export function validateComponentSchema(schema) {
  const ajv = new Ajv2020({ strict: false });
  const validate = ajv.compile(metaSchema);
  const valid = validate(schema);
  return { valid, errors: validate.errors ?? [] };
}

export function createPropsValidator(schema) {
  const ajv = new Ajv2020({ strict: false });
  const validate = ajv.compile(schema);
  return (props) => {
    const valid = validate(props);
    return { valid, errors: validate.errors ?? [] };
  };
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -w packages/component-schemas`
Expected: PASS (6 tests total).

- [ ] **Step 5: Commit**

```bash
git add packages/component-schemas/src/validate.mjs packages/component-schemas/test/wend-button.schema.test.mjs
git commit -m "Add createPropsValidator for runtime component prop validation"
```

---

### Task 4: Build script

**Files:**
- Create: `packages/component-schemas/scripts/build.mjs`

**Interfaces:**
- Consumes: `validateComponentSchema` from `../src/validate.mjs` (Task 1), reads every `*.schema.json` under `schemas/components/` (currently just `wend-button.schema.json` from Task 2).
- Produces: `dist/schemas/meta/component.schema.json` and `dist/schemas/components/*.schema.json` on disk when `npm run build -w packages/component-schemas` runs. No later task in this plan consumes `dist/` programmatically — it's the package's build artifact.

- [ ] **Step 1: Create the build script**

Create `packages/component-schemas/scripts/build.mjs`:

```js
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
```

- [ ] **Step 2: Run the build**

Run: `npm run build -w packages/component-schemas`
Expected output: `Wrote packages/component-schemas/dist/schemas (1 component schema(s))`

- [ ] **Step 3: Verify the build output**

Run:

```bash
ls packages/component-schemas/dist/schemas/meta packages/component-schemas/dist/schemas/components
node -e "JSON.parse(require('fs').readFileSync('packages/component-schemas/dist/schemas/components/wend-button.schema.json', 'utf8')); console.log('valid JSON')"
```

Expected: `component.schema.json` listed under `meta`, `wend-button.schema.json` listed under `components`, and `valid JSON` printed with no errors.

- [ ] **Step 4: Commit**

```bash
git add packages/component-schemas/scripts/build.mjs
git commit -m "Add build script for @wend-ui/component-schemas"
```

Note: `dist/` itself is not committed — confirm the repo's root `.gitignore` already excludes `dist` (it does; every other package's `dist/` is untracked the same way).

---

### Task 5: Monorepo wiring and README

**Files:**
- Modify: `package.json` (repo root)
- Modify: `.changeset/config.json`
- Create: `packages/component-schemas/README.md`

**Interfaces:**
- Consumes: nothing new — wires up scripts/config that reference the package created in Tasks 1–4.
- Produces: `npm run build` (root) builds this package alongside the others; `npm test` (root) runs this package's tests alongside `manifest`'s; changesets ignores this package like `design-sync-mcp`.

- [ ] **Step 1: Add the package to the root build script**

In `package.json` (repo root), change the `build` script from:

```json
"build": "npm run build -w packages/tokens && npm run build -w packages/styles && npm run build -w packages/web-components && npm run build -w packages/react && npm run build -w packages/design-sync-mcp && npm run build -w packages/manifest",
```

to:

```json
"build": "npm run build -w packages/tokens && npm run build -w packages/styles && npm run build -w packages/web-components && npm run build -w packages/react && npm run build -w packages/design-sync-mcp && npm run build -w packages/manifest && npm run build -w packages/component-schemas",
```

- [ ] **Step 2: Add the package to the root test script**

In the same `package.json`, change:

```json
"test": "npm run test -w packages/manifest",
```

to:

```json
"test": "npm run test -w packages/manifest && npm run test -w packages/component-schemas",
```

- [ ] **Step 3: Exclude the package from changesets**

In `.changeset/config.json`, change:

```json
"ignore": ["@wend-ui/design-sync-mcp"]
```

to:

```json
"ignore": ["@wend-ui/design-sync-mcp", "@wend-ui/component-schemas"]
```

- [ ] **Step 4: Write the README**

Create `packages/component-schemas/README.md`:

```markdown
# @wend-ui/component-schemas

Schema-first JSON Schema definitions for wend-ui components. A component's schema is written **before** (or alongside) its Stencil implementation — the schema is the spec the component is built against, not a byproduct generated from finished code (that byproduct already exists separately as `packages/web-components`' Stencil-generated `docs.json`).

## Why this exists

- **Design components as data, before writing Stencil code.** `schemas/components/wend-button.schema.json` is the first instance — a template for every component that follows.
- **Validate prop objects at runtime.** Each component schema is a real JSON Schema (2020-12): pass it to `createPropsValidator` and check arbitrary `{ variant: 'primary', disabled: false }`-shaped data, the same pattern a server-driven UI (SDUI) renderer needs to validate a screen described as JSON before instantiating components. See [agnosticui.com/docs/sdui.html](https://www.agnosticui.com/docs/sdui.html) for the pattern this is modeled on.
- **Ground future Figma generation.** Each schema's `x-wend-tokens`/`x-wend-slots` describe, in one place, exactly which design tokens and slots a component should have — the reference a human or agent uses when building the matching Figma component via the `figma-generate-library` skill.

## Format

Every file under `schemas/components/` is a standalone JSON Schema (2020-12) document — one file per component, matching how `packages/tokens/tokens/component/` already keeps one token file per component. Standard JSON Schema keywords (`properties`, `enum`, `default`, `description`, `additionalProperties`) describe the actual prop validation surface. Three root-level `x-wend-*` extension keys (ignored by generic JSON Schema tooling, read by wend-ui's own tooling) carry metadata JSON Schema has no vocabulary for:

- `x-wend-component` — the web component tag, e.g. `"wend-button"`.
- `x-wend-slots` — `[{ name, description }]`.
- `x-wend-tokens` — dot-path references into `packages/tokens/tokens/component/*.json`.

`schemas/meta/component.schema.json` is the meta-schema: it validates that a component schema document itself is well-formed.

## Usage

```js
import { validateComponentSchema, createPropsValidator } from '@wend-ui/component-schemas/src/validate.mjs';
import buttonSchema from '@wend-ui/component-schemas/schemas/components/wend-button.schema.json' with { type: 'json' };

// Is the schema document itself well-formed?
validateComponentSchema(buttonSchema); // { valid: true, errors: [] }

// Does this props object satisfy the schema?
const validateButtonProps = createPropsValidator(buttonSchema);
validateButtonProps({ variant: 'primary', disabled: false }); // { valid: true, errors: [] }
validateButtonProps({ variant: 'tertiary' }); // { valid: false, errors: [...] }
```

## Adding a new component schema

1. Write `schemas/components/<tag>.schema.json` following `wend-button.schema.json`'s shape.
2. Run `npm test -w packages/component-schemas` (or call `validateComponentSchema` directly) to confirm it's well-formed against the meta-schema.
3. Implement the Stencil component in `packages/web-components` to satisfy the schema's `properties`.
4. Use the schema's `x-wend-tokens`/`x-wend-slots` as the reference when building the matching Figma component by hand via the `figma-generate-library` skill.

## Status

Internal tool package (`private: true`), not published — matches `@wend-ui/design-sync-mcp`'s tier. Two things are intentionally not built yet:

- A `design-sync-mcp` tool that surfaces these schemas directly to the Figma-generation workflow.
- A CI check diffing Stencil's generated `docs.json` against a component's schema here, to catch drift once schema-first components exist alongside evolving code.

This package is expected to eventually drop `private: true`, gain a `publishConfig`, and join the root `.changeset/config.json` `fixed` group once there's a real client-side consumer (e.g. an SDUI renderer) for `createPropsValidator`.
```

- [ ] **Step 5: Verify the wiring end-to-end**

Run from the repo root:

```bash
npm test
```

Expected: both `packages/manifest` and `packages/component-schemas` test suites run and pass (9 tests total across the two packages: 3 existing manifest tests + 6 from this package).

- [ ] **Step 6: Commit**

```bash
git add package.json .changeset/config.json packages/component-schemas/README.md
git commit -m "Wire @wend-ui/component-schemas into root build/test scripts and changesets"
```
