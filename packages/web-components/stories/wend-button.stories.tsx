import type { Meta, StoryObj } from '@storybook/react-vite';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'wend-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        variant?: 'primary' | 'secondary' | 'tertiary' | 'destructive-primary' | 'destructive-secondary' | 'destructive-tertiary';
        disabled?: boolean;
        'icon-left'?: string;
        'icon-right'?: string;
      };
    }
  }
}

interface WendButtonArgs {
  label: string;
  variant: 'primary' | 'secondary' | 'tertiary' | 'destructive-primary' | 'destructive-secondary' | 'destructive-tertiary';
  disabled: boolean;
  iconLeft: string;
  iconRight: string;
}

const meta: Meta<WendButtonArgs> = {
  title: 'Web Components/Button',
  render: (args) => (
    <wend-button variant={args.variant} disabled={args.disabled} icon-left={args.iconLeft} icon-right={args.iconRight}>
      {args.label}
    </wend-button>
  ),
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'tertiary', 'destructive-primary', 'destructive-secondary', 'destructive-tertiary']
    },
    disabled: { control: 'boolean' },
    label: { control: 'text' },
    iconLeft: { control: 'text' },
    iconRight: { control: 'text' }
  },
  args: {
    label: 'Button',
    variant: 'primary',
    disabled: false,
    iconLeft: '',
    iconRight: ''
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

export const WithIconLeft: Story = {
  args: { label: 'Save', variant: 'primary', iconLeft: 'add' }
};

export const WithIconRight: Story = {
  args: { label: 'Next', variant: 'secondary', iconRight: 'arrow-right' }
};

export const WithBothIcons: Story = {
  args: { label: 'Sync', variant: 'tertiary', iconLeft: 'synchronize-arrows', iconRight: 'arrow-right' }
};
