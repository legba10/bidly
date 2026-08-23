import type { Meta, StoryObj } from '@storybook/react-vite';

import { ConversionFunnel } from './conversion-funnel.js';

const meta = {
  title: 'Business/ConversionFunnel',
  component: ConversionFunnel,
  args: {
    items: [
      { label: 'Показаны', value: 3410 },
      { label: 'Выбрали', value: 184 },
      { label: 'Подключились', value: 153 },
      { label: 'Выполнено', value: 121 },
    ],
  },
} satisfies Meta<typeof ConversionFunnel>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
