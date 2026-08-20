import type { Meta, StoryObj } from '@storybook/react-vite';

import { DemandPulse } from './demand-pulse.js';

const meta = {
  title: 'Patterns/DemandPulse',
  component: DemandPulse,
  args: {
    label: 'Спрос объединяется по условиям',
    detail: 'Город, потребность и важные ограничения остаются частью выбора.',
  },
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof DemandPulse>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
