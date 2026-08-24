import type { Meta, StoryObj } from '@storybook/react-vite';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'wend-text-input': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
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
      };
    }
  }
}

interface WendTextInputArgs {
  label: string;
  showLabel: boolean;
  value: string;
  placeholder: string;
  helpText: string;
  showHelpText: boolean;
  state: 'default' | 'success' | 'warning' | 'error';
  disabled: boolean;
  required: boolean;
}

const meta: Meta<WendTextInputArgs> = {
  title: 'Web Components/Text Input',
  render: (args) => (
    <wend-text-input
      label={args.label}
      show-label={args.showLabel}
      value={args.value}
      placeholder={args.placeholder}
      help-text={args.helpText}
      show-help-text={args.showHelpText}
      state={args.state}
      disabled={args.disabled}
      required={args.required}
    />
  ),
  argTypes: {
    label: { control: 'text' },
    showLabel: { control: 'boolean' },
    value: { control: 'text' },
    placeholder: { control: 'text' },
    helpText: { control: 'text' },
    showHelpText: { control: 'boolean' },
    state: { control: 'select', options: ['default', 'success', 'warning', 'error'] },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' }
  },
  args: {
    label: 'Label',
    showLabel: true,
    value: '',
    placeholder: 'Value',
    helpText: 'Lorem ipsum dolor sit amet',
    showHelpText: true,
    state: 'default',
    disabled: false,
    required: false
  }
};

export default meta;
type Story = StoryObj<WendTextInputArgs>;

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
