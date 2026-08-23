import type { Meta, StoryObj } from '@storybook/react-vite';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'wend-checkbox': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        checked?: boolean;
        disabled?: boolean;
        label?: string;
      };
    }
  }
}

interface WendCheckboxArgs {
  checked: boolean;
  label: string;
  disabled: boolean;
}

const meta: Meta<WendCheckboxArgs> = {
  title: 'Web Components/Checkbox',
  render: (args) => <wend-checkbox checked={args.checked} disabled={args.disabled} label={args.label} />,
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
type Story = StoryObj<WendCheckboxArgs>;

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
