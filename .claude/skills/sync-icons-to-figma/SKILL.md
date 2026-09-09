---
name: sync-icons-to-figma
description: Use when adding/changing files under packages/icons/src/svg/*.svg, or when explicitly asked to sync icons with Figma (push codebase icons to Figma, or pull new Figma icons into the codebase) — icon artwork drifts silently between the two just like tokens and component props do, and pulled icons need a licensing/branding review before they can join the shipped set.
---

# Sync Icons to Figma

## Overview

Same two-hop architecture as `sync-tokens-to-figma`: `wend-ui-design-sync` (the `get_icons`/`diff_icons`/`stage_pulled_icons` MCP tools) only ever reads/writes the codebase side; all Figma-side reading and writing happens through `use_figma`, using the scripts in `packages/design-sync-mcp/figma-scripts/`.

The one real difference from tokens: `@devastudios/icons` is **unpublished pending confirmation the set is clear for public distribution** (see `packages/icons/README.md`'s "Status" section), and a prior icon already had to be dropped for embedding commercial-library attribution. So while pushing codebase→Figma is fully automated, pulling Figma→codebase always stops at a staging directory for human review — nothing writes to `packages/icons/src/svg/` automatically.

## When to use

- Just added or changed a file under `packages/icons/src/svg/*.svg`.
- Asked to push icons to Figma, pull icons from Figma, or check icon drift between the two.

## Pushing codebase icons to Figma

1. **Get project icons:** `mcp__wend-ui-design-sync__get_icons`.
2. **Get Figma's current icons:** run `figma-scripts/fetch-icon-inventory.js` verbatim via `use_figma` (load the `figma-use` skill first, per its own mandatory-prerequisite rule). Returns `[]` if Figma has no "Icons" page yet — that's fine, everything will show up as `onlyInProject`.
3. **Diff:** `mcp__wend-ui-design-sync__diff_icons` with the Figma result. `onlyInProject` = new icons to push; `changed` = existing Figma icons whose geometry differs from the codebase version.
4. **Push:** copy `figma-scripts/push-icons.js`, fill in `ICONS_TO_PUSH` — `{ name, svg, mode: 'create' }` for each `onlyInProject` entry, `{ name, svg, mode: 'update', nodeId }` for each `changed` entry (the `nodeId` comes from that entry's `figma.nodeId`). Run the filled-in script via `use_figma`. Read the returned `{ created, updated, errors }` and surface any errors.
5. **Re-verify:** repeat steps 2–3. `onlyInProject`/`changed` should be empty for everything you pushed.

Never delete-and-recreate an existing Figma icon component to "update" it — `push-icons.js`'s update path edits the existing node's children in place specifically so every instance of that icon elsewhere in the Figma file keeps working.

## Pulling Figma icons into the codebase

1. **Get Figma's current icons:** `figma-scripts/fetch-icon-inventory.js` via `use_figma`.
2. **Diff:** `mcp__wend-ui-design-sync__diff_icons`. `onlyInFigma` = icons to pull.
3. **Stage:** `mcp__wend-ui-design-sync__stage_pulled_icons` with the `onlyInFigma` entries. Writes each SVG to `packages/icons/incoming/` and regenerates `packages/icons/incoming/REVIEW.md`.
4. **Stop here and hand off to the user.** Point them at `packages/icons/incoming/REVIEW.md` and its per-icon checklist (brand/product names, commercial-library attribution, license clarity — see `packages/icons/README.md`'s "Figma sync" section for the full criteria). Do not move files out of `incoming/` yourself.
5. Once a human has reviewed and approved an icon, moving it into `src/svg/` (renamed to the `wend-icon-` prefix) and running `npm run build -w packages/icons` is a normal edit — follow `packages/icons/README.md`'s existing "Adding new icons" steps.

## Common mistakes

- Diffing raw SVG markup instead of using `diff_icons`. Figma's `exportAsync({format: 'SVG_STRING'})` output never byte-matches a hand-authored file's formatting even for identical artwork (attribute order, numeric precision) — `diff_icons` compares a geometry-only hash instead, and a naive string comparison will falsely flag every icon as changed.
- Auto-moving anything from `packages/icons/incoming/` into `src/svg/`. The staging step exists because this exact category of mistake (an icon with embedded commercial attribution) already shipped once and had to be removed after the fact — treat every pulled icon as unreviewed until a human says otherwise, regardless of how confident the diff or the icon's name looks.
- Delete-and-recreate on an existing Figma icon component instead of using `push-icons.js`'s in-place update path — breaks every instance of that icon in Figma files that reference it.
- Assuming an "Icons" page already exists in the target Figma file. `fetch-icon-inventory.js` returns `[]` if it doesn't; `push-icons.js` creates one on first push. Don't treat an empty inventory as an error.
- Assuming every icon component sits flat at the top level of the "Icons" page. As of 2026-09-09 they're organized into per-category top-level FRAMEs (`arrows`, `user interface`, `layout & format`, etc.) with the actual `COMPONENT`/`COMPONENT_SET` nodes nested one level inside each. `fetch-icon-inventory.js` uses `page.query('COMPONENT, COMPONENT_SET')` (recursive) specifically to survive this — don't revert it to a flat `page.children.filter(...)` scan, and don't assume a `[]` or missing-icon result means the icon doesn't exist without checking inside the category frames.
- Pulling a Figma icon's raw markup verbatim when it uses `stroke`/`stroke-width` instead of a filled path. Every icon in the codebase (including every other `-solid` one) is authored as `fill="none"` on the `<svg>` with a filled `<path fill="">` — no strokes — because `get-icon-svg.mjs`'s color override only string-replaces `fill="currentColor"`; a hardcoded `stroke` color silently ignores the `color`/`currentColor` prop. If Figma's source uses a stroke, don't hand-copy it: duplicate the node, call `strokeVectorNode.outlineStroke()` on the clone (converts the stroke to a pixel-identical filled outline), export that, then discard the clone — leave the real Figma component's stroke alone (it's the designer's live editing surface). Expect `diff_icons` to report that icon as `changed` for as long as Figma's own component stays stroke-based (comparing a filled-path `d` string against Figma's stroke-path `d` string can never hash-match) — that's expected, not unresolved drift. If the designer later converts the real Figma component to a filled outline too (Figma's own "Outline stroke"), re-pull its exact exported path into code at that point so both sides match precisely rather than leaving the hand-derived approximation in place. See `figma-sync-state.json`'s `icons` section for a worked example (`wend-icon-close-solid`, resolved both ways in the same session).
