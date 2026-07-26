# Storybook Setup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a single, unified Storybook instance covering both `@wend-ui/web-components` (raw custom element usage) and `@wend-ui/react` (React wrapper usage), runnable and deployable from the project root as one view.

**Architecture:** One Storybook instance using `@storybook/react-vite` as the sole framework (React renders both the raw `<wend-button>` custom element and the `<WendButton>` wrapper). Config lives at the repo root in `.storybook/`; stories live in a `stories/` directory sibling to `src/` in each package, never inside it, to avoid colliding with each package's own build tooling (Stencil compiles everything under `packages/web-components/src/` with its own JSX pragma; `packages/react/src/` is regenerated wholesale by Stencil's React output target on every build).

**Tech Stack:** Storybook 10.5.3, `@storybook/react-vite`, `@storybook/addon-a11y`, Vite 6.4.x, `@vitejs/plugin-react` 4.5.x, React 18.3.1, TypeScript 5.5.x.

## Global Constraints

- Node floor is 18 (`.nvmrc`, `package.json` `engines.node: >=18`) — every new dependency version must support Node 18. This ruled out `vite@8.x` (requires Node `^20.19.0 || >=22.12.0`) and `@vitejs/plugin-react@5.x`/`6.x` (same Node floor) — use `vite@^6.4.3` and `@vitejs/plugin-react@^4.5.1` instead, both of which support Node 18 and are still within `@storybook/react-vite@10.5.3`'s peer range (`vite: ^5.0.0 || ^6.0.0 || ^7.0.0 || ^8.0.0`).
- `typescript-eslint@8.63.0` (already pinned in this repo) requires `typescript: >=4.8.4 <6.1.0` — do not install a `typescript` version at or above 6.1.0 (the npm "latest" tag currently resolves to 7.x, which is incompatible). Use `^5.5.4`, matching `packages/react`'s existing pin; this repo's node_modules already has `typescript@5.9.3` hoisted, which satisfies both ranges.
- Stories must live in a `stories/` directory sibling to each package's `src/`, never inside it.
- CI must not add a second GitHub Pages site — Storybook's static output nests under the existing docs-site Pages deploy in [deploy-docs.yml](../../../.github/workflows/deploy-docs.yml), at a `/storybook/` subpath.
- `@wend-ui/web-components`'s default `.` export (`dist/index.js`) does **not** auto-register custom elements — it's Stencil's "collection" format, inert on its own. Custom element registration must go through the `/loader` subpath export (`import { defineCustomElements } from '@wend-ui/web-components/loader'; defineCustomElements();`), Stencil's documented vanilla-JS integration point.
- `@wend-ui/styles`'s package.json `exports` map only declares `"."` and `"./components/*.css"` — there is no `"./dist/index.css"` export key, so `import '@wend-ui/styles/dist/index.css'` would fail under strict `exports` resolution. Import the bare specifier `@wend-ui/styles` instead (resolves via `"."` to the same file).

---

## Task 1: Install and pin the Storybook toolchain

**Files:**
- Modify: `package.json` (root)

**Interfaces:**
- Produces: root devDependencies `storybook@^10.5.3`, `@storybook/react-vite@^10.5.3`, `@storybook/addon-a11y@^10.5.3`, `vite@^6.4.3`, `@vitejs/plugin-react@^4.5.1`, `react@^18.3.1`, `react-dom@^18.3.1`, `@types/react@^18.3.3`, `@types/react-dom@^18.3.0`, `typescript@^5.5.4` — later tasks rely on all of these being installed and resolvable from the repo root.

- [ ] **Step 1: Add the new devDependencies to root `package.json`**

Open `package.json` at the repo root and add these entries to the existing `devDependencies` object (alongside `@changesets/cli`, `eslint`, etc. — keep the existing entries, just add these):

```json
"@storybook/addon-a11y": "^10.5.3",
"@storybook/react-vite": "^10.5.3",
"@types/react": "^18.3.3",
"@types/react-dom": "^18.3.0",
"@vitejs/plugin-react": "^4.5.1",
"react": "^18.3.1",
"react-dom": "^18.3.1",
"storybook": "^10.5.3",
"typescript": "^5.5.4",
"vite": "^6.4.3"
```

- [ ] **Step 2: Install**

Run: `npm install`
Expected: installs without an `ERESOLVE` peer-dependency error and without any `EBADENGINE` warning mentioning Node version.

- [ ] **Step 3: Verify the resolved versions satisfy every peer range**

