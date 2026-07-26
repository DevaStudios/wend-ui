import type { Preview } from '@storybook/react-vite';
import { defineCustomElements } from '@wend-ui/web-components/loader';
import '@wend-ui/styles';

defineCustomElements();

const preview: Preview = {};

export default preview;
