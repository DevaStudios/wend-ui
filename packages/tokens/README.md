# @wend-ui/tokens

Design tokens for the wend-ui design system, defined once as JSON and built with [Style Dictionary](https://styledictionary.com/) into multiple output formats.

## Three-tier architecture

```
tokens/
  global/      # raw primitives, no meaning — color ramps (gray/blue/purple/green/amber/red), spacing, radius, typography
  semantic/     # named by purpose, alias global tokens — text/surface/border/action/feedback colors
                # color.json = light (default) values; color.dark.json = only the values that differ in dark mode
  component/    # scoped to one component, alias semantic (colors) or global (spacing/radius/font) directly
                # e.g. button.json
```

Spacing/radius/typography are **global-only** — they don't have a light/dark dimension and don't need a semantic layer at this project's size, so components reference them directly. Color is the tier that actually needs all three, since meaning and mode-awareness both live there.

## Spacing scale

`tokens/global/spacing.json` defines a numeric scale — the key is not the pixel value itself, but roughly tracks it (key ≈ px × 12.5) so steps can be inserted later without renaming existing ones; two steps (`700`, `1000`) break that ratio on purpose to hit specific pixel targets (54px, 88px):

| Token | px | rem |
| --- | --- | --- |
| `spacing-0` | 0 | `0` |
| `spacing-25` | 2 | `0.125rem` |
| `spacing-50` | 4 | `0.25rem` |
| `spacing-100` | 8 | `0.5rem` |
| `spacing-125` | 10 | `0.625rem` |
| `spacing-150` | 12 | `0.75rem` |
| `spacing-200` | 16 | `1rem` |
| `spacing-250` | 20 | `1.25rem` |
| `spacing-275` | 22 | `1.375rem` |
| `spacing-300` | 24 | `1.5rem` |
| `spacing-350` | 28 | `1.75rem` |
| `spacing-400` | 32 | `2rem` |
| `spacing-500` | 40 | `2.5rem` |
| `spacing-550` | 44 | `2.75rem` |
| `spacing-600` | 48 | `3rem` |
| `spacing-700` | 54 | `3.375rem` |
| `spacing-800` | 64 | `4rem` |
| `spacing-1000` | 88 | `5.5rem` |
| `spacing-1200` | 96 | `6rem` |
| `spacing-1600` | 128 | `8rem` |
| `spacing-3200` | 256 | `16rem` |

Source values are unitless numbers representing px (e.g. `"16"`, not `"16px"`). The `css` and `scss` platforms convert them to `rem` (÷16, via the custom `size/spacing-rem` transform in `scripts/rem-transforms.js`) so spacing respects the user's font-size settings — Style Dictionary's built-in `size/px`/`size/rem` transforms don't apply here, since they only fire on tokens with an explicit DTCG `"type": "dimension"`, which nothing in this repo sets. The `js` and `figma` platforms keep the raw px-equivalent numbers, since JS consumers may need the raw number for calculations and Figma variables don't understand `rem` strings.

## Font size scale

`tokens/global/typography.json`'s `font.size` uses the same numeric scale convention as spacing (key ≈ px × 12.5, anchored so `200` = 16px, matching `spacing-200`):

| Token | px | rem |
| --- | --- | --- |
| `font-size-175` | 14 | `0.875rem` |
| `font-size-200` | 16 | `1rem` |
| `font-size-250` | 20 | `1.25rem` |
| `font-size-350` | 28 | `1.75rem` |

Same conversion mechanism as spacing: unitless px-equivalent source values, converted to `rem` for `css`/`scss` only (via `size/font-size-rem` in `scripts/rem-transforms.js`), left as raw numbers for `js`/`figma`.

## Radius scale

`tokens/global/radius.json` uses named (not numeric) steps, unlike spacing/font-size:

| Token | px |
| --- | --- |
| `radius-none` | 0 |
| `radius-light` | 2 |
| `radius-regular` | 4 |
| `radius-medium` | 8 |
| `radius-strong` | 16 |
| `radius-pill` | 20 |
| `radius-bold` | 32 |
| `radius-circle` | 9999 |

Source values are unitless numbers representing px (same convention as spacing/font-size). Unlike those two, radius resolves to **px, not rem** — corner radii don't need to scale with the user's font-size setting, so the `css`/`scss` platforms convert via the custom `size/radius-px` transform in `scripts/radius-px-transform.js` (appends `px`, no scaling; `0` stays unitless). The `js`/`figma` platforms keep the raw numbers, same as spacing/font-size.

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

## Color token naming

Semantic and component color tokens follow `color-{scope}-{variant}-{property}[-{state}]`, where `{scope}` is a semantic category (`text`, `surface`, `border`, `action`, `feedback`) or a component name (`button`):

- **`text`/`surface`/`border`** — the category name already says which CSS property the token feeds, so no property segment is added: `color-text-primary`, `color-surface-canvas`, `color-border-default`.
- **`action`/`feedback`** (role-based, ambiguous property) — get an explicit property segment (`background` or `foreground`, matching how the token is actually used today) and a `-hover`/`-active` suffix only when a non-default state exists: `color-action-primary-background`, `color-action-primary-background-hover`, `color-action-primary-background-active`, `color-action-secondary-foreground`, `color-feedback-success-background`.
- **`button`** (and future components) — every color token gets both a property segment and an explicit state segment, even for the default case: `color-button-primary-background-default`, `color-button-primary-background-hover`, `color-button-primary-background-active`, `color-button-primary-foreground-default`, `color-button-secondary-foreground-default`, `color-button-secondary-border-default`.

`npm run build -w packages/tokens` runs `scripts/validate-color-taxonomy.js` first and fails the build with a specific, per-token error if a new color token doesn't fit this shape (bare leaf where a property/state split is required, an unrecognized category, a stray `-default` suffix at the semantic tier, a missing `default` state at the component tier, etc.) — run `npm run validate-taxonomy -w packages/tokens` to check without doing a full build. Adding a genuinely new semantic category requires registering it as `SELF_EVIDENT_CATEGORIES` or `ROLE_BASED_CATEGORIES` in that script first (the validator treats an unregistered category as an error, not a silent pass).

For `button` specifically, this means `tokens/component/button.json` nests its color tokens under a top-level `color.button.*` path (not `button.color.*`) so `color` sorts first in the output name. The file keeps a separate, plain `button.*` top-level key for its non-color tokens (`button-padding-block`, `button-padding-inline`, `button-radius`, `button-font-size`, `button-font-weight`) — those are unaffected by this taxonomy and keep their existing flat names.

References use Style Dictionary's `{color.gray.900}` syntax and are preserved as CSS `var()` chains in the output (`outputReferences: true`) — e.g. `--color-button-primary-background-default: var(--color-action-primary-background)`. This is what makes dark mode work efficiently: overriding a handful of leaf `color.*` values under `[data-theme="dark"]` cascades through every semantic and component token that references them, with no dark-specific redeclaration needed at those tiers.

## Light/dark mode

Two separate Style Dictionary configs — light and dark need genuinely different merged token trees, since `source` isn't safely overridable per-platform and merging both into one tree would just let dark values clobber light ones:

- `style-dictionary.config.js` — global + `semantic/color.json` (light) + component. Outputs `:root { ... }`.
- `style-dictionary.dark.config.js` — global + **both** `semantic/color.json` (light, listed first) **and** `semantic/color.dark.json` (overrides, listed after — wins for any path both files define). Component tokens are included too, so e.g. `color.button.primary.background.default`'s `{color.action.primary.background}` reference resolves correctly against the dark-overridden value, not just the leaf semantic tokens `color.dark.json` mentions directly.
  - Its `css` platform still **filters** output down to just the tokens `color.dark.json` actually defines (`[data-theme="dark"] { ... }`, ~14 declarations) — everything else cascades from `variables.css`'s `:root` at runtime, so there's no point redeclaring it.
  - Its `figma` platform does **not** filter — it needs every token fully resolved in the dark context (see below).
  - `log: { warnings: 'disabled' }` — including both light and dark semantic files together is inherently a "collision" from Style Dictionary's point of view (that's the override mechanism working as intended), and the filtered `css` platform will always report referencing tokens outside the filtered file (they're in `variables.css`, resolved via CSS cascade). Both are expected; silenced rather than left as unexplained noise on every build.

Activate dark mode by setting `data-theme="dark"` on `<html>` (or any ancestor) — e.g. `document.documentElement.dataset.theme = 'dark'`. There's no `prefers-color-scheme` auto-detection yet; that could be layered on later by wrapping the same dark values in an `@media` query.

## Figma mode sync

`build/figma/tokens.json` carries **both** modes per token — `{ name, type, values: { light, dark } }` — mirroring Figma's native per-collection modes. It's assembled by `scripts/merge-figma-modes.mjs` from two fully-resolved intermediate exports (`tokens-light.json`, `tokens-dark.json`, both gitignored build output), zipped together by name. Tokens with no dark override just end up with `light === dark`. [`@wend-ui/design-sync-mcp`](../design-sync-mcp)'s `get_tokens`/`diff_tokens` consume this directly — pushing it into Figma Variables is still a manual `use_figma` step, not automated by this build (see that package's README for the two-collection push convention: `global`, single mode, and `semantic`, Light/Dark modes with alias-based values).

