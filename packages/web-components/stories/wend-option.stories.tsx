import type { Meta, StoryObj } from '@storybook/react-vite';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'wend-option': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        value?: string;
        selected?: boolean;
        active?: boolean;
        disabled?: boolean;
      };
    }
  }
}

interface WendOptionArgs {
  value: string;
  selected: boolean;
  active: boolean;
  disabled: boolean;
}

const meta: Meta<WendOptionArgs> = {
  title: 'Web Components/Option',
  render: (args) => (
    <div style={{ width: '200px' }}>
      <wend-option value={args.value} selected={args.selected} active={args.active} disabled={args.disabled}>
        {args.value}
      </wend-option>
    </div>
  ),
  argTypes: {
    value: { control: 'text' },
    selected: { control: 'boolean' },
    active: { control: 'boolean' },
    disabled: { control: 'boolean' }
  },
  args: {
    value: 'Apple',
    selected: false,
    active: false,
    disabled: false
  }
};

export default meta;
type Story = StoryObj<WendOptionArgs>;

export const Default: Story = {};

export const Active: Story = {
  args: { active: true }
};

export const Selected: Story = {
  args: { selected: true }
};

export const Disabled: Story = {
  args: { disabled: true }
};

export const Panel: StoryObj = {
  render: () => (
    <div style={{ width: '200px', padding: '4px', borderRadius: '8px', boxShadow: '0 1px 2px rgba(51, 51, 51, 0.2)' }}>
      <wend-option value="apple" selected>
        Apple
      </wend-option>
      <wend-option value="banana">Banana</wend-option>
      <wend-option value="cherry" active>
        Cherry
      </wend-option>
      <wend-option value="durian" disabled>
        Durian (out of stock)
      </wend-option>
    </div>
  )
};
