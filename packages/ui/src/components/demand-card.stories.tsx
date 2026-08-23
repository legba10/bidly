import type { Meta, StoryObj } from '@storybook/react-vite';

import { DemandCard } from './demand-card.js';

const meta = {
  title: 'Product/DemandCard',
  component: DemandCard,
  args: {
    availability: '116 подключений',
    city: 'Сургут',
    comparableOffer: '549 ₽/мес',
    deadline: '01:42:18',
    participants: '18 421',
    saving: 'до 27%',
    stage: 'Компании предлагают условия',
    summary: '500 Мбит/с, подключение 0 ₽, роутер включён',
    title: 'Домашний интернет',
    verified: '7 842',
  },
} satisfies Meta<typeof DemandCard>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
