import type { Meta, StoryObj } from '@storybook/react-vite';
import { WendOption } from '../src';

const meta: Meta<typeof WendOption> = {
  title: 'React/Option',
  render: (args) => (
    <div style={{ width: '200px' }}>
      <WendOption {...args}>{args.value}</WendOption>
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
type Story = StoryObj<typeof WendOption>;

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
      <WendOption value="apple" selected>
        Apple
      </WendOption>
      <WendOption value="banana">Banana</WendOption>
      <WendOption value="cherry" active>
        Cherry
      </WendOption>
      <WendOption value="durian" disabled>
        Durian (out of stock)
      </WendOption>
    </div>
  )
};
