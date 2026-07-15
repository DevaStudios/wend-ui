---
name: sync-tokens-to-figma
description: Use when editing any file under packages/tokens/tokens/**/*.json (global, semantic, or component token JSON), or when a component's token reference changes (e.g. which global/semantic token it aliases) — Figma Variables, packages/tokens/README.md, and any other docs (including docs/superpowers/ plans and specs) that mention the old token names must be kept in sync with the token source, and won't update themselves.
---

# Sync Tokens to Figma

## Overview

wend-ui's design tokens are the source of truth (`packages/tokens/tokens/**/*.json`). Whenever their values, names, or references change, two things silently drift unless updated by hand: the Figma file's Variables (what designers see) and `packages/tokens/README.md` (the token documentation — scale tables, naming conventions). This is the checklist for keeping all three in lockstep.

## When to use

- Just edited (or about to edit) `tokens/global/*.json`, `tokens/semantic/*.json`, or `tokens/component/*.json`
- Renamed, added, or removed a token key
- Changed what a token resolves to (e.g. `button.font-weight` now points at `{font.weight.regular}` instead of `{font.weight.medium}`)

## Steps

1. **Rebuild:** `npm run build -w packages/tokens`. Fix reference errors first — a renamed/removed key breaks any `{token.path}` reference elsewhere; grep the old name across `tokens/**/*.json` before rebuilding again.

2. **Pull current state from both sides:**
   - Project tokens: `mcp__wend-ui-design-sync__get_tokens` (auto-rebuilds from source if stale).
   - Figma variables: run a **read-only** `use_figma` script calling `figma.variables.getLocalVariableCollectionsAsync()`, then resolve each variable's `valuesByMode` — for a `VARIABLE_ALIAS`, recurse into `getVariableByIdAsync(alias.id)` using *that* variable's own collection's mode id (global collections here have one mode; semantic has Light/Dark). Convert `{r,g,b}` (0–1 range) to hex before diffing.
   - `get_variable_defs` is the wrong tool for this — it requires a live node selection in the Figma desktop app and errors "nothing selected" otherwise.

3. **Diff:** `mcp__wend-ui-design-sync__diff_tokens` with the resolved Figma variables. Read all three buckets: `onlyInProject` (add to Figma), `onlyInFigma` (stale — flag, don't auto-delete), `changed` (values or aliases differ). A rename shows up as a *pair* — the old name in `onlyInFigma`, the new name in `onlyInProject` — not as a single `changed` entry; match them up by identical value (and position in the surrounding scale) to recognize it as a rename rather than an add+delete.

4. **Apply in Figma via `use_figma`** (load the `figma-use` skill first, per its own mandatory-prerequisite rule):
   - **Renamed key, same value** → rename the existing `Variable` in place (`variable.name = newName`). This preserves the variable ID, so anything aliasing it (e.g. `button-padding-block` → the spacing step it references) keeps resolving correctly for free.
   - **New key** → `figma.variables.createVariable(name, collection, type)` + `setValueForMode` per mode. Match the collection's existing `scopes` convention — check a sibling variable first (this file uses `ALL_SCOPES` for spacing/radius; color variables use narrower scopes).
   - **Component token now resolves to a different global/semantic token** → find the target variable's ID, then `setValueForMode(modeId, { type: 'VARIABLE_ALIAS', id: targetId })` for every mode the alias variable has.
   - Never delete an `onlyInFigma` variable without asking first — it may be intentional (e.g. bound to something not yet in the token source).

5. **Re-verify:** repeat steps 2–3. `changed`/`onlyInProject` should be empty for everything you touched. Report any *pre-existing, unrelated* drift you notice instead of silently fixing it.

6. **Update `packages/tokens/README.md`.** If the change affects an existing documented scale (e.g. a px/rem table), update the table and any prose describing the naming convention. If the token category has no documentation section yet, don't skip this step — add one (see the "Spacing scale" section for the expected shape: naming convention, then a table). Check whether the "Three-tier architecture" section still accurately describes the token's tier.

7. **Grep the rest of the repo for the old token name(s)** on a rename — `grep -rn "<old-name>" --include="*.md" .` (excluding `node_modules`/`build`). Renamed or removed tokens leak into places other than the README: `docs/superpowers/plans/*.md` and `docs/superpowers/specs/*.md` are planning documents for not-yet-built features that embed literal CSS custom property names (`var(--spacing-lg)`) and plain-text labels (`spacing-lg (24px)`) directly in example code/mockups — both forms need updating, not just the `--`-prefixed one. Update every hit to the new name/value; these docs describe future work, so leaving stale names means the plan gets implemented against tokens that no longer exist.

## Common mistakes

- Deleting and recreating a Figma variable instead of renaming in place — breaks every alias pointing at the old ID (dependent component tokens silently keep the old value or go undefined).
- Using `get_variable_defs` for a full-file dump instead of `use_figma` + `getLocalVariableCollectionsAsync()`.
- Skipping the `scopes` check when creating a new variable — defaults to `ALL_SCOPES`, which may not match this collection's convention.
- Treating every `onlyInFigma` diff entry as dead weight to delete — confirm with the user first.
- Stopping at `packages/tokens/README.md` and skipping the repo-wide grep — planning docs under `docs/superpowers/` reference token names in example CSS/HTML and go stale silently, with no build step to catch it.
