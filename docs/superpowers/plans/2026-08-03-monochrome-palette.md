# Monochrome Core Palette Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace wend-ui's branded color palette (linen/mist/citron/lilac/indigo/midnight) with a monochrome one (gray + amber/green/red), keeping the token architecture, Figma variables, and docs all in sync.

**Architecture:** Pure value substitution at the global/semantic token tiers — no structural, taxonomy, or component-tier changes. The three-tier alias chain (component → semantic → global) already isolates this: change what global ramps exist and what semantic tokens alias, and every component/CSS output updates automatically through the existing Style Dictionary build.

**Tech Stack:** Style Dictionary (`packages/tokens`), Figma Plugin API (via `use_figma`), the `wend-ui-design-sync` MCP (`get_tokens`/`diff_tokens`).

## Global Constraints

- Every semantic color value must be an alias (`{color.gray.N}` / `{color.amber.N}`), never a raw hex literal — matches the existing convention in every current `semantic/color*.json` file and is required for the dark-mode CSS-cascade mechanism described in `packages/tokens/README.md`'s "Light/dark mode" section to keep working.
- The color-token naming taxonomy (`packages/tokens/scripts/validate-color-taxonomy.js`) is unchanged by this work — only which global token a semantic/component token resolves to changes, not the JSON shape. `npm run build -w packages/tokens` must keep passing the taxonomy validator with zero code changes to that script.
- New global gray ramp steps and exact hex values (all other steps are `linen`'s existing unchanged values):
  - `25` = `#FFFFFF`, `650` = `#CCCCCC`, `675` = `#B2B2B2`, `850` = `#4D4D4D`, `925` = `#333333`, `950` = `#000000` (changed from linen's old `#060605`).
- New `amber` ramp: `500` = `#F5A623`, `600` = `#C97F00`.
- `green`/`red` ramps unchanged.
- Figma fileKey: `YZHv0wEIdBLrldVadPGKOr`. The `global` variable collection has a single `Value` mode; the `semantic` collection has `Light`/`Dark` modes — matching the code structure exactly (see `packages/tokens/README.md`'s "Figma mode sync" section).

---

## Task 1: Replace token JSON (global palette + semantic mappings)

**Files:**
- Modify: `packages/tokens/tokens/global/color.json`
- Modify: `packages/tokens/tokens/semantic/color.json`
- Modify: `packages/tokens/tokens/semantic/color.dark.json`

**Interfaces:**
- Produces: global tokens `color.gray.{25,50,100,200,300,400,500,600,650,675,700,800,850,900,925,950}`, `color.amber.{500,600}` — later tasks (Figma sync) create matching Figma variables with these exact names/values.
- Consumes: nothing from other tasks — this is the root of the token dependency chain.

- [ ] **Step 1: Replace `packages/tokens/tokens/global/color.json`**

```json
{
  "color": {
    "gray": {
      "25": { "value": "#FFFFFF" },
      "50": { "value": "#FAFAF9" },
      "100": { "value": "#F9F8F7" },
      "200": { "value": "#F6F6F3" },
      "300": { "value": "#F4F3EF" },
      "400": { "value": "#F1F0EB" },
      "500": { "value": "#F0EEE9" },
      "600": { "value": "#DCDAD5" },
      "650": { "value": "#CCCCCC" },
      "675": { "value": "#B2B2B2" },
      "700": { "value": "#AFADAA" },
      "800": { "value": "#787774" },
      "850": { "value": "#4D4D4D" },
      "900": { "value": "#393837" },
      "925": { "value": "#333333" },
      "950": { "value": "#000000" }
    },
    "amber": {
      "500": { "value": "#F5A623" },
      "600": { "value": "#C97F00" }
    },
    "green": {
      "500": { "value": "#29B377" },
      "600": { "value": "#1E8E5A" }
    },
    "red": {
      "500": { "value": "#E4483A" },
      "600": { "value": "#C0392B" }
    }
  }
}
```

- [ ] **Step 2: Replace `packages/tokens/tokens/semantic/color.json`**

```json
{
  "color": {
    "text": {
      "primary": { "value": "{color.gray.900}" },
      "secondary": { "value": "{color.gray.800}" },
      "on-primary": { "value": "{color.gray.50}" },
      "on-secondary": { "value": "{color.gray.50}" }
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
        "background": { "value": "{color.gray.925}" },
        "background-hover": { "value": "{color.gray.850}" },
        "background-active": { "value": "{color.gray.950}" }
      },
      "secondary": {
        "foreground": { "value": "{color.gray.800}" }
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

- [ ] **Step 3: Replace `packages/tokens/tokens/semantic/color.dark.json`**

```json
{
  "color": {
    "text": {
      "primary": { "value": "{color.gray.50}" },
      "secondary": { "value": "{color.gray.600}" },
      "on-primary": { "value": "{color.gray.950}" },
      "on-secondary": { "value": "{color.gray.950}" }
    },
    "surface": {
      "canvas": { "value": "{color.gray.950}" },
      "canvas-recessed": { "value": "{color.gray.850}" },
      "card": { "value": "{color.gray.950}" },
      "card-recessed": { "value": "{color.gray.850}" }
    },
    "border": {
      "default": { "value": "{color.gray.700}" }
    },
    "action": {
      "primary": {
        "background": { "value": "{color.gray.650}" },
        "background-hover": { "value": "{color.gray.675}" },
        "background-active": { "value": "{color.gray.25}" }
      },
      "secondary": {
        "foreground": { "value": "{color.gray.600}" }
      }
    },
    "feedback": {
      "success": { "background": { "value": "{color.green.500}" } },
      "danger": { "background": { "value": "{color.red.500}" } }
    }
  }
}
```

Note: `feedback.warning` stays absent from this file — matching the pre-existing behavior where warning has no dark-mode override and cascades from the light value in both themes.

- [ ] **Step 4: Build and verify the taxonomy validator + full pipeline pass**

Run: `npm run build -w packages/tokens`

Expected: `✔︎ Color token taxonomy` printed first, then all platform builds (`figma`, `js`, `css`, `scss`) complete with no errors. If Style Dictionary reports an unresolved reference error (e.g. `could not be resolved` mentioning `linen`/`mist`/`citron`/`lilac`/`indigo`/`midnight`), it means a reference was missed in Steps 1-3 — grep `packages/tokens/tokens/` for the offending name and fix it there (there should be none, since Steps 1-3 replace every file that references the global tier).

- [ ] **Step 5: Verify the resolved CSS output matches the design spec exactly**

Run: `grep -A1 "color-action-primary-background" packages/tokens/build/css/variables.css packages/tokens/build/css/variables-dark.css`

Expected (light mode, `variables.css`): `--color-action-primary-background:var(--color-gray-925)`, `--color-action-primary-background-hover:var(--color-gray-850)`. Expected (dark mode, `variables-dark.css`): `--color-action-primary-background:var(--color-gray-650)`, `--color-action-primary-background-hover:var(--color-gray-675)`.

- [ ] **Step 6: Rebuild dependent packages and visually verify in the browser**

```bash
npm run build -w packages/styles
npm run build -w packages/web-components
npm run build -w packages/react
```

Then start Storybook (`npx storybook dev -p 6006 --ci &`, wait for "Storybook ready!"), and using the Browser pane:
- Navigate to the `Web Components/Button` Primary story. Confirm: the button is near-black by default (`#333333`), and toggling `:hover`/`:active` states (or checking computed styles) shows the lighter/darkest values from Step 5.
- Toggle dark mode (Storybook's own theme toggle, or by adding `data-theme="dark"` via `javascript_tool`: `document.documentElement.dataset.theme = 'dark'`) and confirm the canvas goes near-black, text goes near-white, and the primary button becomes a light gray/white button.
- Take a screenshot of both states.

Stop the Storybook server afterward.

- [ ] **Step 7: Commit**

```bash
git add packages/tokens/tokens/global/color.json packages/tokens/tokens/semantic/color.json packages/tokens/tokens/semantic/color.dark.json packages/tokens/build
git commit -m "Replace branded palette with monochrome gray + amber/green/red"
```

---

## Task 2: Update the docs site's color reference and remove stale data

**Files:**
- Modify: `packages/web-components/src/foundations.html:264`
- Delete: `packages/tokens/scripts/generated-color-scales.json`

**Interfaces:**
- Consumes: Task 1's rebuilt CSS custom properties (`--color-gray-*`, `--color-amber-*`).

- [ ] **Step 1: Update the ramps array in `packages/web-components/src/foundations.html`**

Find (around line 264):

```js
      const ramps = ['linen', 'mist', 'citron', 'lilac', 'indigo', 'midnight'];
```

Replace with:

```js
      const ramps = ['gray', 'amber', 'green', 'red'];
```

Leave the `steps` array (`['50', '100', ..., '950']`) unchanged — it deliberately does not include the new `25`/`650`/`675`/`850`/`925` steps, since those exist specifically for the primary button's interaction-state math (documented in `packages/tokens/README.md`, added in Task 3), not as part of the general-purpose visual reference scale this grid shows. `amber`/`green`/`red` only have `500`/`600` defined — the grid's existing behavior already handles a ramp missing some steps (`var(--color-amber-50)` on an undefined CSS variable renders as transparent/empty, matching how `green`/`red` already rendered before this change, since they were always 2-shade-only ramps sitting in the same grid alongside the 11-shade brand ramps).

- [ ] **Step 2: Delete the stale, unreferenced data file**

```bash
git rm packages/tokens/scripts/generated-color-scales.json
```

(Confirmed in the design spec: no build script reads this file — it's a one-off dump of the old ramp values that would otherwise silently go stale.)

- [ ] **Step 3: Rebuild and visually verify the foundations page**

```bash
npm run build -w packages/web-components
```

Start the web-components dev server (`npm run dev:components` in the background, or reuse the pattern from Task 1's Storybook verification — either way, serve `packages/web-components/www/foundations.html`). Using the Browser pane, navigate to the Foundations page and confirm:
- Four rows are shown: `gray`, `amber`, `green`, `red` (not the old six).
- The `gray` row shows all 11 documented steps (50–950) as a smooth light-to-dark ramp with no visibly broken/transparent swatches.
- The `amber`/`green`/`red` rows show only two swatches each (at the `500`/`600` positions), with the remaining swatch slots empty/transparent — matching how `green`/`red` already rendered before this change.

- [ ] **Step 4: Commit**

```bash
git add packages/web-components/src/foundations.html
git commit -m "Update docs site color reference to the monochrome palette"
```

---

## Task 3: Documentation updates

**Files:**
- Modify: `packages/tokens/README.md`
- Modify: `packages/design-sync-mcp/README.md`

**Interfaces:**
- Consumes: the exact gray-ramp step/hex table from Task 1's Global Constraints.

- [ ] **Step 1: Add a "Color scale" section to `packages/tokens/README.md`**

Insert a new section after the existing "Radius scale" section and before "## Color token naming" (i.e., right after the table/prose ending the Radius scale section, before the `## Color token naming` heading):

```md
## Color scale

`tokens/global/color.json`'s `gray` ramp is the core neutral scale everything else builds on:

| Token | Hex | Note |
| --- | --- | --- |
| `color-gray-25` | `#FFFFFF` | pure white — dark-mode primary button's active/pressed state |
| `color-gray-50` | `#FAFAF9` | lightest general-purpose step (canvas, card) |
| `color-gray-100` | `#F9F8F7` | |
| `color-gray-200` | `#F6F6F3` | |
| `color-gray-300` | `#F4F3EF` | |
| `color-gray-400` | `#F1F0EB` | |
| `color-gray-500` | `#F0EEE9` | |
| `color-gray-600` | `#DCDAD5` | recessed surfaces |
| `color-gray-650` | `#CCCCCC` | dark-mode primary button's default state (white − 20% black) |
| `color-gray-675` | `#B2B2B2` | dark-mode primary button's hover state (white − 30% black) |
| `color-gray-700` | `#AFADAA` | default border |
| `color-gray-800` | `#787774` | secondary text, secondary action foreground |
| `color-gray-850` | `#4D4D4D` | light-mode primary button's hover state (black + 30% white) |
| `color-gray-900` | `#393837` | primary text |
| `color-gray-925` | `#333333` | light-mode primary button's default state (black + 20% white) |
| `color-gray-950` | `#000000` | pure black — light-mode primary button's active/pressed state |

The `650`/`675`/`850`/`925` steps (and the `25` endpoint) exist specifically so the primary button's default/hover/active states are exact percentage mixes toward black (light mode) or white (dark mode) rather than arbitrary hand-picked colors — they aren't meant to be a general-purpose part of the visual scale (the docs site's Foundations page ramp grid deliberately only displays the 11 "plain" steps, `50`–`950` by hundreds).

`amber` (`500` = `#F5A623`, `600` = `#C97F00`) is the warning notification color, alongside the unrelated `green`/`red` ramps for success/danger — all three are minimal 2-shade ramps, not part of the neutral scale.
```

- [ ] **Step 2: Update `packages/design-sync-mcp/README.md`**

Find (around lines 26-27):

```md
- **`global`** — the primitive scale (`linen-*`/`mist-*`/`citron-*`/`lilac-*`/`indigo-*`/`midnight-*` ramps, plus `radius-*`, `spacing-*`, `font-*`). Single mode (`Value`) — primitives don't change with theme, so there's no Light/Dark split here.
- **`semantic`** — everything else: `color-text-*`/`color-surface-*`/`color-border-*`/`color-action-*`/`color-feedback-*`, the component-tier `color-button-*` color tokens, and the component-tier `button-*` non-color tokens (padding/radius/font). Has **Light** and **Dark** modes. Each variable's value is a `VARIABLE_ALIAS` pointing at the `global` collection (or, for `color-button-*`, at another `semantic` variable) rather than a resolved literal — matching how the source JSON itself references tokens (e.g. `color.button.primary.background.default` → `{color.action.primary.background}` → `{color.midnight.500}`). This means changing a global primitive in Figma propagates to every semantic/component token that references it, the same as the build pipeline.
```

Replace with:

```md
- **`global`** — the primitive scale (`gray-*`, `amber-*`, `green-*`, `red-*` ramps, plus `radius-*`, `spacing-*`, `font-*`). Single mode (`Value`) — primitives don't change with theme, so there's no Light/Dark split here.
- **`semantic`** — everything else: `color-text-*`/`color-surface-*`/`color-border-*`/`color-action-*`/`color-feedback-*`, the component-tier `color-button-*` color tokens, and the component-tier `button-*` non-color tokens (padding/radius/font). Has **Light** and **Dark** modes. Each variable's value is a `VARIABLE_ALIAS` pointing at the `global` collection (or, for `color-button-*`, at another `semantic` variable) rather than a resolved literal — matching how the source JSON itself references tokens (e.g. `color.button.primary.background.default` → `{color.action.primary.background}` → `{color.gray.925}`). This means changing a global primitive in Figma propagates to every semantic/component token that references it, the same as the build pipeline.
```

- [ ] **Step 3: Commit**

```bash
git add packages/tokens/README.md packages/design-sync-mcp/README.md
git commit -m "Document the monochrome gray scale and update design-sync-mcp README"
```

---

## Task 4: Figma — replace the global collection's color variables

**Files:** none in the repo — this task only writes to the Figma file (`fileKey` `YZHv0wEIdBLrldVadPGKOr`) via `use_figma`. Load the `figma-use` skill before writing any `use_figma` call, per that skill's own mandatory-prerequisite rule.

**Interfaces:**
- Consumes: the exact gray/amber name→hex table from Task 1's Global Constraints.
- Produces: Figma variables named `gray-{25,50,100,200,300,400,500,600,650,675,700,800,850,900,925,950}` and `amber-{500,600}` in the `global` collection, each with `scopes: ['ALL_SCOPES']` (matching the existing scope convention for `spacing-*`/`radius-*` siblings in that same collection, per the `sync-tokens-to-figma` skill's own guidance to check a sibling variable first) — Task 5 aliases semantic variables to these by name.

- [ ] **Step 1: Read-only — confirm the current global collection's color variables**

```js
const collections = await figma.variables.getLocalVariableCollectionsAsync();
const global = collections.find(c => c.name === 'global');
const results = [];
for (const id of global.variableIds) {
  const v = await figma.variables.getVariableByIdAsync(id);
  if (/^(linen|mist|citron|lilac|indigo|midnight)-/.test(v.name)) {
    results.push({ id: v.id, name: v.name, scopes: v.scopes });
  }
}
return { collectionId: global.id, modeId: global.modes[0].modeId, count: results.length, sample: results.slice(0, 3) };
```

Expected: `count` is 66 (6 ramps × 11 steps). Note the `scopes` array shown in `sample` for use in Step 2 — that step captures it directly from a live variable rather than needing it hand-copied here.

- [ ] **Step 2: In one script — capture the existing color scopes convention, delete the 66 old ramp variables, and create the 18 new `gray`/`amber` variables**

Doing this as one atomic script (rather than separate read/delete/create calls) means the scopes value never has to be manually copy-pasted between steps — it's captured from a real variable and reused in the same execution.

```js
const collections = await figma.variables.getLocalVariableCollectionsAsync();
const global = collections.find(c => c.name === 'global');
const modeId = global.modes[0].modeId;

function hexToRgb(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255 };
}

// Capture the scopes convention from an existing color variable before deleting it.
let colorScopes = null;
const deletedNames = [];
for (const id of [...global.variableIds]) {
  const v = await figma.variables.getVariableByIdAsync(id);
  if (/^(linen|mist|citron|lilac|indigo|midnight)-/.test(v.name)) {
    if (colorScopes === null) colorScopes = v.scopes;
    deletedNames.push(v.name);
    v.remove();
  }
}
if (colorScopes === null) throw new Error('No existing linen/mist/citron/lilac/indigo/midnight variable found to read scopes from');

const grayValues = {
  '25': '#FFFFFF', '50': '#FAFAF9', '100': '#F9F8F7', '200': '#F6F6F3',
  '300': '#F4F3EF', '400': '#F1F0EB', '500': '#F0EEE9', '600': '#DCDAD5',
  '650': '#CCCCCC', '675': '#B2B2B2', '700': '#AFADAA', '800': '#787774',
  '850': '#4D4D4D', '900': '#393837', '925': '#333333', '950': '#000000'
};
const amberValues = { '500': '#F5A623', '600': '#C97F00' };

const created = [];
for (const [step, hex] of Object.entries(grayValues)) {
  const variable = figma.variables.createVariable(`gray-${step}`, global, 'COLOR');
  variable.scopes = colorScopes;
  variable.setValueForMode(modeId, hexToRgb(hex));
  created.push({ id: variable.id, name: variable.name });
}
for (const [step, hex] of Object.entries(amberValues)) {
  const variable = figma.variables.createVariable(`amber-${step}`, global, 'COLOR');
  variable.scopes = colorScopes;
  variable.setValueForMode(modeId, hexToRgb(hex));
  created.push({ id: variable.id, name: variable.name });
}

return { deletedCount: deletedNames.length, scopesUsed: colorScopes, createdCount: created.length, created };
```

Expected: `deletedCount` is 66, `createdCount` is 18, `created` lists `gray-25` through `gray-950` (16 entries) plus `amber-500`/`amber-600`.

If this single script is too large for one `use_figma` call in practice (the `figma-use` skill's incremental-workflow guidance caps at ~10 logical operations per call, and this does 66 deletes + 18 creates = 84), split it: run the deletion half first (returning `colorScopes` so you can read it back), then a second call that recreates `colorScopes` as a literal array copied from that first call's returned value and proceeds with creation. Either way, the scopes value comes from something you actually read off the live file, not a value invented ahead of time.

- [ ] **Step 3: Verify — read back all color variables in the global collection**

```js
const collections = await figma.variables.getLocalVariableCollectionsAsync();
const global = collections.find(c => c.name === 'global');
const modeId = global.modes[0].modeId;
const results = [];
for (const id of global.variableIds) {
  const v = await figma.variables.getVariableByIdAsync(id);
  if (/^(gray|amber)-/.test(v.name)) {
    const val = v.valuesByMode[modeId];
    const toHex = (c) => Math.round(c * 255).toString(16).padStart(2, '0');
    results.push({ name: v.name, hex: `#${toHex(val.r)}${toHex(val.g)}${toHex(val.b)}`.toUpperCase() });
  }
}
return { count: results.length, results };
```

Expected: `count` is 18. Every `hex` matches the `grayValues`/`amberValues` tables in Step 2 exactly, and no `linen`/`mist`/`citron`/`lilac`/`indigo`/`midnight` variables remain (already confirmed by the deletion count in Step 2).

---

## Task 5: Figma — repoint semantic variables and regenerate the sync-state cache

**Files:**
- Modify: `packages/design-sync-mcp/figma-sync-state.json`

**Interfaces:**
- Consumes: the 18 global variable IDs created in Task 4 (re-discover by name via `getLocalVariableCollectionsAsync`, don't hardcode IDs from Task 4's output — a fresh session has no memory of them).
- Consumes: the exact light/dark semantic mapping tables from the design spec (`docs/superpowers/specs/2026-08-03-monochrome-palette-design.md`, "Semantic mapping" section).

- [ ] **Step 1: Read-only — list the semantic collection's color variables and current mode IDs**

```js
const collections = await figma.variables.getLocalVariableCollectionsAsync();
const semantic = collections.find(c => c.name === 'semantic');
const modes = {};
for (const m of semantic.modes) modes[m.name] = m.modeId;

const results = [];
for (const id of semantic.variableIds) {
  const v = await figma.variables.getVariableByIdAsync(id);
  if (v.resolvedType === 'COLOR') results.push(v.name);
}
return { modes, variableNames: results };
```

Expected: `modes` has `Light` and `Dark` keys. `variableNames` includes entries matching the semantic mapping table (e.g. something resolving to `color-text-primary`, `color-action-primary-background`, `color-action-primary-background-hover`, `color-action-primary-background-active`, `color-feedback-warning-background`, etc.) — note the exact naming convention used (this Figma file has historically used both `color/action/primary-background`-style and `color-action-primary-background`-style names for different variables per earlier investigation in this project — confirm which applies to each one you touch in Step 2 rather than assuming).

- [ ] **Step 2: Repoint each semantic color variable's Light and Dark mode values**

Build the alias-setting script from the mapping below. For each semantic variable, set both modes' values to a `VARIABLE_ALIAS` pointing at the corresponding new global variable's ID (look up IDs by name at runtime — do not hardcode IDs):

| Semantic variable (by role) | Light → global variable | Dark → global variable |
| --- | --- | --- |
| text primary | `gray-900` | `gray-50` |
| text secondary | `gray-800` | `gray-600` |
| text on-primary | `gray-50` | `gray-950` |
| text on-secondary | `gray-50` | `gray-950` |
| surface canvas | `gray-50` | `gray-950` |
| surface canvas-recessed | `gray-600` | `gray-850` |
| surface card | `gray-50` | `gray-950` |
| surface card-recessed | `gray-600` | `gray-850` |
| border default | `gray-700` | `gray-700` |
| action primary background | `gray-925` | `gray-650` |
| action primary background-hover | `gray-850` | `gray-675` |
| action primary background-active | `gray-950` | `gray-25` |
| action secondary foreground | `gray-800` | `gray-600` |
| feedback success background | `green-600` | `green-500` |
| feedback warning background | `amber-500` | *(no Dark override — leave existing Dark value alone, or if one exists pointing at the old `citron-500`, repoint it to `amber-500` too so both modes agree, matching the code's own cascade-from-light behavior)* |
| feedback danger background | `red-600` | `red-500` |

```js
const collections = await figma.variables.getLocalVariableCollectionsAsync();
const globalCollection = collections.find(c => c.name === 'global');
const semantic = collections.find(c => c.name === 'semantic');
const lightModeId = semantic.modes.find(m => m.name === 'Light').modeId;
const darkModeId = semantic.modes.find(m => m.name === 'Dark').modeId;

async function globalIdByName(name) {
  for (const id of globalCollection.variableIds) {
    const v = await figma.variables.getVariableByIdAsync(id);
    if (v.name === name) return v.id;
  }
  throw new Error(`global variable not found: ${name}`);
}

// Map each semantic variable's real Figma name (from Step 1's variableNames) to its
// { light, dark } global variable names. Fill this in using Step 1's actual names —
// example shape for one entry:
const mapping = {
  'color-text-primary': { light: 'gray-900', dark: 'gray-50' }
  // ... one entry per row in the table above, using the real names from Step 1
};

const updated = [];
for (const id of semantic.variableIds) {
  const v = await figma.variables.getVariableByIdAsync(id);
  const m = mapping[v.name];
  if (!m) continue;
  const lightId = await globalIdByName(m.light);
  v.setValueForMode(lightModeId, { type: 'VARIABLE_ALIAS', id: lightId });
  if (m.dark) {
    const darkId = await globalIdByName(m.dark);
    v.setValueForMode(darkModeId, { type: 'VARIABLE_ALIAS', id: darkId });
  }
  updated.push(v.name);
}
return { updatedCount: updated.length, updated };
```

Expected: `updatedCount` matches the number of rows you filled into `mapping` (15, or 16 if you also repointed the warning variable's Dark mode).

Work in small batches per the `figma-use` skill's incremental-workflow guidance (at most ~10 logical operations per `use_figma` call) — split the `mapping` object across multiple calls if needed, verifying between each rather than doing all 15-16 in one script.

- [ ] **Step 3: Verify — diff against the rebuilt code tokens**

Read the light/dark values back (same pattern as Task 4 Step 3, but for the semantic collection and both modes), normalize to the `{ name, type, values: { light, dark } }` shape, and call `mcp__wend-ui-design-sync__diff_tokens` with `mcp__wend-ui-design-sync__get_tokens`'s current output.

Expected: `onlyInFigma` and `changed` are both empty for every token this task touched (`color-text-*`, `color-surface-*`, `color-border-default`, `color-action-*`, `color-feedback-*`). `onlyInProject` will still list every non-color token (spacing/radius/font) and any color token whose Figma variable lives only in the `global` collection under a different structure — that's expected and out of scope for this diff (matches the tool's documented behavior from prior sessions, not a new gap).

- [ ] **Step 4: Regenerate `figma-sync-state.json`**

Run the read-only script from `packages/design-sync-mcp/figma-scripts/dump-variable-map.js` (paste its contents verbatim into a `use_figma` call) and copy its returned `collections` value into `packages/design-sync-mcp/figma-sync-state.json`'s `"collections"` key, replacing the existing content. Update `"lastVerified"` to today's date.

- [ ] **Step 5: Commit**

```bash
git add packages/design-sync-mcp/figma-sync-state.json
git commit -m "Sync Figma variables to the monochrome palette"
```

---

## Self-Review Notes

- **Spec coverage:** global palette (Task 1), semantic light/dark mapping (Task 1), component tier (no changes needed, confirmed in the spec and not re-litigated here), Figma sync — both collections (Tasks 4-5), docs README + design-sync-mcp README (Task 3), foundations.html + stale-file cleanup (Task 2), verification plan (build/taxonomy check in Task 1, visual check in Tasks 1-2, `diff_tokens` check in Task 5) — every section of the design spec has a corresponding task.
- **Placeholder scan:** no TBD/TODO. Task 5's `mapping` object is intentionally partially-filled in the plan text (one example entry) with an explicit instruction to complete it from Step 1's real output — this isn't a placeholder in the prohibited sense, since the actual target values (which global variable each semantic role points to) are fully specified in the table directly above it; only the exact Figma-side variable *names* are legitimately unknowable until Step 1 runs against the live file.
- **Type/naming consistency:** `gray-{step}` and `amber-{step}` naming is identical across Task 1 (code), Task 3 (README), and Tasks 4-5 (Figma) — no drift between "gray" vs "neutral" or similar naming variance.
