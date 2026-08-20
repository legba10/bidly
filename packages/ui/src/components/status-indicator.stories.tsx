import type { Meta, StoryObj } from '@storybook/react-vite';

import { StatusIndicator } from './status-indicator.js';

const meta = {
  title: 'Components/StatusIndicator',
  component: StatusIndicator,
  args: {
    label: 'Техническая проверка пройдена',
    tone: 'ready',
  },
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof StatusIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Ready: Story = {};
export const Attention: Story = { args: { label: 'Нужна проверка', tone: 'attention' } };
export const Information: Story = { args: { label: 'Дополнительная информация', tone: 'info' } };
export const Neutral: Story = { args: { label: 'Статус не определён', tone: 'neutral' } };
