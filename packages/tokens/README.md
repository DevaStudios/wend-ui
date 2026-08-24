# @wend-ui/tokens

Design tokens for the wend-ui design system, defined once as JSON and built with [Style Dictionary](https://styledictionary.com/) into multiple output formats.

## Three-tier architecture

```
tokens/
  global/      # raw primitives, no meaning — color ramps (gray/blue/purple/green/amber/red), spacing, sizing, radius, typography
  semantic/     # named by purpose, alias global tokens — text/surface/border/action/feedback colors
                # color.json = light (default) values; color.dark.json = only the values that differ in dark mode
  component/    # scoped to one component, alias semantic (colors) or global (spacing/radius/font) directly
                # e.g. button.json
```

Spacing/sizing/radius/typography are **global-only** — they don't have a light/dark dimension and don't need a semantic layer at this project's size, so components reference them directly. Color is the tier that actually needs all three, since meaning and mode-awareness both live there.

## Spacing scale

`tokens/global/spacing.json` defines a numeric scale — the key is not the pixel value itself, but roughly tracks it (key ≈ px × 12.5) so steps can be inserted later without renaming existing ones; two steps (`700`, `1000`) break that ratio on purpose to hit specific pixel targets (54px, 88px):

| Token          | px  | rem        |
| -------------- | --- | ---------- |
| `spacing-0`    | 0   | `0`        |
| `spacing-25`   | 2   | `0.125rem` |
| `spacing-50`   | 4   | `0.25rem`  |
| `spacing-100`  | 8   | `0.5rem`   |
| `spacing-125`  | 10  | `0.625rem` |
| `spacing-150`  | 12  | `0.75rem`  |
| `spacing-200`  | 16  | `1rem`     |
| `spacing-250`  | 20  | `1.25rem`  |
| `spacing-275`  | 22  | `1.375rem` |
| `spacing-300`  | 24  | `1.5rem`   |
| `spacing-350`  | 28  | `1.75rem`  |
| `spacing-400`  | 32  | `2rem`     |
| `spacing-500`  | 40  | `2.5rem`   |
| `spacing-550`  | 44  | `2.75rem`  |
| `spacing-600`  | 48  | `3rem`     |
| `spacing-700`  | 54  | `3.375rem` |
| `spacing-800`  | 64  | `4rem`     |
| `spacing-1000` | 88  | `5.5rem`   |
| `spacing-1200` | 96  | `6rem`     |
| `spacing-1600` | 128 | `8rem`     |
| `spacing-3200` | 256 | `16rem`    |

Source values are unitless numbers representing px (e.g. `"16"`, not `"16px"`). The `css` and `scss` platforms convert them to `rem` (÷16, via the custom `size/spacing-rem` transform in `scripts/rem-transforms.js`) so spacing respects the user's font-size settings — Style Dictionary's built-in `size/px`/`size/rem` transforms don't apply here, since they only fire on tokens with an explicit DTCG `"type": "dimension"`, which nothing in this repo sets. The `js` and `figma` platforms keep the raw px-equivalent numbers, since JS consumers may need the raw number for calculations and Figma variables don't understand `rem` strings.

## Sizing scale

`tokens/global/sizing.json` is a second numeric scale for fixed element dimensions (icon boxes, avatars, square button sizes) as distinct from spacing (gaps/padding) — it deliberately reuses spacing's exact step names and px values rather than defining its own ramp, so a `100` step means the same 8px regardless of which scale it's read from:

| Token         | px  | rem        |
| ------------- | --- | ---------- |
| `sizing-0`    | 0   | `0`        |
| `sizing-25`   | 2   | `0.125rem` |
| `sizing-50`   | 4   | `0.25rem`  |
| `sizing-100`  | 8   | `0.5rem`   |
| `sizing-125`  | 10  | `0.625rem` |
| `sizing-150`  | 12  | `0.75rem`  |
| `sizing-200`  | 16  | `1rem`     |
| `sizing-250`  | 20  | `1.25rem`  |
| `sizing-275`  | 22  | `1.375rem` |
| `sizing-300`  | 24  | `1.5rem`   |
| `sizing-350`  | 28  | `1.75rem`  |
| `sizing-400`  | 32  | `2rem`     |
| `sizing-500`  | 40  | `2.5rem`   |
| `sizing-550`  | 44  | `2.75rem`  |
| `sizing-600`  | 48  | `3rem`     |
| `sizing-700`  | 54  | `3.375rem` |
| `sizing-800`  | 64  | `4rem`     |
| `sizing-1000` | 88  | `5.5rem`   |
| `sizing-1200` | 96  | `6rem`     |
| `sizing-1600` | 128 | `8rem`     |
| `sizing-3200` | 256 | `16rem`    |

Same conversion mechanism as spacing: unitless px-equivalent source values, converted to `rem` for `css`/`scss` (via the `size/sizing-rem` transform in `scripts/rem-transforms.js`, filtered on category `sizing` rather than `spacing` — otherwise identical to `size/spacing-rem`), left as raw numbers for `js`/`figma`. Kept as a separate top-level `sizing.*` token (not an alias of `spacing.*`) so a component's width/height and its padding/gap can be reasoned about — and renamed — independently later, even though they share a scale today.

## Font size scale

`tokens/global/typography.json`'s `font.size` uses the same numeric scale convention as spacing (key ≈ px × 12.5, anchored so `200` = 16px, matching `spacing-200`):

| Token           | px  | rem        |
| --------------- | --- | ---------- |
| `font-size-150` | 12  | `0.75rem`  |
| `font-size-175` | 14  | `0.875rem` |
| `font-size-200` | 16  | `1rem`     |
| `font-size-250` | 20  | `1.25rem`  |
| `font-size-350` | 28  | `1.75rem`  |

`font-size-150` was added for the Help Text / Text Input pull (2026-08-24) — Figma's `font-size/150` variable, matching the `150` step already established on the spacing/sizing scales (12px).

Same conversion mechanism as spacing: unitless px-equivalent source values, converted to `rem` for `css`/`scss` only (via `size/font-size-rem` in `scripts/rem-transforms.js`), left as raw numbers for `js`/`figma`.

## Radius scale

`tokens/global/radius.json` uses named (not numeric) steps, unlike spacing/font-size:

| Token            | px   |
| ---------------- | ---- |
| `radius-none`    | 0    |
| `radius-light`   | 2    |
| `radius-regular` | 4    |
| `radius-medium`  | 8    |
| `radius-strong`  | 16   |
| `radius-pill`    | 20   |
| `radius-bold`    | 32   |
| `radius-circle`  | 9999 |

Source values are unitless numbers representing px (same convention as spacing/font-size). Unlike those two, radius resolves to **px, not rem** — corner radii don't need to scale with the user's font-size setting, so the `css`/`scss` platforms convert via the custom `size/radius-px` transform in `scripts/radius-px-transform.js` (appends `px`, no scaling; `0` stays unitless). The `js`/`figma` platforms keep the raw numbers, same as spacing/font-size.

## Color scale

`tokens/global/color.json`'s `gray` ramp is the core neutral scale everything else builds on:

| Token             | Hex       | Note                                                                                                                                                                    |
| ----------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `color-gray-25`   | `#FFFFFF` | dark-mode primary text; light-mode input surface (checkbox background)                                                                                                  |
| `color-gray-50`   | `#FAF9F9` | lightest general-purpose step — light-mode canvas/card, light-mode text-on-primary/on-secondary; primary action/button foreground (both modes); dark-mode focus outline |
| `color-gray-100`  | `#F4F2F2` | secondary action/button background (both modes); dark-mode input border; dark-mode text-hover                                                                           |
| `color-gray-200`  | `#E8E3E3` | primary action/button background-disabled, secondary action/button background-hover, tertiary action/button background-hover (both modes)                               |
| `color-gray-300`  | `#DBD7D7` | dark-mode secondary text; secondary action/button background-active, tertiary action/button background-active (both modes)                                              |
| `color-gray-400`  | `#CDCBCB` | light-mode toggle-unchecked background (track)                                                                                                                          |
| `color-gray-500`  | `#B4B1B1` | light-mode text-disabled; primary action/button foreground-disabled (both modes)                                                                                        |
| `color-gray-600`  | `#9A9898` | light-mode recessed surfaces; toggle-unchecked background-hover (both modes); toggle thumb shadow color (both modes)                                                    |
| `color-gray-700`  | `#8D8B8B` | default border (both modes); dark-mode text-disabled                                                                                                                    |
| `color-gray-800`  | `#676565` | secondary text, secondary action foreground, tertiary action foreground (both modes); light-mode input border; dark-mode toggle-unchecked background (track)            |
| `color-gray-900`  | `#4D4C4C` | tertiary action foreground-hover (both modes); dark-mode recessed surfaces; dark-mode input surface (checkbox background)                                               |
| `color-gray-950`  | `#333333` | primary action/button background (both modes); dark-mode canvas/card, dark-mode text-on-primary/on-secondary; light-mode text-hover                                     |
| `color-gray-975`  | `#1A1A1A` | light-mode primary text; primary action/button background-hover (both modes); light-mode focus outline                                                                  |
| `color-gray-1000` | `#000000` | pure-black endpoint — primary action/button background-active (both modes)                                                                                              |

`1000` (pure black) sits below `975` and is reserved for the primary button's active state, the same in both light and dark mode — it isn't used as a general-purpose text/surface color. `25` (pure white) is still the lightest step.

As of the most recent Figma sync, every `action.primary`/`action.secondary`/`action.tertiary`/`action.destructive*` token (and therefore every `button.*` color that references one) is deliberately **identical in light and dark mode** — buttons keep a fixed appearance regardless of app theme, since they already carry their own colored background. `text.primary`, `text.secondary`, and `text.disabled` still flip normally between modes (they follow the surrounding page theme), which is why `action.primary.foreground`/`action.primary.foreground-disabled` exist as their own semantic leaves rather than aliasing `color.text.on-primary`/`color.text.disabled` — those two still diverge by mode, so a button-specific value was needed to stay constant.

`amber`, `green`, and `red` are the feedback colors (warning/success/danger) — each a full 10-step scale (`50`→`900`), unrelated to the neutral `gray` scale. `red` is the most heavily used: `600`/`500` back `color-feedback-danger-background` (light/dark), and the destructive button variants (`destructive-primary`/`destructive-secondary`/`destructive-tertiary`) additionally consume `50`, `100`, `300`, `400`, `500`, `700`, `800`, `900` across the `color-action-destructive*` tokens (light/dark, default/hover) — see [Color token naming](#color-token-naming) below. As of the Help Text / Text Input pull (2026-08-24), `amber`/`green` are no longer just `500`/`600`: `color-text-success`/`color-border-success` (`green.800` light, `green.300`/`green.400` dark) and `color-text-warning`/`color-border-warning` (`amber.800`/`amber.700` light, `amber.300`/`amber.400` dark) round out the two ramps, plus `color-text-danger`/`color-border-danger` (`red.700` light, `red.200`/`red.300` dark) for `red`.

| Step  | Amber     | Green     | Red       |
| ----- | --------- | --------- | --------- |
| `50`  | `#FBF6EF` | `#F0F9F5` | `#FAF0EF` |
| `100` | `#F9EDD7` | `#DBF5E9` | `#F7DCD9` |
| `200` | `#F8DDAF` | `#BAEED5` | `#F3BBB4` |
| `300` | `#F9C976` | `#8AE5BB` | `#EE8C81` |
| `400` | `#FBB53C` | `#5ADDA0` | `#E95D4E` |
| `500` | `#FDA308` | `#30D588` | `#E43421` |
| `600` | `#D18605` | `#27B070` | `#BB2B1B` |
| `700` | `#A36B0A` | `#238B5A` | `#93261A` |
| `800` | `#7B530F` | `#206A47` | `#702219` |
| `900` | `#543C12` | `#1C4A35` | `#4F1D17` |

Generated in HSL — fixed hue per color (amber ≈38°, green ≈152°, red ≈6°, calibrated from the original `500`/`600` anchors), a shared lightness curve across all three (`96, 91, 83, 72, 61, 51, 42, 34, 27, 20` for `50`→`900`), and per-hue saturation tapering at both extremes. See [`docs/superpowers/specs/2026-08-04-color-ramp-expansion-design.md`](../../docs/superpowers/specs/2026-08-04-color-ramp-expansion-design.md) for the full design rationale.

## Color token naming

Semantic and component color tokens follow `color-{scope}-{variant}-{property}[-{state}]`, where `{scope}` is a semantic category (`text`, `surface`, `border`, `action`, `feedback`) or a component name (`button`, `checkbox`, `toggle`, `radio`, `radio-group`, `help-text`, `text-input`):

- **`text`/`surface`/`border`** — the category name already says which CSS property the token feeds, so no property segment is added: `color-text-primary`, `color-surface-canvas`, `color-border-default`, `color-border-focus`, `color-surface-input`, `color-border-input`, `color-text-hover`, `color-text-success`, `color-text-warning`, `color-text-danger`, `color-border-success`, `color-border-warning`, `color-border-danger`. `border.focus` (`color-border-focus`) is the shared focus-ring color, consumed by `button-focus-outline-color`/`checkbox-focus-outline-color` — it flips by mode like the rest of `border.*`/`text.*` (light `gray.975`, dark `gray.50`), rather than staying fixed like the button action colors. `surface.input`/`border.input` (`color-surface-input`/`color-border-input`) are the shared background/border for form-control surfaces (checkbox box, toggle thumb, radio control, and now text-input's field) — also mode-flipping (`surface.input`: light `gray.25`, dark `gray.900`; `border.input`: light `gray.800`, dark `gray.100`), and deliberately distinct from `surface.card`/`border.default` since Figma authored them as separate values, not aliases. `text.hover` (`color-text-hover`, light `gray.950`, dark `gray.100`) is radio's hover-state text/dot color — a new "ui"-namespaced Figma variable (`color/ui/text/hover`) with no prior code equivalent, so it was added as its own `text.*` leaf rather than reused from an existing token. `text.success`/`text.warning`/`text.danger` and `border.success`/`border.warning`/`border.danger` (added for the 2026-08-24 Help Text / Text Input pull) follow Figma's `color/ui/text/positive`/`color/ui/border/positive` etc. naming in spirit but were renamed to `success`/`danger` in code to match the existing `feedback.success`/`feedback.danger` vocabulary rather than introducing a parallel "positive"/"negative" taxonomy — see the per-component note below for exact ramp steps.
- **`action`/`feedback`** (role-based, ambiguous property) — get an explicit property segment (`background` or `foreground`, matching how the token is actually used today) and a `-hover`/`-active`/`-disabled`/`-subtle` suffix only when a non-default state/variant exists: `color-action-primary-background`, `color-action-primary-background-hover`, `color-action-primary-background-active`, `color-action-primary-background-disabled`, `color-action-primary-foreground`, `color-action-primary-foreground-disabled`, `color-action-secondary-foreground`, `color-action-secondary-background`, `color-action-secondary-background-hover`, `color-action-secondary-background-active`, `color-action-tertiary-foreground`, `color-action-tertiary-foreground-hover`, `color-action-tertiary-background`, `color-action-tertiary-background-hover`, `color-action-tertiary-background-active`, `color-action-destructive-background`, `color-action-destructive-background-hover`, `color-action-destructive-secondary-background`, `color-action-destructive-tertiary-foreground`, `color-action-toggle-unchecked-background`, `color-action-toggle-unchecked-background-hover`, `color-feedback-success-background`, `color-feedback-success-background-subtle`, `color-feedback-warning-background`, `color-feedback-warning-background-subtle`, `color-feedback-danger-background`, `color-feedback-danger-background-subtle`. `action.toggle-unchecked` (`color-action-toggle-unchecked-*`) is `toggle`'s off-state track color — a genuinely new role, not an alias of an existing `action.*` variant, so it got its own hyphenated variant name under the existing `action` category rather than a new top-level category; `background` flips by mode (light `gray.400`, dark `gray.800`), `background-hover` doesn't (`gray.600` both modes). `feedback.*.background-subtle` (added 2026-08-24, for Help Text's tinted pill background) is a literal 8-digit hex value (e.g. `#27B07040`), not a `{color.green.600}`-style alias — Style Dictionary has no alpha-blend function, and Figma authored these as a ramp step at reduced opacity rather than a new solid swatch, so the resolved hex (base color + alpha) is stored directly. Unlike every other feedback/action token, the base color itself sometimes differs between light and dark (`danger`: `red.600` light vs `red.500` dark) rather than just the alpha, so `background-subtle` is defined independently per mode rather than inheriting through the normal light-then-dark-override cascade.
- **`button`/`checkbox`/`toggle`/`radio`/`radio-group`/`help-text`/`text-input`** (and future components) — every color token gets both a property segment and an explicit state segment, even for the default case: `color-radio-group-label-foreground-default`, `color-button-primary-background-default`, `color-button-primary-background-hover`, `color-button-primary-background-active`, `color-button-primary-background-disabled`, `color-button-primary-foreground-default`, `color-button-primary-foreground-disabled`, `color-button-secondary-foreground-default`, `color-button-secondary-background-default`, `color-button-secondary-background-hover`, `color-button-secondary-background-active`, `color-button-secondary-border-default`, `color-button-tertiary-foreground-default`, `color-button-tertiary-foreground-hover`, `color-button-tertiary-background-default`, `color-button-tertiary-background-hover`, `color-button-tertiary-background-active`, `color-button-destructive-primary-background-default`, `color-button-destructive-secondary-background-default`, `color-button-destructive-tertiary-foreground-default`, `color-checkbox-unchecked-background-default`, `color-checkbox-unchecked-border-default`, `color-checkbox-checked-background-default`, `color-checkbox-checked-background-hover`, `color-checkbox-checked-border-default`, `color-checkbox-checked-foreground-default`, `color-checkbox-label-foreground-default`, `color-toggle-unchecked-background-default`, `color-toggle-unchecked-background-hover`, `color-toggle-unchecked-background-disabled`, `color-toggle-unchecked-border-default`, `color-toggle-unchecked-border-disabled`, `color-toggle-unchecked-foreground-default`, `color-toggle-unchecked-foreground-disabled`, `color-toggle-checked-background-default`, `color-toggle-checked-background-hover`, `color-toggle-checked-background-disabled`, `color-toggle-checked-border-default`, `color-toggle-checked-border-disabled`, `color-toggle-checked-foreground-default`, `color-radio-control-background-default`, `color-radio-control-border-default`, `color-radio-dot-foreground-default`, `color-radio-dot-foreground-hover`, `color-radio-label-unselected-foreground-default`, `color-radio-label-unselected-foreground-hover`, `color-radio-label-selected-foreground-default`, `color-radio-label-selected-foreground-hover`. `destructive-primary`/`destructive-secondary`/`destructive-tertiary` are themselves the `{variant}` segment for button (a hyphenated variant name, not an extra taxonomy level); `unchecked`/`checked`/`label` play the same role for checkbox, `unchecked`/`checked` for toggle, and `control`/`dot`/`label-unselected`/`label-selected` for radio — `label`/`label-unselected`/`label-selected` aren't really state-bearing "variants" the way `unchecked`/`checked`/`selected` are, but the taxonomy requires every top-level key under `color.{component}.*` to carry a property+state pair, so each was given one (`foreground.default`) rather than left as a bare leaf. `color-button-tertiary-background-default` resolves to `transparent`, a literal value rather than a `gray.*` reference — tertiary buttons have no background by default, only on hover/active. Radio's `control` variant (the outer ring) is identical across all four of Figma's variants (`Selected=False/True` × `State=Default/Hover`) — no hover or selected-state color change at all — so it only ever needed a single `default` state per property, unlike every other component here. `radio-group.label` (`color-radio-group-label-foreground-default`) is a trivial alias straight to `{color.text.primary}` — Figma's group-label text node uses the same `color/ui/text/primary` variable the individual radio's own label does, with no hover/selected variation of its own (the group label doesn't respond to which child is selected). `help-text`'s four variants are `default`/`success`/`warning`/`error` (matching Figma's own `Type` variant names exactly, including `error` rather than `danger` — the component-tier variant name mirrors Figma, while the semantic tokens it aliases underneath still use the codebase's existing `success`/`warning`/`danger` vocabulary): `color-help-text-default-foreground-default` (aliases `{color.text.primary}`), `color-help-text-success-background-default`/`color-help-text-success-foreground-default` (alias `{color.feedback.success.background-subtle}`/`{color.text.success}`), and the equivalent pair for `warning`/`error` (aliasing `warning`/`danger`). `text-input` similarly uses `default`/`success`/`warning`/`error` for its bordered field, plus two non-state-bearing variants for its own text: `label` (`color-text-input-label-foreground-default`) and `content` (`color-text-input-content-foreground-default`, the typed value's text color) — `content`, not `value`, because `value` collides with Style Dictionary's own reserved leaf-token key (`{ "value": "..." }`); a `color.text-input.value.*` branch was tried first and broke `component-schemas`' token-path resolution, which treats any object with a `value` property as a leaf. `text-input.success`/`warning`/`error` only define `border` (no `background` — the field's background stays `{color.surface.input}` in every state, matching Figma), while `text-input.default` defines both `background` and `border`. `text-input.required-marker` (`color-text-input-required-marker-foreground-default`, added 2026-08-24 for the `required` prop) is a sixth, non-state-bearing variant alongside `label`/`content` — it aliases `{color.text.danger}` directly rather than introducing a new semantic leaf, since a required-field asterisk is the same "danger" role the `error` state's border/help-text already use, just applied to a different property. Figma's Text Input component also has a `Focus` variant, but it isn't a `state` enum value in code — focus is a transient, browser-driven pseudo-state, not an author-set value, so it's handled in CSS (`:focus-within`) rather than as a fifth token-bearing variant; this also means a focused input keeps showing whichever validation-state border color is already active, a combination Figma's own variant set doesn't enumerate. Figma's own `Focus` variant renders as a thicker (2px vs 1px) same-color border, but code deliberately does NOT reproduce that by changing `border-width` on focus — even with `box-sizing: border-box`, a thicker border still eats into the field's padding/content box, so the label text and value visibly shift/"wiggle" by a pixel on focus/blur. Code instead adds a `text-input.focus.outline-color`/`-width`/`-offset` outline ring on `:focus-within` (aliasing the shared `color.border.focus` token, `1px`/`2px` — the exact same convention as `button-focus-outline-*`/`checkbox-focus-outline-*`/etc., see the next paragraph), since `outline` is drawn outside the box and never affects layout.

`text.disabled` (`color-text-disabled`) is a semantic leaf alongside `text.primary`/`text.secondary`/etc. — it flips by mode (light `gray.500`, dark `gray.700`) like the rest of `text.*`, so it's used for general disabled text, not for `color-button-primary-foreground-disabled`. That token instead comes from `action.primary.foreground-disabled` (`color-action-primary-foreground-disabled`, `gray.500` in both modes) — see the "buttons don't flip by theme" note in the [Color scale](#color-scale) section above for why the two diverged.

`npm run build -w packages/tokens` runs `scripts/validate-color-taxonomy.js` first and fails the build with a specific, per-token error if a new color token doesn't fit this shape (bare leaf where a property/state split is required, an unrecognized category, a stray `-default` suffix at the semantic tier, a missing `default` state at the component tier, etc.) — run `npm run validate-taxonomy -w packages/tokens` to check without doing a full build. Adding a genuinely new semantic category requires registering it as `SELF_EVIDENT_CATEGORIES` or `ROLE_BASED_CATEGORIES` in that script first (the validator treats an unregistered category as an error, not a silent pass).

For `button`/`checkbox`/`toggle`/`radio`/`radio-group` specifically, this means each component's token file nests its color tokens under a top-level `color.{component}.*` path (not `{component}.color.*`) so `color` sorts first in the output name. Each file keeps a separate, plain `{component}.*` top-level key for its non-color tokens — those are unaffected by this taxonomy and keep their existing flat names. `radio-group.gap` (`{spacing.200}`, 16px) matches Figma's single `itemSpacing` value on the group's vertical auto-layout frame, used uniformly for both the label-to-first-radio gap and every radio-to-radio gap (Figma authored it as one consistent spacing value, not two separate ones) — `radio-group.font-size` matches the individual radio's own label size (`{font.size.175}`), since Figma's group-label text node uses the identical style. `button-icon-only-padding` (`{spacing.125}`, 10px) sets equal padding on all sides of an icon-only button so it renders as a square, matching the button's regular height. `button-focus-outline-color`/`checkbox-focus-outline-color`/`toggle-focus-outline-color`/`radio-focus-outline-color`/`text-input-focus-outline-color` alias the shared `color.border.focus` semantic token; the paired `*-focus-outline-width` (`1px`) and `*-focus-outline-offset` (`2px`) are literal pixel values rather than scale references, matching the button's exact 2px-gap/1px-stroke focus ring as authored in Figma (a `strokeAlign: INSIDE` frame offset -2/-2, `cornerRadius` = radius + 2) — CSS reproduces this with `outline` + `outline-offset` on `:focus-visible` (`:focus-within` for `text-input`, since its focusable element is a native `<input>` nested inside the styled `.field` wrapper the ring actually needs to surround, not the field itself). None of the checkbox/toggle/radio/text-input focus rings are actually in Figma as a _ring_ (checkbox has 4 variants: `Checked` × `State=Default/Hover`; toggle has 6: `State=Default/Hover/Disabled` × `On=False/True`; radio has 4: `Selected=False/True` × `State=Default/Hover` — none include a focus state; text-input's Figma `Focus` variant exists but renders as a thicker border, not a ring — see the `text-input-border-width` note above) — all four were added/adapted in code for keyboard-accessibility parity with the button, reusing the same shared `border.focus` token rather than inventing a new color. `checkbox-size`/`radio-size` both alias `{sizing.250}` (20px) — neither is actually variable-bound in Figma (confirmed via `boundVariables`), so this is a deliberate engineering choice to reuse the sizing scale for two visually-identical 20px form controls, not a literal transcription of Figma. `toggle-width`/`toggle-height` (`40px`/`24px`) and `toggle-thumb-size-checked` (`18px`) are literal pixel values, not scale references — Figma's own `boundVariables` on the toggle track/thumb only bind padding/radius/fills/strokes, not width/height, so these were left as the unbound literals actually authored rather than force-fit onto scale steps that happen to match numerically (a mistake made once already with `checkbox-size`, which shipped pointing at the wrong scale step — see git history). `toggle-thumb-size-unchecked` (`{sizing.200}`, 16px) and `radio-dot-size` (`{sizing.150}`, 12px) _are_ explicitly variable-bound in Figma, so both alias the sizing scale like everything else. `toggle-padding-inline-unchecked`/`toggle-padding-inline-checked` (`{spacing.50}`/`{spacing.25}`, 4px/2px) are used via `calc()` to compute the thumb's absolutely-positioned `left`/`top` within the track (not flex `justify-content`, which isn't animatable and produced a visible jump on toggle — see git history) — Figma's own semantic spacing aliases (`spacing/compressed`, `spacing/25`) resolve to the same global steps, so code references the global scale directly per the established convention rather than pulling in that parallel semantic-spacing naming system. `toggle-thumb-shadow-color` (`{color.gray.600}`) is a direct global reference, not routed through a semantic tier — the component-tier color taxonomy only allows `background`/`foreground`/`border` as property names, and a decorative hover/on-state glow doesn't fit any of those, so it lives under the plain non-color `toggle.*` key instead (same treatment as the focus-outline tokens). `radio-gap` (`{spacing.50}`, 4px) matches `checkbox-gap` exactly (both derived from Figma's `Label` text node sitting 4px past the 20px control) — kept as a separate token per component rather than a shared one, consistent with every other component here having its own independent token set even where values coincide. `help-text-padding-block`/`help-text-padding-inline` (`{spacing.50}`/`{spacing.100}`, 4px/8px), `help-text-radius` (`{radius.medium}`, 8px), and `help-text-font-size` (`{font.size.150}`, 12px) all alias Figma's own `spacing/compressed`/`spacing/condensed`/`radius/medium`/`font-size/150` variables 1:1 (each resolves to the exact same px value as the matching global-scale step, so code references the global scale directly rather than the parallel semantic-spacing names, same convention as toggle's `calc()` tokens above). `text-input-height` (`{sizing.500}`, 40px), `text-input-padding-block`/`text-input-padding-inline` (`{spacing.50}`/`{spacing.200}`, 4px/16px), and `text-input-radius` (`{radius.medium}`, 8px) are the field's own box tokens, all variable-bound in Figma. `text-input-border-width` (`1px`) is a literal pixel value, not a scale reference — none of Figma's `Default`/`Success`/`Warning`/`Error`/`Focus` variants bind their border width to a Figma variable (a raw Tailwind `border`/`border-2` class in the reference code), matching the treatment already established for `toggle-width`/`toggle-height`; unlike Figma, code keeps this width constant across every state (see the "wiggle" note above) rather than also encoding Figma's 1px→2px `Focus` jump. `text-input-focus-outline-color`/`-width`/`-offset` alias the shared `color.border.focus`/`1px`/`2px` tokens — the same `*-focus-outline-*` convention `button`/`checkbox`/`toggle`/`radio` already use (see the next paragraph) — rather than Figma's own literal border-thickening, which was deliberately not reproduced (see the "wiggle" note above). `text-input-gap` (`{spacing.100}`, 8px) is the vertical gap between label/field/help-text, matching Figma's `gap-[var(--spacing/condensed,8px)]` on the outer flex column. `text-input-label-font-size`/`text-input-value-font-size` both alias `{font.size.175}` (14px) — the label is variable-bound in Figma; the typed value's font size is a raw `text-[14px]` in the reference code (not variable-bound), but 14px matches `font.size.175` exactly, so code aliases the scale rather than hardcoding a literal that happens to coincide, consistent with `checkbox-size`/`radio-size` above. `text-input-required-marker-gap` (`{spacing.25}`, 2px) is the gap between the label text and the `required` asterisk marker — a code-originated addition (the `required` prop, added ahead of a matching Figma component property), not pulled from Figma; `2px` was picked as the smallest step on the spacing scale, consistent with how a tight text-adjacent gap (vs. a layout gap like `text-input-gap`) is sized elsewhere in the system.

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
