import type { Meta, StoryObj } from '@storybook/react-vite';

import { BusinessMetric } from './business-metric.js';

const meta = {
  title: 'Business/BusinessMetric',
  component: BusinessMetric,
  args: { detail: '+23 за неделю', label: 'Подключения', value: '184' },
} satisfies Meta<typeof BusinessMetric>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
