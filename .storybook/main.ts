import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../packages/*/stories/**/*.stories.@(ts|tsx)'],
  // `@storybook/addon-docs` is required to generate a "Docs" entry per component (driven by
  // `preview.ts`'s `tags: ['autodocs']`) — Storybook 10 does not bundle docs support by default;
  // without this addon registered, the autodocs tag is a no-op and no Docs page is produced,
  // even though the story index still marks stories with the "autodocs" tag.
  addons: ['@storybook/addon-a11y', '@storybook/addon-docs'],
  framework: {
    name: '@storybook/react-vite',
    options: {}
  }
  // NOTE on `viteFinal`: an earlier version of this config force-included `react` and
  // `react/jsx-dev-runtime` in Vite's `optimizeDeps` to fix an indefinite dev-server hang. That
  // hang happened while `preview.ts` still imported the Stencil lazy-loader
  // (`@wend-ui/web-components/loader`). Since preview.ts was later switched to the eager
  // `defineCustomElement` import (see the comment there), this hook was re-tested: with it
  // removed, caches fully cleared (`node_modules/.cache/storybook`, `node_modules/.vite`), and a
  // fresh `storybook dev`, both "Web Components/Button" and "React/Button" loaded and rendered
  // correctly with no hang and no repeated dependency re-optimization/reload loop observed over
  // 40+ seconds. The hook is no longer needed and has been removed.
};

export default config;
