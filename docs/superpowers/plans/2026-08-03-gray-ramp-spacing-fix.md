# Gray Ramp Spacing Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the 16 `gray` ramp hex values with ones that have real, distinguishable gaps at both ends (currently `25`–`500` and `900`/`925`/`950` are each nearly indistinguishable clusters), while keeping `gray-25`/`gray-950` pure white/black and `gray-50` visually near-white.

**Architecture:** Pure value substitution — same 16 step names, same alias chain, no semantic/component/naming changes. Only `packages/tokens/tokens/global/color.json`'s leaf values change; everything downstream (CSS, Figma) picks up the new colors automatically.

**Tech Stack:** Style Dictionary (`packages/tokens`), Figma Plugin API (via `use_figma`), the `wend-ui-design-sync` MCP (`get_tokens`/`diff_tokens`).

## Global Constraints

- Exact new hex values (verified in design to have zero adjacent-step collisions at 8-bit sRGB precision):

| Step | New hex |
| --- | --- |
| `25` | `#FFFFFF` (unchanged) |
| `50` | `#FCFAF6` |
| `100` | `#E6E4E0` |
| `200` | `#C9C7C3` |
| `300` | `#A9A7A3` |
| `400` | `#8C8A87` |
| `500` | `#73716E` |
| `600` | `#5E5C58` |
| `650` | `#4D4B48` |
| `675` | `#3D3C38` |
| `700` | `#2F2E2A` |
| `800` | `#1C1A17` |
| `850` | `#0E0D0A` |
| `900` | `#040403` |
| `925` | `#010000` |
| `950` | `#000000` (unchanged) |

- No other token file changes — `semantic/color.json`, `semantic/color.dark.json`, `component/button.json` already alias these steps by name (`{color.gray.925}` etc.) and need zero edits.
- `packages/tokens/scripts/validate-color-taxonomy.js` is unaffected (only leaf values change, not JSON shape).
- Figma: this is a value-only update (`setValueForMode` on each existing `gray-*` variable) — do NOT delete/recreate variables like the original palette task did. Same 16 variable names/IDs as already exist in the `global` collection (fileKey `YZHv0wEIdBLrldVadPGKOr`).

---

## Task 1: Update token JSON and documentation

**Files:**
- Modify: `packages/tokens/tokens/global/color.json`
- Modify: `packages/tokens/README.md`

**Interfaces:**
- Produces: updated `color.gray.{25,50,100,200,300,400,500,600,650,675,700,800,850,900,925,950}` values — Task 2 (Figma) reads this same table to know what to push.

- [ ] **Step 1: Replace `packages/tokens/tokens/global/color.json`**

```json
{
  "color": {
    "gray": {
      "25": { "value": "#FFFFFF" },
      "50": { "value": "#FCFAF6" },
      "100": { "value": "#E6E4E0" },
      "200": { "value": "#C9C7C3" },
      "300": { "value": "#A9A7A3" },
      "400": { "value": "#8C8A87" },
      "500": { "value": "#73716E" },
      "600": { "value": "#5E5C58" },
      "650": { "value": "#4D4B48" },
      "675": { "value": "#3D3C38" },
      "700": { "value": "#2F2E2A" },
      "800": { "value": "#1C1A17" },
      "850": { "value": "#0E0D0A" },
      "900": { "value": "#040403" },
      "925": { "value": "#010000" },
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

- [ ] **Step 2: Update the "Color scale" table in `packages/tokens/README.md`**

Find the existing table (starts with `## Color scale`, ends right before `## Color token naming`) and replace the whole section with:

