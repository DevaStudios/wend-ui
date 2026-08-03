# Gray ramp spacing fix — design

## Purpose

Follow-up to [2026-08-03-monochrome-palette-design.md](2026-08-03-monochrome-palette-design.md) (already implemented and shipped). After using the monochrome palette, the `gray` ramp's step values turned out too tightly clustered at both ends: the six lightest steps (`25`–`500`) span only ~14 percentage points of relative luminance, and the three darkest steps (`900`/`925`/`950`) are nearly indistinguishable (a 0.66-point luminance gap between `900` and `925`). This spec corrects the ramp's *values* only — no architecture, naming, semantic mapping, or Figma structure changes.

## Goals

- Meaningfully increase the visual gap between `50`↔`100`↔`200`↔`300` (light end) and between `800`↔`900`↔`950` (dark end) — the two clusters flagged as too tight.
- Keep `gray-25` = pure white (`#FFFFFF`) and `gray-950` = pure black (`#000000`) as before.
- Keep `gray-50` visually near-white — it's the default canvas/card surface color, and a fully evenly-redistributed ramp (tried and rejected during design) made it read as visibly gray instead.
- Every one of the 16 named steps must resolve to a genuinely distinct hex value — no two adjacent steps may round to the same color at 8-bit sRGB precision (this was an actual failure mode hit during design: naive even-spacing of OKLab lightness near black collapsed `925` and `950` to the same `#000000`).

## Non-goals

- Renaming or restructuring the ramp's 16 step names — unchanged from the original spec.
- Changing the semantic mapping (which step each `color.action.*`/`color.text.*`/etc. token aliases) — unchanged.
- Perfectly equalizing every adjacent gap across the whole ramp. Very close to pure black, 8-bit sRGB has real, physical resolution limits — `900`/`925`/`950` will always be closer to each other than steps further from the extremes are, no matter how the values are chosen. The goal is genuinely distinguishable steps with much bigger gaps than today, not mathematically identical deltas.
- Touching `amber`/`green`/`red` — unaffected by this fix.

## Values

Computed in OKLCH (hue ≈ 85°, a small constant chroma of 0.006 for warmth, dropping to 0 only at the two pure endpoints), with light-end and dark-end lightness targets chosen by hand to hit the goals above rather than a single continuous formula — a naive evenly-spaced curve was tried first and rejected (see Non-goals) because 8-bit rounding near black collapses steps that are too close together in raw lightness terms.

| Step | Old hex | New hex |
| --- | --- | --- |
| `25` | `#FFFFFF` | `#FFFFFF` (unchanged) |
| `50` | `#FAFAF9` | `#FCFAF6` |
| `100` | `#F9F8F7` | `#E6E4E0` |
| `200` | `#F6F6F3` | `#C9C7C3` |
| `300` | `#F4F3EF` | `#A9A7A3` |
| `400` | `#F1F0EB` | `#8C8A87` |
| `500` | `#F0EEE9` | `#73716E` |
| `600` | `#DCDAD5` | `#5E5C58` |
| `650` | `#CCCCCC` | `#4D4B48` |
| `675` | `#B2B2B2` | `#3D3C38` |
| `700` | `#AFADAA` | `#2F2E2A` |
| `800` | `#787774` | `#252421` |
| `850` | `#4D4D4D` | `#211F1C` |
| `900` | `#393837` | `#151411` |
| `925` | `#333333` | `#0A0907` |
| `950` | `#000000` | `#000000` (unchanged) |

Note the ordering by lightness is unchanged (same 16 names, same relative position), so no semantic token needs to change which step it aliases — only `packages/tokens/tokens/global/color.json`'s leaf values change. Every downstream artifact (semantic tokens, component tokens, CSS, Figma) picks up the new colors automatically through the existing alias chain, exactly the same mechanism that made the original palette swap propagate cleanly.

`650`/`675`/`850`/`925` (the button hover/default states) get new values as a side effect of this fix, since they sit in the same clusters being corrected. This was confirmed acceptable during design — the button's exact look was already approved once during the original palette work, but "the whole ramp reads as one coherent scale" was judged more important than preserving those four exact values unchanged.

**Correction made during implementation:** the `800`/`850`/`900`/`925` values above were revised once from an initial pass. The first computed set (`800`=`#1C1A17`, `850`=`#0E0D0A`, `900`=`#040403`, `925`=`#010000`) still left `925` and `950` only 1 unit apart in the red channel (`#010000` vs `#000000`) — nearly indistinguishable, which matters a lot here since `gray-925`/`gray-950` are exactly the light-mode primary button's default and active/pressed states, shown in direct sequence on the same element. The values in the table are the corrected version, reprioritized so the three states actually used in a button's interaction sequence — `850` (hover), `925` (default), `950` (active) — get strong mutual separation, even at the cost of `800`/`900` (general-purpose steps not shown side-by-side with anything) sitting a little closer to their neighbors than an evenly-spaced ideal would give them.

## Verification plan

Same shape as the original palette spec's verification plan:
- `npm run build -w packages/tokens` succeeds, taxonomy validator unaffected (only leaf values change).
- Visually confirm in Storybook: canvas/card still read as near-white in light mode, primary button still renders with three genuinely distinct default/hover/active shades (not just "technically different" — actually visually distinguishable), same check for dark mode's inverted button.
- Figma: repoint the 16 `gray-*` global variables to the new hex values (same variable names/IDs, no structural change — unlike the original spec, this does not require deleting/recreating variables, just updating each one's value for its single `Value` mode), then `diff_tokens` shows no drift.
