import type { Meta, StoryObj } from '@storybook/react-vite';

import { MarketProgress } from './market-progress.js';

const meta = {
  title: 'Patterns/MarketProgress',
  component: MarketProgress,
  args: {
    title: 'Путь покупателя',
    steps: [
      { label: 'Потребность описана', state: 'complete' },
      { label: 'Компании делают предложения', state: 'current' },
      { label: 'Выбор предложения', state: 'upcoming' },
    ],
  },
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof MarketProgress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
