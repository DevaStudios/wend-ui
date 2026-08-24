import type { Meta, StoryObj } from '@storybook/react-vite';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'wend-toggle': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        checked?: boolean;
        disabled?: boolean;
      };
    }
  }
}

interface WendToggleArgs {
  checked: boolean;
  disabled: boolean;
}

const meta: Meta<WendToggleArgs> = {
  title: 'Web Components/Toggle',
  render: (args) => <wend-toggle checked={args.checked} disabled={args.disabled} />,
  argTypes: {
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' }
  },
  args: {
    checked: false,
    disabled: false
  }
};

export default meta;
type Story = StoryObj<WendToggleArgs>;

export const Off: Story = {
  args: { checked: false }
};

export const On: Story = {
  args: { checked: true }
};

export const Disabled: Story = {
  args: { checked: false, disabled: true }
};

export const DisabledOn: Story = {
  args: { checked: true, disabled: true }
};
