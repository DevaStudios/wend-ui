# Red/green/amber full color ramp — design

## Purpose

`packages/tokens/tokens/global/color.json`'s `red`, `green`, and `amber` ramps currently have only two steps each (`500`/`600`), used exclusively as `feedback.danger`/`success`/`warning` anchors. `gray` is the only ramp with a full scale (14 steps, `25`→`1000`). This spec expands `red`/`green`/`amber` to a full 10-step scale (`50`→`900`), giving the design system room for future feedback-related UI (badges, alert intensities, etc.) beyond a single background color per category — though adding that UI is explicitly out of scope here.

## Goals

- Expand `red`, `green`, `amber` from 2 steps each to a shared 10-step scale: `50, 100, 200, 300, 400, 500, 600, 700, 800, 900`.
- Keep each ramp's character recognizable — the new `500`/`600` should read as "the same red/green/amber" as today, not a hue shift.
- Every step must be genuinely visually distinct from its neighbors (same bar as the gray-ramp fix — no adjacent steps collapsing to the same hex at 8-bit precision).

## Non-goals

- No new semantic tokens (no `-subtle`, `-border`, `-text` variants). `feedback.success/warning/danger.background` are the only consumers today and stay exactly as they are structurally.
- No change to `gray`.
- No change to which step `feedback.*.background` aliases (`.500` for warning, `.600`/`.500` light/dark for success/danger) — only the hex values those steps resolve to change.
- No renaming — user confirmed `amber` stays `amber` (a request to call it "yellow" was about describing the hue, not renaming the token).

## Methodology

Generated in HSL (matching how the existing `gray` ramp was hand-tuned — no OKLCH or other perceptual color space, consistent with the rest of this codebase):

- **Hue** fixed per color, calibrated from the current `500`/`600` anchors: red ≈ 6°, green ≈ 152°, amber ≈ 38°.
- **Lightness** follows one shared 10-step curve across all three ramps: `96, 91, 83, 72, 61, 51, 42, 34, 27, 20` (%) for steps `50`→`900`.
- **Saturation** is per-hue, tapering at both extremes (lighter pastels and darker shades desaturate slightly for legibility/softness), peaking through the `300`–`600` midtones.

Recomputing was explicitly approved to shift `500`/`600` slightly if it improves ramp consistency (rather than pinning the whole curve to the exact old anchor hexes).

## Values

| Step | Red | Green | Amber |
| --- | --- | --- | --- |
| `50` | `#FAF0EF` | `#F0F9F5` | `#FBF6EF` |
| `100` | `#F7DCD9` | `#DBF5E9` | `#F9EDD7` |
| `200` | `#F3BBB4` | `#BAEED5` | `#F8DDAF` |
| `300` | `#EE8C81` | `#8AE5BB` | `#F9C976` |
| `400` | `#E95D4E` | `#5ADDA0` | `#FBB53C` |
| `500` | `#E43421` | `#30D588` | `#FDA308` |
| `600` | `#BB2B1B` | `#27B070` | `#D18605` |
| `700` | `#93261A` | `#238B5A` | `#A36B0A` |
| `800` | `#702219` | `#206A47` | `#7B530F` |
| `900` | `#4F1D17` | `#1C4A35` | `#543C12` |

Old anchors for comparison (character preserved, slightly more vivid): red `500` `#E4483A`→`#E43421`, `600` `#C0392B`→`#BB2B1B`; green `500` `#29B377`→`#30D588`, `600` `#1E8E5A`→`#27B070`; amber `500` `#F5A623`→`#FDA308`, `600` `#C97F00`→`#D18605`.

## Scope of changes

- `packages/tokens/tokens/global/color.json` — replace each 2-step ramp with the full 10-step ramp above.
- `packages/tokens/tokens/semantic/color.json` / `color.dark.json` — no edits needed; `feedback.success/warning/danger.background` already reference `{color.red.600}` etc. by step key, so they pick up the new hex values automatically through the existing alias chain.
- `packages/tokens/README.md` — add a color-scale table for red/green/amber alongside the existing gray table (per the project's documentation-step workflow: docs get updated once a token change is confirmed).
- No component CSS or props change (no new semantic tokens).

## Verification plan

- `npm run build -w packages/tokens` succeeds, taxonomy validator unaffected (only leaf primitive values + new steps, no new categories).
- Confirm `feedback-success/warning/danger-background` CSS custom properties resolve to the new `500`/`600` hex values (light and dark).
- Visually confirm in the Storybook/dev-server preview (`components.html`) that any success/warning/danger UI still reads correctly — no regression from the anchor shift.
- Figma: per the project's sync-direction workflow, ask before pushing — do not assume code should push to Figma without confirming.
