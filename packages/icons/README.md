# @wend-ui/icons

A curated set of outline SVG icons for the wend-ui design system — common UI actions, objects, and layout glyphs (arrows, files, folders, AI-action icons, and similar).

## Build

```sh
npm run build -w packages/icons
```

Copies every file in `src/svg/*.svg` into `dist/svg/`, and writes `dist/manifest.json` — a flat list of icon names (no `wend-icon-` prefix or `.svg` extension), derived from the file listing.

## Usage

Every icon file is named `wend-icon-<name>.svg`:

```js
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const manifest = require('@wend-ui/icons');
// { "icons": ["add", "add-circle", "admin", ...] }
```

```html
<img src="node_modules/@wend-ui/icons/dist/svg/wend-icon-add.svg" alt="" />
```

Icons ship as `<svg fill="none">` with each `<path>`'s `fill` left unset in the raw `.svg` files — set `fill` (or `color` + `fill: currentColor` in your own wrapper) where you consume them directly.

### Inline rendering (`svg-strings` + `get-icon-svg`)

For consumers that render icons as inline SVG (so they can be recolored via CSS `currentColor`), `dist/svg-strings.json` provides a name → markup map with empty fills already normalized to `fill="currentColor"`, and `get-icon-svg` resolves a name to markup with a given size/color:

```js
import svgStrings from '@wend-ui/icons/svg-strings';
import { getIconSvg } from '@wend-ui/icons/get-icon-svg';

getIconSvg(svgStrings, 'add', { size: '20px', color: '#bb2b1b' });
// '<svg width="20px" height="20px" fill="none"><path ... fill="#bb2b1b"/></svg>'

getIconSvg(svgStrings, 'add');
// size defaults to '1em', color defaults to 'currentColor' (no string replacement needed for the default)
```

This is what `@wend-ui/web-components`' `<wend-icon>` component uses internally.

## Adding new icons

1. Copy the new SVG(s) into `src/svg/`, renamed to the `wend-icon-` prefix, art unchanged.
2. Run `npm run build -w packages/icons` to regenerate `dist/svg/` and `dist/manifest.json`.

## Status

Not yet published — excluded from this monorepo's changesets release group (`.changeset/config.json`'s `ignore` array) pending confirmation that this icon set is clear for public distribution.
