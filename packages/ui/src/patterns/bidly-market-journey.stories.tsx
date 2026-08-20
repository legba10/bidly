import type { Meta, StoryObj } from '@storybook/react-vite';

import { BidlyMarketJourney } from './bidly-market-journey.js';

const meta = {
  title: 'Patterns/BidlyMarketJourney',
  component: BidlyMarketJourney,
  args: {
    title: 'Как работает Bidly',
    steps: [
      { label: 'Опишите потребность', description: 'Расскажите, что для вас важно.' },
      { label: 'Объединим спрос', description: 'Сопоставим совместимые запросы.' },
      { label: 'Выберите предложение', description: 'Сравните условия сами.' },
    ],
  },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof BidlyMarketJourney>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
