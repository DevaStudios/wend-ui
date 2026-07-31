import type { Preview } from '@storybook/react-vite';
import { defineCustomElement } from '@wend-ui/web-components/dist/components/wend-button.js';
import '@wend-ui/styles';

defineCustomElement();

const preview: Preview = {};

export default preview;
