import type { Meta, StoryObj } from '@storybook/react-vite';

import { MoneyValue } from './money-value.js';

const meta = {
  title: 'Components/MoneyValue',
  component: MoneyValue,
  args: {
    amountMinor: 54_900n,
  },
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof MoneyValue>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { periodLabel: 'мес' },
};

export const LargeValue: Story = {
  args: { amountMinor: 184_230_000n },
};

export const FractionalRubles: Story = {
  args: { amountMinor: 184_230_005n },
};

export const NegativeAdjustment: Story = {
  args: { amountMinor: -54_900n },
};

export const PositiveTone: Story = {
  args: { tone: 'positive' },
};
