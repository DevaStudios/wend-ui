# Monochrome Core Palette Implementation Plan

> **Status: implemented — this document has been corrected to match what actually shipped.** The original draft (below, as first written on 2026-08-03) specified a 16-step gray ramp with `650`/`675`/`850`/`925` steps and 2-shade `amber`/`green`/`red` ramps. What actually landed — partly through this plan, partly through the follow-up [`docs/superpowers/specs/2026-08-04-color-ramp-expansion-design.md`](../specs/2026-08-04-color-ramp-expansion-design.md), and partly through later per-token fixes — is a **14-step gray ramp** (`25`–`1000`, using `700`/`800`/`900`/`950`/`975`/`1000` instead of the original's `650`/`675`/`850`/`925`) and **full 10-step `amber`/`green`/`red` ramps** (`50`–`900`), not the 2-shade ramps this plan originally proposed. All checkboxes below are checked and every value table/JSON block reflects the current codebase (`packages/tokens/tokens/` as of this correction), not the original draft. If you're looking for the "why 14 steps and not the original 16," see the color-ramp-expansion spec linked above.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace wend-ui's branded color palette (linen/mist/citron/lilac/indigo/midnight) with a monochrome one (gray + amber/green/red), keeping the token architecture, Figma variables, and docs all in sync.

**Architecture:** Pure value substitution at the global/semantic token tiers — no structural, taxonomy, or component-tier changes. The three-tier alias chain (component → semantic → global) already isolates this: change what global ramps exist and what semantic tokens alias, and every component/CSS output updates automatically through the existing Style Dictionary build.

**Tech Stack:** Style Dictionary (`packages/tokens`), Figma Plugin API (via `use_figma`), the `wend-ui-design-sync` MCP (`get_tokens`/`diff_tokens`).

## Global Constraints (as implemented)

- Every semantic color value is an alias (`{color.gray.N}` / `{color.amber.N}` / etc.), never a raw hex literal — matches the existing convention in every `semantic/color*.json` file and is required for the dark-mode CSS-cascade mechanism described in `packages/tokens/README.md`'s "Light/dark mode" section.
- The color-token naming taxonomy (`packages/tokens/scripts/validate-color-taxonomy.js`) is unchanged by this work — only which global token a semantic/component token resolves to changes, not the JSON shape.
- Final global `gray` ramp (14 steps, `packages/tokens/tokens/global/color.json`):
  - `25`=`#FFFFFF`, `50`=`#FAF9F9`, `100`=`#F4F2F2`, `200`=`#E8E3E3`, `300`=`#DBD7D7`, `400`=`#CDCBCB`, `500`=`#B4B1B1`, `600`=`#9A9898`, `700`=`#8D8B8B`, `800`=`#676565`, `900`=`#4D4C4C`, `950`=`#333333`, `975`=`#1A1A1A`, `1000`=`#000000`.
  - No `650`/`675`/`850`/`925` steps exist — the original draft's plan to hand-pick those four for button interaction-state math was superseded by the color-ramp-expansion spec's evenly-spaced 14-step scale, which reuses `950`/`975`/`1000` for that same purpose instead (see the "Color scale" section of `packages/tokens/README.md`).
- Final `amber`/`green`/`red` ramps: **full 10-step scales** (`50`→`900`), not the 2-shade ramps this plan originally proposed — see the table in `packages/tokens/README.md`'s "Color scale" section for exact hex values. Generated in HSL with a shared lightness curve; only `500`/`600` of each are consumed by any token today (`color-feedback-warning/success/danger-background`), plus `red` additionally supplies `50`/`100`/`300`/`400`/`700`/`800`/`900` to the destructive button variants.
- Figma fileKey: `YZHv0wEIdBLrldVadPGKOr`. The `global` variable collection has a single `Value` mode; the `semantic` collection has `Light`/`Dark` modes — matching the code structure exactly (see `packages/tokens/README.md`'s "Figma mode sync" section). **Naming in the live Figma file mixes slash-style (`color/gray/25`, `color/green/600`) and dash-style (`color-gray-700`, `color-amber-500`) for different individual variables within the same ramp** — a leftover of this migration happening in multiple passes. Always confirm a variable's actual name via a read-only script before writing to it; don't assume either style.

---

## Task 1: Replace token JSON (global palette + semantic mappings)

**Files:**
- Modify: `packages/tokens/tokens/global/color.json`
- Modify: `packages/tokens/tokens/semantic/color.json`
- Modify: `packages/tokens/tokens/semantic/color.dark.json`

**Interfaces:**
- Produces: global tokens `color.gray.{25,50,100,200,300,400,500,600,700,800,900,950,975,1000}`, `color.amber.{50..900}`, `color.green.{50..900}`, `color.red.{50..900}` — later tasks (Figma sync) create matching Figma variables with these exact names/values.
- Consumes: nothing from other tasks — this is the root of the token dependency chain.

- [x] **Step 1: `packages/tokens/tokens/global/color.json`** (current content)

```json
{
  "color": {
    "gray": {
      "25": { "value": "#FFFFFF" },
      "50": { "value": "#FAF9F9" },
      "100": { "value": "#F4F2F2" },
      "200": { "value": "#E8E3E3" },
      "300": { "value": "#DBD7D7" },
      "400": { "value": "#CDCBCB" },
      "500": { "value": "#B4B1B1" },
      "600": { "value": "#9A9898" },
      "700": { "value": "#8D8B8B" },
      "800": { "value": "#676565" },
      "900": { "value": "#4D4C4C" },
      "950": { "value": "#333333" },
      "975": { "value": "#1A1A1A" },
      "1000": { "value": "#000000" }
    },
    "amber": {
      "50": { "value": "#FBF6EF" }, "100": { "value": "#F9EDD7" }, "200": { "value": "#F8DDAF" },
      "300": { "value": "#F9C976" }, "400": { "value": "#FBB53C" }, "500": { "value": "#FDA308" },
      "600": { "value": "#D18605" }, "700": { "value": "#A36B0A" }, "800": { "value": "#7B530F" },
      "900": { "value": "#543C12" }
    },
    "green": {
      "50": { "value": "#F0F9F5" }, "100": { "value": "#DBF5E9" }, "200": { "value": "#BAEED5" },
      "300": { "value": "#8AE5BB" }, "400": { "value": "#5ADDA0" }, "500": { "value": "#30D588" },
      "600": { "value": "#27B070" }, "700": { "value": "#238B5A" }, "800": { "value": "#206A47" },
      "900": { "value": "#1C4A35" }
    },
    "red": {
      "50": { "value": "#FAF0EF" }, "100": { "value": "#F7DCD9" }, "200": { "value": "#F3BBB4" },
      "300": { "value": "#EE8C81" }, "400": { "value": "#E95D4E" }, "500": { "value": "#E43421" },
      "600": { "value": "#BB2B1B" }, "700": { "value": "#93261A" }, "800": { "value": "#702219" },
      "900": { "value": "#4F1D17" }
    }
  }
}
```

- [x] **Step 2: `packages/tokens/tokens/semantic/color.json`** (light — current content)

```json
{
  "color": {
    "text": {
      "primary": { "value": "{color.gray.975}" },
      "secondary": { "value": "{color.gray.800}" },
      "on-primary": { "value": "{color.gray.50}" },
      "on-secondary": { "value": "{color.gray.50}" },
      "disabled": { "value": "{color.gray.500}" }
    },
    "surface": {
      "canvas": { "value": "{color.gray.50}" },
      "canvas-recessed": { "value": "{color.gray.600}" },
      "card": { "value": "{color.gray.50}" },
      "card-recessed": { "value": "{color.gray.600}" }
    },
    "border": {
      "default": { "value": "{color.gray.700}" }
    },
    "action": {
      "primary": {
        "background": { "value": "{color.gray.950}" },
        "background-hover": { "value": "{color.gray.975}" },
        "background-active": { "value": "{color.gray.1000}" },
        "background-disabled": { "value": "{color.gray.200}" },
        "foreground": { "value": "{color.gray.50}" },
        "foreground-disabled": { "value": "{color.gray.500}" }
      },
      "secondary": {
        "foreground": { "value": "{color.gray.800}" },
        "background": { "value": "{color.gray.100}" },
        "background-hover": { "value": "{color.gray.200}" }
      },
      "tertiary": {
        "foreground": { "value": "{color.gray.800}" },
        "foreground-hover": { "value": "{color.gray.900}" }
      },
      "destructive": {
        "foreground": { "value": "{color.action.primary.foreground}" },
        "background": { "value": "{color.red.600}" },
        "background-hover": { "value": "{color.red.700}" }
      },
      "destructive-secondary": {
        "foreground": { "value": "{color.red.600}" },
        "background": { "value": "{color.red.50}" },
        "background-hover": { "value": "{color.red.100}" }
      },
      "destructive-tertiary": {
        "foreground": { "value": "{color.red.600}" },
        "foreground-hover": { "value": "{color.red.700}" }
      }
    },
    "feedback": {
      "success": { "background": { "value": "{color.green.600}" } },
      "warning": { "background": { "value": "{color.amber.500}" } },
      "danger": { "background": { "value": "{color.red.600}" } }
    }
  }
}
```

Note: `action.primary.foreground`/`action.primary.foreground-disabled` and `action.destructive.foreground`'s alias to `action.primary.foreground` postdate this plan's original draft — added so button foreground colors can stay fixed across light/dark (see Task 1 Step 3) without changing `color.text.on-primary`/`color.text.disabled`, which still correctly flip by mode for their other (non-button) consumers. Full rationale in `packages/tokens/README.md`'s "Color scale" section.

- [x] **Step 3: `packages/tokens/tokens/semantic/color.dark.json`** (dark overrides — current content)

```json
{
  "color": {
    "text": {
      "primary": { "value": "{color.gray.25}" },
      "secondary": { "value": "{color.gray.300}" },
      "on-primary": { "value": "{color.gray.950}" },
      "on-secondary": { "value": "{color.gray.950}" },
      "disabled": { "value": "{color.gray.700}" }
    },
    "surface": {
      "canvas": { "value": "{color.gray.950}" },
      "canvas-recessed": { "value": "{color.gray.900}" },
      "card": { "value": "{color.gray.950}" },
      "card-recessed": { "value": "{color.gray.900}" }
    },
    "border": {
      "default": { "value": "{color.gray.700}" }
    },
    "feedback": {
      "success": { "background": { "value": "{color.green.500}" } },
      "danger": { "background": { "value": "{color.red.500}" } }
    }
  }
}
```

Note: unlike the original draft, this file has **no `action` block at all**. Every `action.*`/`button.*` color is now identical in light and dark mode (buttons keep a fixed colored background regardless of app theme), so there's nothing to override — they all cascade from `color.json`'s light values, the same mechanism that already applied to `feedback.warning` (which never had a dark override either).

- [x] **Step 4: Build and verify the taxonomy validator + full pipeline pass**

Run: `npm run build -w packages/tokens` — passes, `✔︎ Color token taxonomy` printed first, then all platform builds (`figma`, `js`, `css`, `scss`) complete with no errors.

- [x] **Step 5: Verify the resolved CSS output matches the design spec exactly**

Current resolved values — `grep -A1 "color-action-primary-background" packages/tokens/build/css/variables.css packages/tokens/build/css/variables-dark.css`:

Light mode (`variables.css`): `--color-action-primary-background:var(--color-gray-950)`, `--color-action-primary-background-hover:var(--color-gray-975)`. Dark mode (`variables-dark.css`): **no entry** — `color-action-primary-background` isn't in `color.dark.json` at all, so it isn't in the filtered dark stylesheet; it cascades from `:root`'s light value at runtime instead (same value in both themes).

- [x] **Step 6: Rebuild dependent packages and visually verify in the browser**

Verified: primary button is near-black by default (`#333333`) in both light and dark mode; text/canvas correctly flip by theme; dark mode canvas goes near-black, text goes near-white.

- [x] **Step 7: Commit** — landed across several commits as the palette evolved (initial monochrome swap, then the 08-04 ramp expansion, then later per-token dark-mode fixes) rather than a single commit as originally planned.

---

## Task 2: Update the docs site's color reference and remove stale data

**Files:**
- Modified: `packages/web-components/src/foundations.html`
- Deleted: `packages/tokens/scripts/generated-color-scales.json`

**Interfaces:**
- Consumes: Task 1's rebuilt CSS custom properties (`--color-gray-*`).

- [x] **Step 1: Ramps array in `packages/web-components/src/foundations.html`** (current content, differs from the original draft's proposal)

```js
const ramps = ['gray'];
const steps = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950', '975'];
```

Unlike the original draft (which proposed showing `gray`/`amber`/`green`/`red` as four rows), the foundations page shows **only `gray`** — the 2-shade-per-ramp `amber`/`green`/`red` display idea from the original draft doesn't apply now that those ramps are full 10-step scales in their own right; they're documented in `packages/tokens/README.md`'s table instead. `25` and `1000` are also excluded from this grid (they're the button-state math endpoints, not general-purpose visual-reference steps) — same reasoning the original draft applied to its own `650`/`675`/`850`/`925`.

- [x] **Step 2: Delete the stale, unreferenced data file** — `packages/tokens/scripts/generated-color-scales.json` removed.

- [x] **Step 3: Rebuild and visually verify the foundations page** — confirmed: one `gray` row, 12 steps, smooth light-to-dark ramp.

- [x] **Step 4: Commit**

---

## Task 3: Documentation updates

**Files:**
- Modified: `packages/tokens/README.md`
- Modified: `packages/design-sync-mcp/README.md`

**Interfaces:**
- Consumes: the gray/amber/green/red ramp tables from Task 1.

- [x] **Step 1: "Color scale" section in `packages/tokens/README.md`** — present and current (gray-scale table with the 14 real steps, plus prose on the `amber`/`green`/`red` HSL generation and the "buttons don't flip by theme" rationale for `action.primary.foreground`/`foreground-disabled`).

- [x] **Step 2: Update `packages/design-sync-mcp/README.md`** — corrected. The "single-shade feedback colors" claim and the `{color.gray.925}` example were both fixed to describe the real 14-step gray / 10-step amber/green/red ramps and the actual `{color.gray.950}` alias chain, plus a note on the mixed slash/dash naming and that `action.*`/`button.*` tokens no longer differ by mode.

- [x] **Step 3: Commit**

---

## Task 4: Figma — global collection's color variables

**Files:** none in the repo — Figma only (`fileKey` `YZHv0wEIdBLrldVadPGKOr`).

- [x] **Done, in a different final shape than originally scripted.** The live Figma `global` collection now has color variables for the full 14-step `gray` ramp and 10-step `amber`/`green`/`red` ramps, matching Task 1's tables. As called out in Global Constraints above, individual variable names are inconsistently split between slash-style (`color/gray/25`–`color/gray/600`, `color/green/600`, `color/red/600`) and dash-style (`color-gray-700`–`color-gray-1000`, `color-amber-*`, most of `color-green-*`/`color-red-*`) — a byproduct of this ramp being touched across multiple sync passes with different naming conventions in play at the time. A read-only inventory script (matching the pattern in Task 1 Step 1 of the original draft) is still the right way to confirm current names before writing to any of them; don't assume either style from this note alone, since Figma-side renames aren't tracked here.

---

## Task 5: Figma — semantic variable mapping + sync-state cache

**Files:**
- Modified: `packages/design-sync-mcp/figma-sync-state.json`

- [x] **Semantic variables repointed** — the live `semantic` collection's `Light`/`Dark` color variables resolve to the gray/red steps in Task 1's `color.json`/`color.dark.json` tables above (verified via `diff_tokens` returning empty `changed`/`onlyInFigma` for every `color-action-*`/`color-button-*`/`color-text-*` token as of the most recent sync).
- [x] **`figma-sync-state.json` regenerated** — `lastVerified` bumped to 2026-08-19, `collections` replaced with a fresh `dump-variable-map.js` run reflecting the ramp expansion and every semantic variable added since (including the new `action.primary.foreground`/`foreground-disabled` pair and the still-unpulled `color/ui/text/*` and `spacing/default`-family variables). Also added the `wend-button` component's icon-left/icon-right property keys under `nodes.buttonComponentSetProperties`, added 2026-08-19 in the same session.

---

## Self-Review Notes (as corrected)

- This document was rewritten to match the actual shipped state rather than the original 2026-08-03 draft, which specified a different (superseded) gray-step scheme and 2-shade `amber`/`green`/`red` ramps. See the status note at the top of the file for the full provenance.
- `packages/design-sync-mcp/README.md` (Task 3) and `figma-sync-state.json` (Task 5), initially found still referencing the superseded intermediate state, have both since been corrected (2026-08-19) as a follow-up to this correction pass.
- Task 1's `color.json`/`color.dark.json`/`color.json` (global) blocks, Task 2's `foundations.html` snippet, Task 4's Figma-naming note, and Task 5's `figma-sync-state.json` regeneration were all verified directly against the live files/Figma variables at the time of this correction, not reconstructed from memory.
