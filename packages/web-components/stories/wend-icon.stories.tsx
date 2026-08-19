import type { Meta, StoryObj } from '@storybook/react-vite';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'wend-icon': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        name?: string;
        size?: string;
        color?: string;
      };
    }
  }
}

interface WendIconArgs {
  name: string;
  size: string;
  color: string;
}

const meta: Meta<WendIconArgs> = {
  title: 'Web Components/Icon',
  render: (args) => <wend-icon name={args.name} size={args.size} color={args.color} />,
  argTypes: {
    name: { control: 'text' },
    size: { control: 'text' },
    color: { control: 'text' }
  },
  args: {
    name: 'add',
    size: '1em',
    color: 'currentColor'
  }
};

export default meta;
type Story = StoryObj<WendIconArgs>;

export const Default: Story = {
  args: { name: 'add' }
};

export const CustomSize: Story = {
  args: { name: 'star', size: '32px' }
};

export const CustomColor: Story = {
  args: { name: 'alert-circle', color: '#bb2b1b' }
};
