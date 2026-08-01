import type { Meta, StoryObj } from '@storybook/react-vite';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'wend-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        variant?: 'primary' | 'secondary';
        disabled?: boolean;
      };
    }
  }
}

interface WendButtonArgs {
  label: string;
  variant: 'primary' | 'secondary';
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
    variant: { control: 'select', options: ['primary', 'secondary'] },
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

export const Disabled: Story = {
  args: { label: 'Disabled button', variant: 'primary', disabled: true }
};
