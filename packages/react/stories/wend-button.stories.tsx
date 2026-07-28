import type { Meta, StoryObj } from '@storybook/react-vite';
import { WendButton } from '../src';

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