`font-family-base` is `'Funnel Sans', sans-serif` — a real, single web font (Google Fonts), so unlike the old system-font CSS stack this pushes to Figma as-is (`"Funnel Sans"`, no stand-in needed). Consumers of `@wend-ui/tokens`/`@wend-ui/styles` are responsible for actually loading the font (e.g. a Google Fonts `<link>` or self-hosted `@font-face`) — the token only names it, it doesn't load it. See `packages/web-components/src/index.html` for the reference `<link>` tag.

## Build

```sh
npm run build -w packages/tokens
```

Outputs to `build/`:

- `build/css/variables.css` / `build/css/variables-dark.css` — CSS custom properties, light and dark
- `build/scss/_variables.scss` — Sass variables (light values only — SCSS variables are compile-time, not mode-aware)
- `build/js/tokens.js` — CommonJS module exporting the token tree (light values only)
- `build/figma/tokens.json` — flat `{ name, type, values: { light, dark } }` list; consumed by [`@wend-ui/design-sync-mcp`](../design-sync-mcp)'s `get_tokens`/`diff_tokens` tools and pushed into Figma Variables via Claude Code + Figma's Dev Mode MCP

## Usage

```css
@import '@wend-ui/tokens/css';
@import '@wend-ui/tokens/css-dark';
```

```js
import tokens from '@wend-ui/tokens/js';
```

```scss
@import '@wend-ui/tokens/scss';
```
