# Component Schemas Package — Design Spec

**Date:** 2026-08-06
**Status:** Approved, pending implementation plan

## Problem

Wend UI has no formal, machine-readable contract for what a component's props/variants/states/slots *should* be. Today the only structured description of a component is `packages/web-components`' Stencil-generated `docs.json`, which is a **byproduct** of the implementation — it describes whatever was coded, after the fact. There's no artifact that:

1. Lets a component be **designed before it's built** (schema-first authoring), so Stencil implementation has a concrete spec to build against.
2. Can **validate arbitrary prop objects** at runtime — needed for a future server-driven UI (SDUI) style workflow (see [agnosticui.com/docs/sdui.html](https://www.agnosticui.com/docs/sdui.html)) where a server or AI agent describes a screen as data (`{ component: "WendButton", variant: "primary" }`) and a renderer validates + instantiates it.
3. Gives the Figma-generation workflow (via the Figma MCP / `figma-generate-library` skill) and `design-sync-mcp`'s `diff_component` tool a structured, hand-authored source of intended variants/tokens to check against — rather than only the as-built `docs.json`.

## Goals

- Establish a reusable **JSON Schema format** for wend-ui components, with `wend-button` as the first concrete instance (a template for all future components).
- Schema-first workflow: this package's schemas become the source of truth; Stencil components are built/extended to satisfy them, not the other way around.
- Ship a small validator so schemas are directly usable for runtime prop validation (the SDUI use case) and for validating that a component schema itself is well-formed.
- Follow existing monorepo conventions exactly (package shape, build/test patterns, changesets).

## Non-goals (for this iteration)

- Migrating `wend-button`'s implementation or tokens to any new variants (success/warning/error). The schema codifies the **current** implementation only: `variant: primary | secondary`, `disabled: boolean`. New variants are future schema updates once the color-ramp work is wired into `packages/tokens/tokens/component/button.json`.
- Any automated generation of Stencil component code from a schema.
- Any change to `design-sync-mcp` or the Figma MCP tooling to actually consume these schemas — this spec only produces the schemas and documents the intended future hook.
- Publishing this package to the GitHub npm registry. It stays internal (`private: true`) until there's a real client/SDUI consumer.

## Package

New workspace package: `packages/component-schemas` → `@wend-ui/component-schemas`.

Tier: **internal tool**, matching `@wend-ui/design-sync-mcp`'s convention exactly — `private: true`, independent `0.1.0` version, no `publishConfig`, excluded from changesets. Documented in the package README as intended to drop `private: true` and join the `fixed` changesets group later, once it has a real published consumer (e.g. a client-side SDUI renderer).

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
  "dependencies": { "ajv": "^8.17.0" },
  "devDependencies": { "rimraf": "^5.0.5" }
}
```

### Directory structure

```
packages/component-schemas/
  package.json
  README.md                                format spec + "how to add a new component schema" + publish-later note
  schemas/
    meta/component.schema.json             meta-schema: what a valid wend-ui component schema must look like
    components/wend-button.schema.json     the wend-button schema
  scripts/build.mjs                        validates every schema in schemas/components against the meta-schema, then copies schemas/ → dist/
  src/validate.mjs                         validateComponentSchema(), createPropsValidator()
  test/wend-button.schema.test.mjs         node --test coverage
  dist/                                    build output (files: ["dist"])
```

## Schema format

Draft: **JSON Schema 2020-12**. Standard keywords (`type`, `properties`, `enum`, `default`, `description`, `required`, `additionalProperties: false`) describe the actual prop validation surface — this is what makes a props object directly AJV-validatable.

Metadata JSON Schema has no vocabulary for (slots, design-token bindings, Figma mapping hints) lives in root-level `x-wend-*` extension keys — the same vendor-extension convention OpenAPI uses. A generic JSON Schema validator ignores unknown root keys; wend-ui tooling reads them explicitly.

Reserved `x-wend-*` keys for this iteration:

- `x-wend-component` (string, required) — the web component tag, e.g. `"wend-button"`.
- `x-wend-slots` (array of `{ name, description }`, required, may be empty) — mirrors the Stencil `slots` shape already used in `docs.json`/manifest.
- `x-wend-tokens` (array of strings, required, may be empty) — dot-path references into `packages/tokens/tokens/component/*.json` that this component consumes, for the future Figma/theming-diff use case.

### Meta-schema (`schemas/meta/component.schema.json`)

A JSON Schema that validates the *shape* of a component schema document itself: requires `$schema`, `$id`, `title`, `description`, `type: "object"`, `properties`, `x-wend-component`, `x-wend-slots`, `x-wend-tokens`, and `additionalProperties: false` at minimum. Every property definition under `properties` must itself have `type` and `description`.

### `wend-button.schema.json`

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
    "component.button.padding-block",
    "component.button.padding-inline",
    "component.button.radius",
    "component.button.font-size",
    "component.button.font-weight",
    "component.color.button.primary.background.default",
    "component.color.button.primary.background.hover",
    "component.color.button.primary.background.active",
    "component.color.button.primary.background.disabled",
    "component.color.button.primary.foreground.default",
    "component.color.button.primary.foreground.disabled",
    "component.color.button.secondary.foreground.default",
    "component.color.button.secondary.border.default"
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

Token paths are drawn directly from `packages/tokens/tokens/component/button.json`'s current structure (verified against the file, not assumed).

## Tooling

`src/validate.mjs` exports:

- `validateComponentSchema(schema)` — compiles the meta-schema with AJV and validates a given component schema against it; throws (or returns AJV's error list) on malformed schemas. Used by the build script and by tests, and by anyone adding a new component schema later.
- `createPropsValidator(schema)` — compiles the given component schema itself with AJV and returns a `(props) => { valid, errors }`-style validate function for checking actual prop objects, e.g. `createPropsValidator(buttonSchema)({ variant: 'tertiary' })` → invalid. This is the piece serving the SDUI/runtime-validation purpose.

`scripts/build.mjs` — for every file in `schemas/components/*.schema.json`, runs `validateComponentSchema`, fails the build on any invalid schema, then copies `schemas/` verbatim into `dist/schemas/`.

## Testing

`node --test`, matching `packages/manifest`'s pattern. `test/wend-button.schema.test.mjs` covers:

- The meta-schema itself is valid JSON Schema.
- `wend-button.schema.json` validates against the meta-schema.
- A valid props object (`{ variant: 'primary', disabled: false }`) passes `createPropsValidator`.
- An invalid props object (`{ variant: 'tertiary' }`) fails with a useful error.
- A props object with an unlisted property fails (`additionalProperties: false`).

## Monorepo wiring

- Root `package.json`: add `npm run build -w packages/component-schemas` to the `build` script chain (after `manifest`, matching where `design-sync-mcp` sits), and extend the `test` script from `npm run test -w packages/manifest` to also run `-w packages/component-schemas`.
- `.changeset/config.json`: add `"@wend-ui/component-schemas"` to the `ignore` array, alongside `"@wend-ui/design-sync-mcp"`.

## Future hooks (documented in README, not built now)

- A `design-sync-mcp` tool (e.g. `get_component_schema`) that surfaces `x-wend-tokens`/`x-wend-slots` for the Figma-generation workflow (`figma-generate-library` skill), so new components can be built in Figma straight from the schema instead of by hand.
- A CI check that validates the Stencil-generated `docs.json` for a component against its `component-schemas` entry, to catch implementation drift once schema-first components exist alongside evolving code.
- Dropping `private: true`, adding `publishConfig`, and joining the changesets `fixed` group once there's a real SDUI/client consumer for `createPropsValidator`.

## Adding a new component schema (documented in package README)

1. Write `schemas/components/<tag>.schema.json` following `wend-button.schema.json`'s shape.
2. Run `validateComponentSchema` (via `npm test`) to confirm it's well-formed.
3. Implement the Stencil component to satisfy the schema's `properties`.
4. (Manual, for now) Use the schema's `x-wend-tokens`/`x-wend-slots` as the reference when building the matching Figma component via the `figma-generate-library` skill.
