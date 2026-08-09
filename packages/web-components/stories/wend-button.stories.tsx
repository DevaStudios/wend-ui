import type { Meta, StoryObj } from '@storybook/react-vite';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'wend-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        variant?: 'primary' | 'secondary' | 'tertiary' | 'destructive-primary' | 'destructive-secondary' | 'destructive-tertiary';
        disabled?: boolean;
      };
    }
  }
}

interface WendButtonArgs {
  label: string;
  variant: 'primary' | 'secondary' | 'tertiary' | 'destructive-primary' | 'destructive-secondary' | 'destructive-tertiary';
  disabled: boolean;
}

const meta: Meta<WendButtonArgs> = {
  title: 'Web Components/Button',
  render: (args) => (
    <wend-button variant={args.variant} disabled={args.disabled}>
      {args.label}
    </wend-button>
  ),
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'tertiary', 'destructive-primary', 'destructive-secondary', 'destructive-tertiary']
    },
    disabled: { control: 'boolean' },
    label: { control: 'text' }
  },
  args: {
    label: 'Button',
    variant: 'primary',
    disabled: false
  }
};

export default meta;
type Story = StoryObj<WendButtonArgs>;

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