```md
## Color scale

`tokens/global/color.json`'s `gray` ramp is the core neutral scale everything else builds on:

| Token | Hex | Note |
| --- | --- | --- |
| `color-gray-25` | `#FFFFFF` | pure white — dark-mode primary button's active/pressed state |
| `color-gray-50` | `#FCFAF6` | lightest general-purpose step (canvas, card) |
| `color-gray-100` | `#E6E4E0` | |
| `color-gray-200` | `#C9C7C3` | |
| `color-gray-300` | `#A9A7A3` | |
| `color-gray-400` | `#8C8A87` | |
| `color-gray-500` | `#73716E` | |
| `color-gray-600` | `#5E5C58` | recessed surfaces |
| `color-gray-650` | `#4D4B48` | dark-mode primary button's default state |
| `color-gray-675` | `#3D3C38` | dark-mode primary button's hover state |
| `color-gray-700` | `#2F2E2A` | default border |
| `color-gray-800` | `#1C1A17` | secondary text, secondary action foreground |
| `color-gray-850` | `#0E0D0A` | light-mode primary button's hover state |
| `color-gray-900` | `#040403` | primary text |
| `color-gray-925` | `#010000` | light-mode primary button's default state |
| `color-gray-950` | `#000000` | pure black — light-mode primary button's active/pressed state |

`25`–`500` and `800`–`950` each have deliberately larger gaps than the steps in between (see [2026-08-03-gray-ramp-spacing-fix-design.md](../../docs/superpowers/specs/2026-08-03-gray-ramp-spacing-fix-design.md) for why: the first version of this ramp clustered too tightly at both ends). `650`/`675`/`850`/`925` are used for the primary button's default/hover states in dark/light mode respectively, but — unlike the original version of this ramp — are no longer derived from an exact percentage-mix formula; they're chosen as part of the overall ramp's spacing, with the button happening to use them. `25`/`950` remain pure white/black. The docs site's Foundations page ramp grid still only displays the 11 "plain" steps, `50`–`950` by hundreds.

`amber` (`500` = `#F5A623`, `600` = `#C97F00`) is the warning notification color, alongside the unrelated `green`/`red` ramps for success/danger — all three are minimal 2-shade ramps, not part of the neutral scale.
```

- [ ] **Step 3: Build and verify**

Run: `npm run build -w packages/tokens`

Expected: `✔︎ Color token taxonomy` printed, then all platform builds succeed with no errors (no reference errors possible here — only leaf values changed, no renamed/removed keys).

- [ ] **Step 4: Verify the resolved CSS matches the new values**

Run: `grep -A1 "color-gray-925\|color-gray-900\|color-gray-50:" packages/tokens/build/css/variables.css`

Expected: `--color-gray-50: #FCFAF6;`, `--color-gray-900: #040403;`, `--color-gray-925: #010000;` (exact values from the Global Constraints table).

- [ ] **Step 5: Rebuild dependent packages and visually verify in the browser**

```bash
npm run build -w packages/styles
npm run build -w packages/web-components
npm run build -w packages/react
```

Start Storybook (`npx storybook dev -p 6006 --ci &`, wait for "Storybook ready!"), and using the Browser pane:
- Navigate to the `Web Components/Button` Primary story. Confirm the canvas/background still reads as near-white (not visibly gray), and the button's default/hover/active states are now clearly, visibly different shades from each other (not near-identical like before this fix).
- Toggle dark mode (`document.documentElement.dataset.theme = 'dark'` via `javascript_tool`) and confirm the same: canvas near-black, button states in dark mode clearly distinguishable from each other.
- Take a screenshot of both states.

Stop the Storybook server afterward.

- [ ] **Step 6: Commit**

```bash
git add packages/tokens/tokens/global/color.json packages/tokens/README.md packages/tokens/build
git checkout -- packages/tokens/build 2>/dev/null; git reset packages/tokens/build 2>/dev/null
git add packages/tokens/tokens/global/color.json packages/tokens/README.md
git commit -m "Widen gray ramp spacing at both ends for real visual variation"
```

(Note: `packages/tokens/build` is gitignored — the two `git checkout`/`git reset` lines above are just insurance in case an earlier `git add` accidentally staged it; the final `git add` + commit should only include the two source files.)

---

## Task 2: Figma — update the gray ramp variable values

**Files:** none in the repo — this task only writes to the Figma file (`fileKey` `YZHv0wEIdBLrldVadPGKOr`) via `use_figma`. Load the `figma-use` skill before writing any `use_figma` call, per that skill's own mandatory-prerequisite rule.

