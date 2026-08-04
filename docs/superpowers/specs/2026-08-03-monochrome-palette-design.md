# Monochrome core palette — design

## Purpose

Pivot wend-ui's default/core color palette from a branded palette (linen/mist/citron/lilac/indigo/midnight) to a monochrome one (black/white/gray, plus a small set of notification colors). This gives white-label clients a neutral, unbranded starting point to re-theme from, rather than having to strip out someone else's brand colors first. This is foundational/default-value work, distinct from — and not dependent on — the token-override mechanism described in the product roadmap's Phase 1 (`docs/superpowers/specs/2026-07-13-product-roadmap-design.md`), which is about *how clients override* tokens, not what Wend's own defaults should be.

## Goals

- Replace the global color palette with one neutral `gray` ramp plus small, purpose-built notification ramps (`amber` for warning, `green`/`red` unchanged for success/danger).
- Preserve the semantic/component token architecture exactly as-is — only the *values* semantic tokens alias change, not the three-tier structure, naming taxonomy, or dark-mode-cascade mechanism.
- Keep Figma Variables in sync with the new palette (per the existing `sync-tokens-to-figma` workflow).
- Ship a monochrome light AND dark mode, including a genuine inversion for interactive elements (dark mode's primary button is light-on-dark, not just a duller version of the light-mode button).

## Non-goals

- Building the client override/theming mechanism itself (Phase 1 of the product roadmap) — that's separate, future work this change doesn't block or depend on.
- Changing spacing, radius, or typography tokens — untouched.
- Retroactively updating already-shipped historical planning docs (`docs/superpowers/plans/2026-07-10-docs-website.md`, `docs/superpowers/specs/2026-07-10-docs-website-design.md`) that mention the old ramp names in describing already-built work. Unlike a not-yet-built future plan, these describe completed, shipped work and are point-in-time records, not living specs — same reasoning as not rewriting old commit messages.
- Adding a new component-tier "active"/"pressed" concept beyond what already exists (`color.button.primary.background.active`, added in prior work) — this change only updates what that existing token *resolves to*.

## Global palette

Remove the `linen`, `mist`, `citron`, `lilac`, `indigo`, `midnight` ramps from `packages/tokens/tokens/global/color.json` entirely. Replace with:

**`gray`** — reuses `linen`'s exact existing 50–900 values (already the warm undertone this project wants), plus five new steps derived from exact percentage math for button interaction states (see "Button state math" below):

| Step | Hex | Status |
|---|---|---|
| 25 | `#FFFFFF` | new — pure white |
| 50 | `#FAFAF9` | unchanged (was `linen.50`) |
| 100 | `#F9F8F7` | unchanged (was `linen.100`) |
| 200 | `#F6F6F3` | unchanged (was `linen.200`) |
| 300 | `#F4F3EF` | unchanged (was `linen.300`) |
| 400 | `#F1F0EB` | unchanged (was `linen.400`) |
| 500 | `#F0EEE9` | unchanged (was `linen.500`) |
| 600 | `#DCDAD5` | unchanged (was `linen.600`) |
| 650 | `#CCCCCC` | new |
| 675 | `#B2B2B2` | new |
| 700 | `#AFADAA` | unchanged (was `linen.700`) |
| 800 | `#787774` | unchanged (was `linen.800`) |
| 850 | `#4D4D4D` | new |
| 900 | `#393837` | unchanged (was `linen.900`) |
| 925 | `#333333` | new |
| 950 | `#000000` | **changed** (was `linen.950` = `#060605`) — now pure black |

`linen.950`'s original value (`#060605`) is dropped; nothing in the codebase referenced it as a distinct step from `900` in a way that requires preserving the old value.

**`amber`** (new) — replaces `citron` as the warning color:

| Step | Hex |
|---|---|
| 500 | `#F5A623` |
| 600 | `#C97F00` |

**`green`** and **`red`** — unchanged (`500`/`600` each, already minimal notification-only ramps).

### Button state math

The three new gray-ramp step clusters (25/650/675, 850/925/950) exist specifically so the primary button's default/hover/active states can be exact percentage mixes rather than arbitrary hand-picked colors:

- **Light mode** (button anchored to black): default = black + 20% white (`925`/`#333333`), hover = black + 30% white (`850`/`#4D4D4D`), active = pure black (`950`/`#000000`).
- **Dark mode** (button anchored to white, the inverse): default = white − 20% black (`650`/`#CCCCCC`), hover = white − 30% black (`675`/`#B2B2B2`), active = pure white (`25`/`#FFFFFF`).

Note the two modes use opposite hover/active *directions* relative to default — light mode's hover/active both move toward black (darker), dark mode's both move toward white (lighter) — because each is anchored to its own extreme (black in light mode's case, white in dark mode's). This was validated visually during design and is intentional, not an inconsistency to fix.

## Semantic mapping

All values below are aliases (`{color.gray.N}` / `{color.amber.N}` / etc.), matching the existing convention in `packages/tokens/tokens/semantic/color.json` / `color.dark.json` — no raw literals.

**Light** (`semantic/color.json`):

| Token | New value |
|---|---|
| `text.primary` | `gray.900` |
| `text.secondary` | `gray.800` |
| `text.on-primary` | `gray.50` |
| `text.on-secondary` | `gray.50` |
| `surface.canvas` | `gray.50` |
| `surface.canvas-recessed` | `gray.600` |
| `surface.card` | `gray.50` |
| `surface.card-recessed` | `gray.600` |
| `border.default` | `gray.700` |
| `action.primary.background` | `gray.925` |
| `action.primary.background-hover` | `gray.850` |
| `action.primary.background-active` | `gray.950` |
| `action.secondary.foreground` | `gray.800` |
| `feedback.success.background` | `green.600` (unchanged) |
| `feedback.warning.background` | `amber.500` (was `citron.500`) |
| `feedback.danger.background` | `red.600` (unchanged) |

**Dark** (`semantic/color.dark.json`):

| Token | New value |
|---|---|
| `text.primary` | `gray.50` |
| `text.secondary` | `gray.600` |
| `text.on-primary` | `gray.950` |
| `text.on-secondary` | `gray.950` |
| `surface.canvas` | `gray.950` |
| `surface.canvas-recessed` | `gray.850` |
| `surface.card` | `gray.950` |
| `surface.card-recessed` | `gray.850` |
| `border.default` | `gray.700` (same value as light — no override strictly required, but keep the explicit entry for clarity/symmetry with the rest of this file) |
| `action.primary.background` | `gray.650` |
| `action.primary.background-hover` | `gray.675` |
| `action.primary.background-active` | `gray.25` |
| `action.secondary.foreground` | `gray.600` |
| `feedback.success.background` | `green.500` (unchanged) |
| `feedback.danger.background` | `red.500` (unchanged) |

`feedback.warning` stays undefined in dark mode (same as today) — it cascades from light mode's `amber.500` in both themes, matching the existing (pre-change) behavior for this one feedback color. Not a new gap introduced by this change.

## Component tier

`packages/tokens/tokens/component/button.json` needs no structural changes — every color token already aliases a semantic `color.action.*` or `color.text.*` token, which now resolve to the grayscale values above automatically.

## Figma sync

Per the existing `sync-tokens-to-figma` skill workflow:
- Rename/recreate the color variable collections in Figma to match the new `gray`/`amber` structure (global, single mode) and the updated semantic Light/Dark values.
- `packages/design-sync-mcp/figma-sync-state.json` (cached Figma variable/node IDs, used by `dump-variable-map.js` to avoid re-discovery) will go stale once the old ramp variables are deleted/recreated in Figma — regenerate it after the Figma-side changes land.
- `packages/design-sync-mcp/README.md:26-27` documents the global collection using the old ramp names as examples (`linen-*`/`mist-*`/etc., and a `{color.midnight.500}` resolution-chain example) — update both to reference the new structure.

## Other ripple effects

- **`packages/tokens/README.md`**: update the "Color token naming" section's illustrative examples (currently reference `color-action-primary-background-hover` etc. generically — these stay valid — but add a gray-scale documentation table, matching the existing spacing/font-size scale tables' format).
- **`packages/web-components/src/foundations.html:264`**: the color-ramp swatch grid's `const ramps = ['linen', 'mist', 'citron', 'lilac', 'indigo', 'midnight']` must become `['gray', 'amber', 'green', 'red']` (or equivalent) so the live docs site shows the new palette instead of erroring on missing CSS variables.
- **`packages/tokens/scripts/generated-color-scales.json`**: an unreferenced (no script reads it), stale data dump of the old ramp values. Delete it rather than update it — it's dead weight duplicating what `global/color.json` already is the source of truth for.
- **Storybook / `components.html`**: no code changes needed — both read CSS custom properties and will reflect the new palette automatically once tokens rebuild.

## Verification plan

- `npm run build -w packages/tokens` succeeds (taxonomy validator passes unchanged, since only values change, not the JSON shape/naming taxonomy).
- Rebuild `packages/styles`/`packages/web-components`/Storybook and visually confirm in the browser: light mode card (primary/secondary text, primary button default/hover/active, recessed surface, feedback badges) and dark mode equivalent, matching the two approved mockups from the design session.
- Grep the repo for the six removed ramp names post-implementation — the only expected remaining hits are the two historical, already-shipped planning docs explicitly called out as non-goals above.
- Figma: `diff_tokens` between the rebuilt `packages/tokens` output and the updated Figma variables shows no drift.
