import type { Meta, StoryObj } from '@storybook/react-vite';
import { WendToggle } from '../src';

const meta: Meta<typeof WendToggle> = {
  title: 'React/Toggle',
  component: WendToggle,
  argTypes: {
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' }
  },
  args: {
    checked: false,
    disabled: false
  }
};

export default meta;
type Story = StoryObj<typeof WendToggle>;

export const Off: Story = {
  args: { checked: false }
};

export const On: Story = {
  args: { checked: true }
};

export const Disabled: Story = {
  args: { checked: false, disabled: true }
};

export const DisabledOn: Story = {
  args: { checked: true, disabled: true }
};
