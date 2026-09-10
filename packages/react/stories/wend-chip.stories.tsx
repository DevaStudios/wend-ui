import type { Meta, StoryObj } from '@storybook/react-vite';
import { WendChip } from '../src';

const meta: Meta<typeof WendChip> = {
  title: 'React/Chip',
  component: WendChip,
  argTypes: {
    label: { control: 'text' },
    disabled: { control: 'boolean' },
    closable: { control: 'boolean' }
  },
  args: {
    label: 'Label',
    disabled: false,
    closable: true
  }
};

export default meta;
type Story = StoryObj<typeof WendChip>;

export const Default: Story = {
  args: { label: 'Label' }
};

export const NotClosable: Story = {
  args: { label: 'Not closable', closable: false }
};

export const Disabled: Story = {
  args: { label: 'Disabled', disabled: true }
};

export const DisabledNotClosable: Story = {
  args: { label: 'Disabled, not closable', disabled: true, closable: false }
};
