import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { WendRadioGroup, WendRadio } from '../src';

interface WendRadioGroupArgs {
  label: string;
  disabled: boolean;
}

const meta: Meta<WendRadioGroupArgs> = {
  title: 'React/Radio Group',
  render: (args) => {
    const [value, setValue] = useState('apple');
    return (
      <WendRadioGroup
        label={args.label}
        name="fruit"
        value={value}
        disabled={args.disabled}
        onWendChange={(e) => setValue(e.detail)}
      >
        <WendRadio value="apple" label="Apple" />
        <WendRadio value="banana" label="Banana" />
        <WendRadio value="cherry" label="Cherry" />
      </WendRadioGroup>
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
