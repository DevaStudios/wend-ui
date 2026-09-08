import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'wend-select': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        label?: string;
        'show-label'?: boolean;
        value?: string;
        placeholder?: string;
        'help-text'?: string;
        'show-help-text'?: boolean;
        state?: 'default' | 'success' | 'warning' | 'error';
        disabled?: boolean;
        required?: boolean;
        name?: string;
        onWendChange?: (event: CustomEvent<string>) => void;
      };
      'wend-option': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        value?: string;
        disabled?: boolean;
      };
    }
  }
}

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
  title: 'Web Components/Select',
  render: (args) => {
    const [value, setValue] = useState<string | undefined>(undefined);
    return (
      <wend-select
        label={args.label}
        show-label={args.showLabel}
        value={value}
        placeholder={args.placeholder}
        help-text={args.helpText}
        show-help-text={args.showHelpText}
        state={args.state}
        disabled={args.disabled}
        required={args.required}
        onWendChange={(e) => setValue(e.detail)}
      >
        <wend-option value="apple">Apple</wend-option>
        <wend-option value="banana">Banana</wend-option>
        <wend-option value="cherry">Cherry</wend-option>
        <wend-option value="durian" disabled>
          Durian (out of stock)
        </wend-option>
        <wend-option value="elderberry">Elderberry</wend-option>
      </wend-select>
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
      <wend-select
        label="Country"
        help-text="Panel caps at 5 rows and scrolls for the rest"
        value={value}
        placeholder="Select a country…"
        onWendChange={(e) => setValue(e.detail)}
      >
        <wend-option value="ar">Argentina</wend-option>
        <wend-option value="au">Australia</wend-option>
        <wend-option value="br">Brazil</wend-option>
        <wend-option value="ca">Canada</wend-option>
        <wend-option value="de">Germany</wend-option>
        <wend-option value="fr">France</wend-option>
        <wend-option value="jp">Japan</wend-option>
        <wend-option value="mx">Mexico</wend-option>
        <wend-option value="us">United States</wend-option>
      </wend-select>
    );
  }
};
