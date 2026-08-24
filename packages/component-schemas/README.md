# @devastudios/component-schemas

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
import { validateComponentSchema, createPropsValidator } from '@devastudios/component-schemas/src/validate.mjs';
import buttonSchema from '@devastudios/component-schemas/schemas/components/wend-button.schema.json' with { type: 'json' };

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

Internal tool package (`private: true`), not published — matches `@devastudios/design-sync-mcp`'s tier. Two things are intentionally not built yet:

- A `design-sync-mcp` tool that surfaces these schemas directly to the Figma-generation workflow.
- A CI check diffing Stencil's generated `docs.json` against a component's schema here, to catch drift once schema-first components exist alongside evolving code.

This package is expected to eventually drop `private: true`, gain a `publishConfig`, and join the root `.changeset/config.json` `fixed` group once there's a real client-side consumer (e.g. an SDUI renderer) for `createPropsValidator` — at that point it must also be removed from `.changeset/config.json`'s `ignore` array, since being listed in both `ignore` and `fixed` would be contradictory.
