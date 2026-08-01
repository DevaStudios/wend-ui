import type { Preview } from '@storybook/react-vite';
// IMPORTANT: import the eager `defineCustomElement` from the compiled component file directly,
// NOT the lazy-loader (`@wend-ui/web-components/loader`'s `defineCustomElements()`). The loader
// is what the design/plan docs describe and it works fine in `storybook dev`, but its lazy
// dynamic `import()` of the component bundle does not resolve in time inside the static
// `build-storybook` output, so `<wend-button>` renders as an unregistered/blank element there.
// This eager import fixed that (see Task 7 commit); do not revert to the loader.
import { defineCustomElement } from '@wend-ui/web-components/dist/components/wend-button.js';
import '@wend-ui/styles';

defineCustomElement();

const preview: Preview = {
  tags: ['autodocs']
};

export default preview;
