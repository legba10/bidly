import type { Meta, StoryObj } from '@storybook/react-vite';

import { OfferCard } from './offer-card.js';

const meta = {
  title: 'Product/OfferCard',
  component: OfferCard,
  args: {
    availability: '116 из 200 подключений',
    badge: 'Выбор покупателей',
    conditions: ['500 Мбит/с', 'Подключение 0 ₽', 'Wi-Fi роутер включён'],
    period: '/мес',
    price: '549 ₽',
    rating: '4,8',
    reviews: '1 240 отзывов',
    saving: '–27%',
    supplier: 'Связь+',
    totalCost: '6 588 ₽ за 12 месяцев',
  },
} satisfies Meta<typeof OfferCard>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
