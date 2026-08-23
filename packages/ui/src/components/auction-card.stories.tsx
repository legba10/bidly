import type { Meta, StoryObj } from '@storybook/react-vite';

import { AuctionCard } from './auction-card.js';

const meta = {
  title: 'Product/AuctionCard',
  component: AuctionCard,
  args: {
    category: 'Домашний интернет',
    deadline: 'До конца 01:42:18',
    offerCount: 3,
    participants: '18 421 участников',
    progress: 2,
    status: 'Торги идут',
  },
} satisfies Meta<typeof AuctionCard>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
