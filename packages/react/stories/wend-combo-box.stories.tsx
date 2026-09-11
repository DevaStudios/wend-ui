import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { WendComboBox, WendOption } from '../src';

interface WendComboBoxArgs {
  label: string;
  showLabel: boolean;
  placeholder: string;
  helpText: string;
  showHelpText: boolean;
  state: 'default' | 'success' | 'warning' | 'error';
  disabled: boolean;
  required: boolean;
}

const meta: Meta<WendComboBoxArgs> = {
  title: 'React/Combo Box',
  render: (args) => {
    const [values, setValues] = useState<string[]>([]);
    return (
      <WendComboBox
        label={args.label}
        showLabel={args.showLabel}
        values={values}
        placeholder={args.placeholder}
        helpText={args.helpText}
        showHelpText={args.showHelpText}
        state={args.state}
        disabled={args.disabled}
        required={args.required}
        onWendChange={(e) => setValues(e.detail)}
      >
        <WendOption value="apple">Apple</WendOption>
        <WendOption value="banana">Banana</WendOption>
        <WendOption value="cherry">Cherry</WendOption>
        <WendOption value="durian" disabled>
          Durian (out of stock)
        </WendOption>
        <WendOption value="elderberry">Elderberry</WendOption>
      </WendComboBox>
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
    label: 'Favorite fruits',
    showLabel: true,
    placeholder: 'Select fruits…',
    helpText: 'Lorem ipsum dolor sit amet',
    showHelpText: true,
    state: 'default',
    disabled: false,
    required: false
  }
};

export default meta;
type Story = StoryObj<WendComboBoxArgs>;

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

export const DisabledWithSelections: StoryObj = {
  render: () => (
    <WendComboBox label="Favorite fruits" disabled values={['apple', 'cherry']}>
      <WendOption value="apple">Apple</WendOption>
      <WendOption value="banana">Banana</WendOption>
      <WendOption value="cherry">Cherry</WendOption>
    </WendComboBox>
  )
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

export const PreSelected: StoryObj = {
  render: () => {
    const [values, setValues] = useState<string[]>(['apple', 'cherry']);
    return (
      <WendComboBox label="Favorite fruits" values={values} onWendChange={(e) => setValues(e.detail)}>
        <WendOption value="apple">Apple</WendOption>
        <WendOption value="banana">Banana</WendOption>
        <WendOption value="cherry">Cherry</WendOption>
        <WendOption value="durian">Durian</WendOption>
      </WendComboBox>
    );
  }
};

export const ManyOptions: StoryObj = {
  render: () => {
    const [values, setValues] = useState<string[]>([]);
    return (
      <WendComboBox
        label="Countries"
        helpText="Panel caps at 5 rows and scrolls for the rest"
        values={values}
        placeholder="Select countries…"
        onWendChange={(e) => setValues(e.detail)}
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
      </WendComboBox>
    );
  }
};
