import type { Meta, StoryObj } from '@storybook/react-vite';
import { WendRadio } from '../src';

const meta: Meta<typeof WendRadio> = {
  title: 'React/Radio',
  component: WendRadio,
  argTypes: {
    selected: { control: 'boolean' },
    label: { control: 'text' },
    disabled: { control: 'boolean' }
  },
  args: {
    selected: false,
    label: 'Label',
    disabled: false
  }
};

export default meta;
type Story = StoryObj<typeof WendRadio>;

export const Unselected: Story = {
  args: { selected: false, label: 'Unselected' }
};

export const Selected: Story = {
  args: { selected: true, label: 'Selected' }
};

export const Disabled: Story = {
  args: { selected: false, label: 'Disabled', disabled: true }
};

export const DisabledSelected: Story = {
  args: { selected: true, label: 'Disabled selected', disabled: true }
};

export const Group: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <WendRadio name="fruit" value="apple" label="Apple" selected />
      <WendRadio name="fruit" value="banana" label="Banana" />
      <WendRadio name="fruit" value="cherry" label="Cherry" />
    </div>
  )
};
