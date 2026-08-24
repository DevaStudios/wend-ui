import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'wend-radio-group': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        label?: string;
        name?: string;
        value?: string;
        disabled?: boolean;
        onWendChange?: (event: CustomEvent<string>) => void;
      };
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

interface WendRadioGroupArgs {
  label: string;
  disabled: boolean;
}

const meta: Meta<WendRadioGroupArgs> = {
  title: 'Web Components/Radio Group',
  render: (args) => {
    const [value, setValue] = useState('apple');
    return (
      <wend-radio-group
        label={args.label}
        name="fruit"
        value={value}
        disabled={args.disabled}
        onWendChange={(e) => setValue(e.detail)}
      >
        <wend-radio value="apple" label="Apple"></wend-radio>
        <wend-radio value="banana" label="Banana"></wend-radio>
        <wend-radio value="cherry" label="Cherry"></wend-radio>
      </wend-radio-group>
    );
  },
  argTypes: {
    label: { control: 'text' },
    disabled: { control: 'boolean' }
  },
  args: {
    label: 'Favorite fruit',
    disabled: false
  }
};

export default meta;
type Story = StoryObj<WendRadioGroupArgs>;

export const Default: Story = {};

export const NoLabel: Story = {
  args: { label: '' }
};

export const Disabled: Story = {
  args: { disabled: true }
};
