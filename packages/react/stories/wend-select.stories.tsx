import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { WendSelect, WendOption } from '../src';

interface WendSelectArgs {
  label: string;
  showLabel: boolean;
  placeholder: string;
  helpText: string;
  showHelpText: boolean;
  state: 'default' | 'success' | 'warning' | 'error';
  disabled: boolean;
  required: boolean;
}

const meta: Meta<WendSelectArgs> = {
  title: 'React/Select',
  render: (args) => {
    const [value, setValue] = useState<string | undefined>(undefined);
    return (
      <WendSelect
        label={args.label}
        showLabel={args.showLabel}
        value={value}
        placeholder={args.placeholder}
        helpText={args.helpText}
        showHelpText={args.showHelpText}
        state={args.state}
        disabled={args.disabled}
        required={args.required}
        onWendChange={(e) => setValue(e.detail)}
      >
        <WendOption value="apple">Apple</WendOption>
        <WendOption value="banana">Banana</WendOption>
        <WendOption value="cherry">Cherry</WendOption>
        <WendOption value="durian" disabled>
          Durian (out of stock)
        </WendOption>
        <WendOption value="elderberry">Elderberry</WendOption>
      </WendSelect>
    );
  },
  argTypes: {
    label: { control: 'text' },
    showLabel: { control: 'boolean' },
    placeholder: { control: 'text' },
    helpText: { control: 'text' },
    showHelpText: { control: 'boolean' },
    state: { control: 'select', options: ['default', 'success', 'warning', 'error'] },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' }
  },
  args: {
    label: 'Favorite fruit',
    showLabel: true,
    placeholder: 'Select a fruit…',
    helpText: 'Lorem ipsum dolor sit amet',
    showHelpText: true,
    state: 'default',
    disabled: false,
    required: false
  }
};

export default meta;
type Story = StoryObj<WendSelectArgs>;

export const Default: Story = {
  args: { state: 'default' }
};

export const Success: Story = {
  args: { state: 'success' }
};

export const Warning: Story = {
  args: { state: 'warning' }
};

export const Error: Story = {
  args: { state: 'error' }
};

export const Disabled: Story = {
  args: { disabled: true }
};

export const Required: Story = {
  args: { required: true }
};

export const NoHelpText: Story = {
  args: { showHelpText: false }
};

export const NoLabel: Story = {
  args: { showLabel: false }
};

export const ManyOptions: StoryObj = {
  render: () => {
    const [value, setValue] = useState<string | undefined>(undefined);
    return (
      <WendSelect
        label="Country"
        helpText="Panel caps at 5 rows and scrolls for the rest"
        value={value}
        placeholder="Select a country…"
        onWendChange={(e) => setValue(e.detail)}
      >
        <WendOption value="ar">Argentina</WendOption>
        <WendOption value="au">Australia</WendOption>
        <WendOption value="br">Brazil</WendOption>
        <WendOption value="ca">Canada</WendOption>
        <WendOption value="de">Germany</WendOption>
        <WendOption value="fr">France</WendOption>
        <WendOption value="jp">Japan</WendOption>
        <WendOption value="mx">Mexico</WendOption>
        <WendOption value="us">United States</WendOption>
      </WendSelect>
    );
  }
};