Run:
```bash
node -e "
const vite = require('./node_modules/vite/package.json').version;
const pluginReact = require('./node_modules/@vitejs/plugin-react/package.json').version;
const ts = require('./node_modules/typescript/package.json').version;
const sb = require('./node_modules/storybook/package.json').version;
console.log({ vite, pluginReact, ts, sb });
"
```
Expected output resembles: `{ vite: '6.4.x', pluginReact: '4.5.x', ts: '5.x.x' (< 6.1.0), sb: '10.5.3' }` — no version at or above the excluded ranges from the Global Constraints section.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "Add Storybook toolchain dependencies"
```

---

## Task 2: Root Storybook config

**Files:**
- Create: `.storybook/main.ts`
- Create: `.storybook/preview.ts`
- Create: `.storybook/preview-head.html`
- Modify: `eslint.config.js`
- Modify: `.gitignore`

**Interfaces:**
- Consumes: devDependencies from Task 1.
- Produces: a working (initially story-less) Storybook dev server on port 6006. Later tasks add stories matched by the glob defined here (`packages/*/stories/**/*.stories.@(ts|tsx)`).

- [ ] **Step 1: Create `.storybook/main.ts`**

```ts
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../packages/*/stories/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-a11y'],
  framework: {
    name: '@storybook/react-vite',
    options: {}
  }
};

export default config;
```

- [ ] **Step 2: Create `.storybook/preview.ts`**

This registers `<wend-button>` as a real custom element (via the `/loader` subpath — the bare `@wend-ui/web-components` import does *not* do this, see Global Constraints) and loads the design system's CSS so token-driven colors resolve.

```ts
import type { Preview } from '@storybook/react-vite';
import { defineCustomElements } from '@wend-ui/web-components/loader';
import '@wend-ui/styles';

defineCustomElements();

const preview: Preview = {};

export default preview;
```

- [ ] **Step 3: Create `.storybook/preview-head.html`**

Copied from `packages/web-components/src/index.html`'s `<head>` — loads the Funnel Sans font so `font-family-base` renders correctly instead of falling back to generic sans-serif.

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=Funnel+Sans:wght@300;400;500;600;700;800&display=swap"
/>
```

- [ ] **Step 4: Register `.storybook/*.ts` in ESLint's `allowDefaultProject`**

Open `eslint.config.js`. Find this block (currently only listing `stencil.config.ts`):

```js
        projectService: {
          // Root-level tooling configs (e.g. stencil.config.ts) that live outside
          // their package's `rootDir` and so aren't part of any real tsconfig project.
          allowDefaultProject: ['packages/web-components/stencil.config.ts']
        },
```

Replace it with:

```js
        projectService: {
          // Root-level tooling configs (e.g. stencil.config.ts) that live outside
          // their package's `rootDir` and so aren't part of any real tsconfig project.
          allowDefaultProject: [
            'packages/web-components/stencil.config.ts',
            '.storybook/main.ts',
            '.storybook/preview.ts'
          ]
        },
```

- [ ] **Step 5: Run lint to confirm the new config files don't error**

Run: `npm run lint`
Expected: no errors mentioning `.storybook/main.ts` or `.storybook/preview.ts` (e.g. no "was not found by the project service" error). Pre-existing lint state elsewhere in the repo is out of scope for this check.

- [ ] **Step 6: Add `storybook-static` to `.gitignore`**

Open `.gitignore`, and under the `# wend-ui package build output` section (near `packages/react/dist`), add:

```
storybook-static
```

(This is Storybook's default local build output directory when `storybook build` is run without an explicit `-o`. The CI build in Task 6 targets a different, already-ignored path — `packages/web-components/www/storybook` — so this entry only matters for local `npm run build-storybook` runs.)

- [ ] **Step 7: Verify the dev server boots**

Storybook needs the compiled `@wend-ui/web-components` and `@wend-ui/react` output to exist (Task 2's `preview.ts` imports from `@wend-ui/web-components/loader`, which only exists after that package is built). Build both, then start Storybook in the background and confirm it responds:

```bash
npm run build -w packages/web-components
npm run build -w packages/react
npx storybook dev -p 6006 --ci &
SB_PID=$!
sleep 8
curl -sf -o /dev/null -w "%{http_code}\n" http://localhost:6006
kill $SB_PID
```

Expected: prints `200`. The sidebar will show no stories yet (Task 3/4 add them) — that's expected at this point; a `200` response confirms the config itself is valid and the server starts.

- [ ] **Step 8: Commit**

```bash
git add .storybook eslint.config.js .gitignore
git commit -m "Add root Storybook configuration"
```

---

## Task 3: Web-components Button story

**Files:**
- Create: `packages/web-components/stories/tsconfig.json`
- Create: `packages/web-components/stories/wend-button.stories.tsx`

**Interfaces:**
- Consumes: `.storybook/main.ts`'s stories glob (Task 2); the built `wend-button` custom element registered by `preview.ts`.
- Produces: a "Web Components/Button" section in the Storybook sidebar with 3 stories (`Primary`, `Secondary`, `Disabled`).

- [ ] **Step 1: Create `packages/web-components/stories/tsconfig.json`**

A standalone project file (not extending the package's own `tsconfig.json`, which sets Stencil's `jsxFactory: "h"` — wrong pragma for these files) so ESLint's `projectService` and any editor tooling can type-check this directory as real React/JSX code.

```json
{
  "compilerOptions": {
    "target": "es2019",
    "lib": ["dom", "es2019"],
    "module": "esnext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "noEmit": true
  },
  "include": ["."]
}
```

- [ ] **Step 2: Create `packages/web-components/stories/wend-button.stories.tsx`**

TypeScript's JSX checker doesn't know about the `wend-button` custom element by default, so this declares it. `argTypes` are hand-written here — a raw custom element has no TS component for docgen to introspect (see the design spec's "Story content & docgen strategy" section).

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'wend-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        variant?: 'primary' | 'secondary';
        disabled?: boolean;
      };
    }
  }
}

interface WendButtonArgs {
  label: string;
  variant: 'primary' | 'secondary';
  disabled: boolean;
}

const meta: Meta<WendButtonArgs> = {
  title: 'Web Components/Button',
  render: (args) => (
    <wend-button variant={args.variant} disabled={args.disabled}>
      {args.label}
    </wend-button>
  ),
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary'] },
    disabled: { control: 'boolean' },
    label: { control: 'text' }
  },
  args: {
    label: 'Button',
    variant: 'primary',
    disabled: false
  }
};

export default meta;
type Story = StoryObj<WendButtonArgs>;

export const Primary: Story = {
  args: { label: 'Primary button', variant: 'primary' }
};

export const Secondary: Story = {
  args: { label: 'Secondary button', variant: 'secondary' }
};

export const Disabled: Story = {
  args: { label: 'Disabled button', variant: 'primary', disabled: true }
};
```

- [ ] **Step 3: Broaden the ESLint react-plugin block to cover this new JSX file**

Open `eslint.config.js`. Find:

```js
  {
    files: ['packages/react/**/*.{ts,tsx}'],
    plugins: { react, 'react-hooks': reactHooks },
