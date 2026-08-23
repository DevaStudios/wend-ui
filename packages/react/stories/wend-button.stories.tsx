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
    label: { control: 'text' },
    iconLeft: { control: 'text' },
    iconRight: { control: 'text' },
    iconOnly: { control: 'boolean' }
  },
  args: {
    label: 'Button',
    variant: 'primary',
    disabled: false
  }
};

export default meta;
type Story = StoryObj<typeof WendButton>;

export const Primary: Story = {
  args: { label: 'Primary button', variant: 'primary' }
};

export const Secondary: Story = {
  args: { label: 'Secondary button', variant: 'secondary' }
};

export const Tertiary: Story = {
  args: { label: 'Tertiary button', variant: 'tertiary' }
};

export const DestructivePrimary: Story = {
  args: { label: 'Destructive primary button', variant: 'destructive-primary' }
};

export const DestructiveSecondary: Story = {
  args: { label: 'Destructive secondary button', variant: 'destructive-secondary' }
};

export const DestructiveTertiary: Story = {
  args: { label: 'Destructive tertiary button', variant: 'destructive-tertiary' }
};

export const Disabled: Story = {
  args: { label: 'Disabled button', variant: 'primary', disabled: true }
};

export const WithIconLeft: Story = {
  args: { label: 'Save', variant: 'primary', iconLeft: 'add' }
};

export const WithIconRight: Story = {
  args: { label: 'Next', variant: 'secondary', iconRight: 'arrow-right' }
};

export const WithBothIcons: Story = {
  args: { label: 'Sync', variant: 'tertiary', iconLeft: 'synchronize-arrows', iconRight: 'arrow-right' }
};

export const IconOnly: Story = {
  args: { label: '', variant: 'primary', iconLeft: 'add', iconOnly: true }
};

export const IconOnlyDestructive: Story = {
  args: { label: '', variant: 'destructive-primary', iconLeft: 'add', iconOnly: true }
};
