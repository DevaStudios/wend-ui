# @devastudios/styles

Base CSS (reset + a handful of layout utilities) for the wend-ui design system, built on top of [`@devastudios/tokens`](../tokens). Also holds the source CSS for each web component, under `src/components/` — the single source of truth for a component's styles, even though it's [`@devastudios/web-components`](../web-components) that actually consumes and compiles it.

## Build

```sh
npm run build -w packages/styles
```

Two independent PostCSS passes (`postcss-import`, `autoprefixer`, `cssnano`):

- `src/index.css` (tokens + reset + base utilities) → `dist/index.css`
- each file in `src/components/*.css` → the matching file under `dist/components/`

## Usage

```css
@import '@devastudios/styles';
```

```css
@import '@devastudios/styles/components/wend-button.css';
```

This package is standalone-publishable — both exports above resolve to built `dist` output, so `@devastudios/styles` (and any one component's CSS) work as a plain dependency outside this monorepo, with no dependency on Stencil or `@devastudios/web-components`.

## Component CSS

`src/components/` is the single source of truth for each web component's stylesheet — [`@devastudios/web-components`](../web-components) doesn't keep its own copy. Its `styleUrl` points here via a relative path (e.g. `../../../../styles/src/components/wend-button.css`) rather than a package import, because Stencil's `styleUrl` only accepts relative filesystem paths, and it needs the raw _source_ CSS (not the `dist` build) to scope at compile time. The `dist/components/*.css` build output exists for everyone else — anything that isn't Stencil.
