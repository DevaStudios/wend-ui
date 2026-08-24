import type { Meta, StoryObj } from '@storybook/react-vite';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'wend-radio': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        selected?: boolean;
        disabled?: boolean;
        label?: string;
        name?: string;
        value?: string;
      };
    }
  }
}

interface WendRadioArgs {
  selected: boolean;
  label: string;
  disabled: boolean;
}

const meta: Meta<WendRadioArgs> = {
  title: 'Web Components/Radio',
  render: (args) => <wend-radio selected={args.selected} disabled={args.disabled} label={args.label} />,
  argTypes: {
    selected: { control: 'boolean' },
    label: { control: 'text' },
    disabled: { control: 'boolean' }
  },
  args: {
    selected: false,
    label: 'Label',
    disabled: false
  }
};

export default meta;
type Story = StoryObj<WendRadioArgs>;

export const Unselected: Story = {
  args: { selected: false, label: 'Unselected' }
};

export const Selected: Story = {
  args: { selected: true, label: 'Selected' }
};

export const Disabled: Story = {
  args: { selected: false, label: 'Disabled', disabled: true }
};

export const DisabledSelected: Story = {
  args: { selected: true, label: 'Disabled selected', disabled: true }
};

export const Group: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <wend-radio name="fruit" value="apple" label="Apple" selected></wend-radio>
      <wend-radio name="fruit" value="banana" label="Banana"></wend-radio>
      <wend-radio name="fruit" value="cherry" label="Cherry"></wend-radio>
    </div>
  )
};
