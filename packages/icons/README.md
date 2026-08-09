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

Icons ship as `<svg fill="none">` with each `<path>`'s `fill` left unset — set `fill` (or `color` + `fill: currentColor` in your own wrapper) where you consume the icon.

## Adding new icons

1. Copy the new SVG(s) into `src/svg/`, renamed to the `wend-icon-` prefix, art unchanged.
2. Run `npm run build -w packages/icons` to regenerate `dist/svg/` and `dist/manifest.json`.

## Status

Not yet published — excluded from this monorepo's changesets release group (`.changeset/config.json`'s `ignore` array) pending confirmation that this icon set is clear for public distribution.
