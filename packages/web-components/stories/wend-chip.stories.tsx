import type { Meta, StoryObj } from '@storybook/react-vite';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'wend-chip': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        label?: string;
        disabled?: boolean;
        closable?: boolean;
      };
    }
  }
}

interface WendChipArgs {
  label: string;
  disabled: boolean;
  closable: boolean;
}

const meta: Meta<WendChipArgs> = {
  title: 'Web Components/Chip',
  render: (args) => <wend-chip label={args.label} disabled={args.disabled} closable={args.closable} />,
  argTypes: {
    label: { control: 'text' },
    disabled: { control: 'boolean' },
    closable: { control: 'boolean' }
  },
  args: {
    label: 'Label',
    disabled: false,
    closable: true
  }
};

export default meta;
type Story = StoryObj<WendChipArgs>;

export const Default: Story = {
  args: { label: 'Label' }
};

export const NotClosable: Story = {
  args: { label: 'Not closable', closable: false }
};

export const Disabled: Story = {
  args: { label: 'Disabled', disabled: true }
};

export const DisabledNotClosable: Story = {
  args: { label: 'Disabled, not closable', disabled: true, closable: false }
};
