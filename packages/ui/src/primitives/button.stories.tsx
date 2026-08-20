import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from './button.js';

const meta = {
  title: 'Primitives/Button',
  component: Button,
  args: {
    children: 'Продолжить',
    variant: 'primary',
  },
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Secondary: Story = {
  args: { variant: 'secondary' },
};

export const Loading: Story = {
  args: {
    loading: true,
    loadingLabel: 'Выполняется действие',
  },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const LongRussianText: Story = {
  args: {
    children: 'Подтвердить, что условия внимательно прочитаны',
  },
};

export const MobileFullWidth: Story = {
  args: { fullWidth: true },
  decorators: [
    (Story) => (
      <div style={{ width: '280px' }}>
        <Story />
      </div>
    ),
  ],
};
