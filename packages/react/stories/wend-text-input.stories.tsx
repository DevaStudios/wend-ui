import type { Meta, StoryObj } from '@storybook/react-vite';
import { WendTextInput } from '../src';

const meta: Meta<typeof WendTextInput> = {
  title: 'React/Text Input',
  component: WendTextInput,
  argTypes: {
    label: { control: 'text' },
    showLabel: { control: 'boolean' },
    value: { control: 'text' },
    placeholder: { control: 'text' },
    helpText: { control: 'text' },
    showHelpText: { control: 'boolean' },
    state: { control: 'select', options: ['default', 'success', 'warning', 'error'] },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' }
  },
  args: {
    label: 'Label',
    showLabel: true,
    value: '',
    placeholder: 'Value',
    helpText: 'Lorem ipsum dolor sit amet',
    showHelpText: true,
    state: 'default',
    disabled: false,
    required: false
  }
};

export default meta;
type Story = StoryObj<typeof WendTextInput>;

export const Default: Story = {
  args: { state: 'default' }
};

export const Success: Story = {
  args: { state: 'success' }
};

export const Warning: Story = {
  args: { state: 'warning' }
};

export const Error: Story = {
  args: { state: 'error' }
};

export const Disabled: Story = {
  args: { disabled: true }
};

export const Required: Story = {
  args: { required: true }
};

export const NoHelpText: Story = {
  args: { showHelpText: false }
};

export const NoLabel: Story = {
  args: { showLabel: false }
};