**Interfaces:**
- Consumes: the exact 16 new hex values from Task 1's Global Constraints table.
- Produces: no repo changes — the 16 existing `gray-*` variables (same names/IDs as before) get updated values for their single `Value` mode.

- [ ] **Step 1: Read-only — confirm the current `gray-*` variables and their IDs**

```js
const collections = await figma.variables.getLocalVariableCollectionsAsync();
const global = collections.find(c => c.name === 'global');
const modeId = global.modes[0].modeId;
const results = [];
for (const id of global.variableIds) {
  const v = await figma.variables.getVariableByIdAsync(id);
  if (/^gray-/.test(v.name)) {
    const val = v.valuesByMode[modeId];
    const toHex = (c) => Math.round(c * 255).toString(16).padStart(2, '0');
    results.push({ id: v.id, name: v.name, currentHex: `#${toHex(val.r)}${toHex(val.g)}${toHex(val.b)}`.toUpperCase() });
  }
}
return { modeId, count: results.length, results };
```

Expected: `count` is 16, and `currentHex` values match the OLD hex values (e.g. `gray-925` should currently show `#333333`, `gray-900` should show `#393837`) — confirming these are the pre-fix values about to be replaced.

- [ ] **Step 2: Update all 16 variables' values**

```js
const collections = await figma.variables.getLocalVariableCollectionsAsync();
const global = collections.find(c => c.name === 'global');
const modeId = global.modes[0].modeId;

function hexToRgb(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255 };
}

const newValues = {
  '25': '#FFFFFF', '50': '#FCFAF6', '100': '#E6E4E0', '200': '#C9C7C3',
  '300': '#A9A7A3', '400': '#8C8A87', '500': '#73716E', '600': '#5E5C58',
  '650': '#4D4B48', '675': '#3D3C38', '700': '#2F2E2A', '800': '#1C1A17',
  '850': '#0E0D0A', '900': '#040403', '925': '#010000', '950': '#000000'
};

const updated = [];
for (const id of global.variableIds) {
  const v = await figma.variables.getVariableByIdAsync(id);
  const match = /^gray-(.+)$/.exec(v.name);
  if (!match) continue;
  const step = match[1];
  if (!(step in newValues)) continue;
  v.setValueForMode(modeId, hexToRgb(newValues[step]));
  updated.push(v.name);
}
return { updatedCount: updated.length, updated };
```

Expected: `updatedCount` is 16.

- [ ] **Step 3: Verify — read back all 16 and diff against code**

Re-run Step 1's read-only script (same code) — expected `results` now show the NEW hex values from the Global Constraints table.

Then call `mcp__wend-ui-design-sync__diff_tokens` with `mcp__wend-ui-design-sync__get_tokens`'s current output (after Task 1's rebuild) normalized to the `{ name, type, values: { light, dark } }` shape for these 16 `gray-*` tokens (same value for light/dark, since the `global` collection has one mode).

Expected: `onlyInFigma` and `changed` are both empty for every `gray-*` token.

- [ ] **Step 4: Regenerate `figma-sync-state.json`? No.**

This file caches variable IDs/names/mode IDs, not resolved color values (confirmed by reading `packages/design-sync-mcp/figma-scripts/dump-variable-map.js` — it never reads `valuesByMode`). Since Task 2 only changes values (not names, IDs, or which variables exist), the cache file needs no update. Do not touch it.

- [ ] **Step 5: No commit for this task** — it's Figma-only, no repo files change.

---

## Self-Review Notes

- **Spec coverage:** the design spec's Values table (Task 1 + Task 2), Non-goals (no semantic/naming/Figma-structure changes — confirmed neither task touches those), and Verification plan (build/taxonomy check, visual check, Figma diff_tokens check) are all covered.
- **Placeholder scan:** no TBD/TODO; every step has complete, runnable code or an exact grep/verification command.
- **Type/naming consistency:** the hex table is identical across the Global Constraints section, Task 1's JSON, Task 1's README table, and Task 2's `newValues` object — no drift.
