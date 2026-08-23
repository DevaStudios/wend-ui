import type { Meta, StoryObj } from '@storybook/react-vite';
import { WendCheckbox } from '../src';

const meta: Meta<typeof WendCheckbox> = {
  title: 'React/Checkbox',
  component: WendCheckbox,
  argTypes: {
    checked: { control: 'boolean' },
    label: { control: 'text' },
    disabled: { control: 'boolean' }
  },
  args: {
    checked: false,
    label: 'Label',
    disabled: false
  }
};

export default meta;
type Story = StoryObj<typeof WendCheckbox>;

export const Unchecked: Story = {
  args: { checked: false, label: 'Unchecked' }
};

export const Checked: Story = {
  args: { checked: true, label: 'Checked' }
};

export const Disabled: Story = {
  args: { checked: false, label: 'Disabled', disabled: true }
};

export const DisabledChecked: Story = {
  args: { checked: true, label: 'Disabled checked', disabled: true }
};

export const NoLabel: Story = {
  args: { checked: false, label: '' }
};
