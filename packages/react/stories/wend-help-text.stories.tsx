import type { Meta, StoryObj } from '@storybook/react-vite';
import { WendHelpText } from '../src';

const meta: Meta<typeof WendHelpText> = {
  title: 'React/Help Text',
  component: WendHelpText,
  argTypes: {
    text: { control: 'text' },
    type: { control: 'select', options: ['default', 'success', 'warning', 'error'] }
  },
  args: {
    text: 'Lorem ipsum dolor sit amet',
    type: 'default'
  }
};

export default meta;
type Story = StoryObj<typeof WendHelpText>;

export const Default: Story = {
  args: { type: 'default' }
};

export const Success: Story = {
  args: { type: 'success' }
};

export const Warning: Story = {
  args: { type: 'warning' }
};

export const Error: Story = {
  args: { type: 'error' }
};
