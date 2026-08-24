import type { Meta, StoryObj } from '@storybook/react-vite';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'wend-help-text': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        text?: string;
        type?: 'default' | 'success' | 'warning' | 'error';
      };
    }
  }
}

interface WendHelpTextArgs {
  text: string;
  type: 'default' | 'success' | 'warning' | 'error';
}

const meta: Meta<WendHelpTextArgs> = {
  title: 'Web Components/Help Text',
  render: (args) => <wend-help-text text={args.text} type={args.type} />,
  argTypes: {
    text: { control: 'text' },
    type: { control: 'select', options: ['default', 'success', 'warning', 'error'] }
  },
  args: {
    text: 'Lorem ipsum dolor sit amet',
    type: 'default'
  }
};

export default meta;
type Story = StoryObj<WendHelpTextArgs>;

export const Default: Story = {
  args: { type: 'default' }
};

export const Success: Story = {
  args: { type: 'success' }
};

export const Warning: Story = {
  args: { type: 'warning' }
};

export const Error: Story = {
  args: { type: 'error' }
};
