import type { Meta, StoryObj } from '@storybook/react-vite';
import { WendButton } from '../src';

const meta: Meta<typeof WendButton> = {
  title: 'React/Button',
  component: WendButton,
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'tertiary', 'destructive-primary', 'destructive-secondary', 'destructive-tertiary']
    },
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

export const Tertiary: Story = {
  args: { children: 'Tertiary button', variant: 'tertiary' }
};

export const DestructivePrimary: Story = {
  args: { children: 'Destructive primary button', variant: 'destructive-primary' }
};

export const DestructiveSecondary: Story = {
  args: { children: 'Destructive secondary button', variant: 'destructive-secondary' }
};

export const DestructiveTertiary: Story = {
  args: { children: 'Destructive tertiary button', variant: 'destructive-tertiary' }
};

export const Disabled: Story = {
  args: { children: 'Disabled button', variant: 'primary', disabled: true }
};
