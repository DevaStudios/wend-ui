import type { Preview } from '@storybook/react-vite';
// IMPORTANT: import the eager `defineCustomElement` from the compiled component file directly,
// NOT the lazy-loader (`@devastudios/web-components/loader`'s `defineCustomElements()`). The loader
// is what the design/plan docs describe and it works fine in `storybook dev`, but its lazy
// dynamic `import()` of the component bundle does not resolve in time inside the static
// `build-storybook` output, so `<wend-button>` renders as an unregistered/blank element there.
// This eager import fixed that (see Task 7 commit); do not revert to the loader.
import { defineCustomElement as defineWendButton } from '@devastudios/web-components/dist/components/wend-button.js';
import { defineCustomElement as defineWendCheckbox } from '@devastudios/web-components/dist/components/wend-checkbox.js';
import { defineCustomElement as defineWendToggle } from '@devastudios/web-components/dist/components/wend-toggle.js';
import { defineCustomElement as defineWendRadio } from '@devastudios/web-components/dist/components/wend-radio.js';
import { defineCustomElement as defineWendRadioGroup } from '@devastudios/web-components/dist/components/wend-radio-group.js';
import { defineCustomElement as defineWendIcon } from '@devastudios/web-components/dist/components/wend-icon.js';
import { defineCustomElement as defineWendHelpText } from '@devastudios/web-components/dist/components/wend-help-text.js';
import { defineCustomElement as defineWendTextInput } from '@devastudios/web-components/dist/components/wend-text-input.js';
import '@devastudios/styles';

defineWendButton();
defineWendCheckbox();
defineWendToggle();
defineWendRadio();
defineWendRadioGroup();
defineWendIcon();
defineWendHelpText();
defineWendTextInput();

const preview: Preview = {
  tags: ['autodocs']
};

export default preview;