```

Change the `files` array to also match the new stories directory:

```js
  {
    files: ['packages/react/**/*.{ts,tsx}', 'packages/web-components/stories/**/*.{ts,tsx}'],
    plugins: { react, 'react-hooks': reactHooks },
```

- [ ] **Step 4: Lint**

Run: `npm run lint`
Expected: no errors in `packages/web-components/stories/wend-button.stories.tsx`.

- [ ] **Step 5: Start Storybook and verify the story renders**

```bash
npm run build -w packages/web-components
npm run build -w packages/react
npx storybook dev -p 6006 --ci &
SB_PID=$!
sleep 8
```

With the dev server running, use the Browser pane: navigate to `http://localhost:6006/?path=/story/web-components-button--primary`, take a screenshot, and confirm:
- A dark navy button labeled "Primary button" renders (matches `--color-button-primary-background-default` / `#17184b`).
- The Controls addon panel lists `label`, `variant`, `disabled`.
- Switching to the `Secondary` and `Disabled` stories (via the sidebar) renders the outlined and greyed-out variants respectively, matching what's already on `components.html`.
- The Accessibility addon panel shows 0 violations for the `Primary` story.

Then stop the server:
```bash
kill $SB_PID
```

- [ ] **Step 6: Commit**

```bash
git add packages/web-components/stories eslint.config.js
git commit -m "Add Storybook story for the wend-button custom element"
```

---

## Task 4: React Button story

**Files:**
- Create: `packages/react/stories/tsconfig.json`
- Create: `packages/react/stories/wend-button.stories.tsx`

**Interfaces:**
- Consumes: `.storybook/main.ts`'s stories glob (Task 2); `WendButton` from `@wend-ui/react` (`packages/react/src/index.ts`).
- Produces: a "React/Button" section in the Storybook sidebar with 3 stories (`Primary`, `Secondary`, `Disabled`).

- [ ] **Step 1: Create `packages/react/stories/tsconfig.json`**

Same shape as the web-components one — a standalone project so this directory (sibling to `packages/react/src/`, which is regenerated wholesale by Stencil's React output target) has its own type-checking scope.

```json
{
  "compilerOptions": {
    "target": "es2019",
    "lib": ["dom", "es2019"],
    "module": "esnext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "noEmit": true
  },
  "include": ["."]
}
```

- [ ] **Step 2: Create `packages/react/stories/wend-button.stories.tsx`**

`WendButton`'s exported type is `StencilReactComponent<WendButtonElement, WendButtonEvents, Components.WendButton>` (a generic factory-produced type, not a plain `React.FC<Props>`) — write the story with `component: WendButton` and no `argTypes` first; Step 4 below is a real, objective check for whether Storybook's docgen resolved through that generic, with a concrete fallback if it didn't.

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { WendButton } from '../src';

const meta: Meta<typeof WendButton> = {
  title: 'React/Button',
  component: WendButton,
  args: {
    children: 'Button',
    variant: 'primary',
    disabled: false
  }
};

export default meta;
type Story = StoryObj<typeof WendButton>;

export const Primary: Story = {
  args: { children: 'Primary button', variant: 'primary' }
};

export const Secondary: Story = {
  args: { children: 'Secondary button', variant: 'secondary' }
};

export const Disabled: Story = {
  args: { children: 'Disabled button', variant: 'primary', disabled: true }
};
```

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: no errors in `packages/react/stories/wend-button.stories.tsx` (this file is already covered by the existing `files: ['packages/react/**/*.{ts,tsx}']` ESLint block — no config change needed here).

- [ ] **Step 4: Start Storybook and check whether autodocs resolved `variant`/`disabled` automatically**

```bash
npm run build -w packages/web-components
npm run build -w packages/react
npx storybook dev -p 6006 --ci &
SB_PID=$!
sleep 8
```

Use the Browser pane: navigate to `http://localhost:6006/?path=/story/react-button--primary`, take a screenshot, and check the Controls addon panel.

- **If `variant` and `disabled` both appear as controls** (select and boolean respectively): docgen resolved correctly through the generic type. No further action — stop the server (`kill $SB_PID`) and go to Step 6.
- **If they do not appear** (empty or incomplete Controls table): docgen could not introspect the generic factory type. Apply the fallback in Step 5 below, then re-verify.

- [ ] **Step 5 (fallback, only if Step 4's check failed): add explicit `argTypes`**

Edit `packages/react/stories/wend-button.stories.tsx`, replacing the `meta` object with:

```tsx
const meta: Meta<typeof WendButton> = {
  title: 'React/Button',
  component: WendButton,
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary'] },
    disabled: { control: 'boolean' },
    children: { control: 'text' }
  },
  args: {
    children: 'Button',
    variant: 'primary',
    disabled: false
  }
};
```

Restart Storybook the same way as Step 4 and confirm the Controls panel now lists `variant`, `disabled`, `children`. Stop the server when confirmed.

- [ ] **Step 6: Commit**

```bash
git add packages/react/stories
git commit -m "Add Storybook story for the WendButton React wrapper"
```

---

## Task 5: Root dev/build scripts

**Files:**
- Modify: `package.json` (root)

**Interfaces:**
- Consumes: `.storybook/` config (Task 2), stories (Tasks 3–4).
- Produces: `npm run storybook` and `npm run build-storybook` from the repo root — later used directly by Task 6's CI step.

- [ ] **Step 1: Add the two scripts**

Open root `package.json`. In the `scripts` object, add (alongside the existing `dev:components`, `build`, etc.):

```json
"storybook": "npm run build -w packages/web-components && npm run build -w packages/react && storybook dev -p 6006",
"build-storybook": "npm run build -w packages/web-components && npm run build -w packages/react && storybook build"
```

- [ ] **Step 2: Verify the dev script**

Run: `npm run storybook &` then, after a few seconds, `curl -sf -o /dev/null -w "%{http_code}\n" http://localhost:6006`, then stop it (`kill %1` or find and kill the PID).
Expected: `200`, and both "Web Components/Button" and "React/Button" appear if you check the sidebar via the Browser pane (same check as Tasks 3–4, now via the real root script instead of the raw `npx storybook` invocation used during those tasks).

- [ ] **Step 3: Verify the static build script**

Run: `npm run build-storybook`
Expected: completes without error, producing a `storybook-static/` directory at the repo root containing `index.html`.

- [ ] **Step 4: Commit**

```bash
git add package.json
git commit -m "Add root storybook and build-storybook scripts"
```

---

## Task 6: Deploy Storybook alongside the docs site

**Files:**
- Modify: `.github/workflows/deploy-docs.yml`

**Interfaces:**
- Consumes: `npm run build-storybook` (Task 5).
- Produces: `<pages-url>/storybook/` alongside the existing docs site at the Pages root, in the same deploy.

- [ ] **Step 1: Extend the workflow's `build` job**

Open `.github/workflows/deploy-docs.yml`. It currently reads:

```yaml
      - run: npm run build -w packages/tokens
      - run: npm run build -w packages/styles
      - run: npm run build -w packages/web-components

      - uses: actions/configure-pages@v5

      - uses: actions/upload-pages-artifact@v3
        with:
          path: packages/web-components/www
```

Change it to:

```yaml
      - run: npm run build -w packages/tokens
      - run: npm run build -w packages/styles
      - run: npm run build -w packages/web-components
      - run: npm run build -w packages/react
      - run: npm run build-storybook -- -o packages/web-components/www/storybook

      - uses: actions/configure-pages@v5

      - uses: actions/upload-pages-artifact@v3
        with:
          path: packages/web-components/www
```

(`npm run build-storybook -- -o ...` overrides the script's default output location for this one invocation; the script itself already rebuilds `web-components`/`react` first, so those two explicit `run` lines above it are redundant but harmless — kept for readability of the CI log. If you'd rather avoid the redundant rebuild, replace the `build-storybook` line with `storybook build -o packages/web-components/www/storybook` directly instead of going through the npm script.)

- [ ] **Step 2: Verify the nested output locally**

Since this workflow only runs on push to `main`, verify the artifact structure locally instead of by pushing:

```bash
rm -rf packages/web-components/www
npm run build -w packages/web-components
npm run build -w packages/react
npm run build-storybook -- -o packages/web-components/www/storybook
ls packages/web-components/www
ls packages/web-components/www/storybook
```

Expected: the first `ls` shows the existing docs site files (`index.html`, `components.html`, `build/`, etc.) **and** a `storybook/` directory; the second `ls` shows Storybook's static build output (`index.html`, `assets/`, etc.) inside it.

- [ ] **Step 3: Verify the subpath actually resolves (not just that the files exist)**

```bash
cd packages/web-components/www
python3 -m http.server 8080 &
HTTP_PID=$!
sleep 2
curl -sf -o /dev/null -w "%{http_code}\n" http://localhost:8080/storybook/index.html
kill $HTTP_PID
cd -
```

Expected: `200`. Then use the Browser pane to navigate to `http://localhost:8080/storybook/index.html` directly (not through Storybook's own dev server — this simulates exactly how GitHub Pages will serve it), confirm the Storybook UI loads with both story groups and doesn't 404 on any asset (check `read_network_requests` for any 404s from the `/storybook/` path).

- [ ] **Step 4: Clean up the local build artifacts**

```bash
rm -rf packages/web-components/www storybook-static
```

(These are already gitignored — this just avoids leaving a stale local build around after verification.)

- [ ] **Step 5: Commit**

```bash
git add .github/workflows/deploy-docs.yml
git commit -m "Deploy Storybook alongside the docs site on GitHub Pages"
```

---

## Self-Review Notes

- **Spec coverage:** Architecture (Task 2), file layout (Tasks 2–4), story content/docgen strategy incl. the fallback (Task 4), global setup incl. font loading (Task 2), addons (Tasks 1–2), scripts (Task 5), CI/deploy (Task 6) — every section of the design spec has a corresponding task.
- **Corrections made against the spec during planning** (verified against real npm registry data and this repo's actual build output, not assumed): the spec's `import '@wend-ui/web-components'` assumption was wrong (doesn't auto-register elements; fixed to use the `/loader` subpath) and `import '@wend-ui/styles/dist/index.css'` would have failed under the package's actual `exports` map (fixed to bare `@wend-ui/styles`). Also added the Node-18-compatible dependency pins, which the spec correctly deferred to implementation time.
- **Placeholder scan:** no TBD/TODO; the one open-ended item (react-vite docgen resolving through `WendButton`'s generic type) has a concrete, objectively-checkable test and a complete fallback code block, not a vague instruction.
- **Type consistency:** `WendButtonArgs` (Task 3) and the `Meta<typeof WendButton>` (Task 4) both use `variant: 'primary' | 'secondary'` matching `WendButtonVariant` from `packages/web-components/src/components/wend-button/wend-button.tsx`; story names (`Primary`/`Secondary`/`Disabled`) are consistent across both tasks.
