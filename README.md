# wend-ui

Agnostic design system, organized as an npm workspaces monorepo.

## Packages

| Package                                                | Description                                                                                                                                                                                                               |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`packages/tokens`](packages/tokens)                   | Design tokens (`@devastudios/tokens`), authored as JSON and built with Style Dictionary into CSS, SCSS, and JS.                                                                                                           |
| [`packages/styles`](packages/styles)                   | Base CSS (`@devastudios/styles`) — reset and layout utilities built on top of the tokens.                                                                                                                                 |
| [`packages/web-components`](packages/web-components)   | Framework-agnostic web components (`@devastudios/web-components`), built with [Stencil](https://stenciljs.com/).                                                                                                          |
| [`packages/react`](packages/react)                     | React component wrappers (`@devastudios/react`), generated from `web-components` via Stencil's React output target.                                                                                                       |
| [`packages/design-sync-mcp`](packages/design-sync-mcp) | Local MCP server (`@devastudios/design-sync-mcp`) giving an AI agent live project context (tokens, component metadata) and Figma-diffing tools (`diff_tokens`, `diff_component`). Registered in [`.mcp.json`](.mcp.json). |

Dependency order: `tokens` → `styles` → `web-components` → `react`. `design-sync-mcp` consumes the tokens' Figma-flat JSON output but builds independently.

Tokens and components are pushed into Figma through Claude Code, using Figma's official Dev Mode MCP server's `use_figma` tool alongside `design-sync-mcp` — see [`packages/design-sync-mcp`](packages/design-sync-mcp) for how the two work together.

## Getting started

```sh
npm install
npm run build
```

`npm run build` builds each package in dependency order. To work on components with live reload:

```sh
npm run dev:components
```

## Storybook

Storybook covers both `@devastudios/web-components` (raw `<wend-button>` usage) and `@devastudios/react` (`<WendButton>` wrapper usage) from a single instance at the repo root:

```sh
npm run storybook        # dev server at http://localhost:6006
npm run build-storybook  # static build (storybook-static/)
```

Like `npm run dev:components`, both scripts import `@devastudios/styles`'s and `@devastudios/web-components`'s built output, which is gitignored and not checked in — run `npm run build` (or at least `packages/tokens`, `packages/styles`, `packages/web-components`, and `packages/react`) at least once on a fresh clone before running either script. Both scripts also rebuild `packages/web-components` and `packages/react` automatically before starting Storybook, so you don't need to re-run those two manually after the first `npm run build`.

## Code quality

ESLint (flat config, TypeScript- and React-aware) and Prettier run across the whole monorepo from the root:

```sh
npm run lint         # eslint .
npm run lint:fix     # eslint . --fix
npm run format       # prettier --write .
npm run format:check # prettier --check .
```

Both are configured to skip files Stencil generates (`packages/react/src/*.ts` except `index.ts`, `packages/web-components/src/components.d.ts`, component `readme.md` files) — those get overwritten on every `npm run build -w packages/web-components`, so linting/formatting them is pointless churn.
