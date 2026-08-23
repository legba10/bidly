import type { Meta, StoryObj } from '@storybook/react-vite';

import { CapacityChart } from './capacity-chart.js';

const meta = {
  title: 'Business/CapacityChart',
  component: CapacityChart,
  args: {
    items: [
      { label: '10:00', available: 4 },
      { label: '11:00', available: 0 },
      { label: '12:00', available: 2 },
      { label: '14:00', available: 3 },
    ],
  },
} satisfies Meta<typeof CapacityChart>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
