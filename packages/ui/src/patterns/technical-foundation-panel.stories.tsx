import type { Meta, StoryObj } from '@storybook/react-vite';

import { TechnicalFoundationPanel } from './technical-foundation-panel.js';

const meta = {
  title: 'Patterns/TechnicalFoundationPanel',
  component: TechnicalFoundationPanel,
  args: {
    checks: ['Токены подключены', 'Компоненты доступны с клавиатуры', 'Текст хранится отдельно'],
    description: 'Панель демонстрирует композицию компонентов без продуктового сценария.',
    eyebrow: 'Техническая демонстрация',
    statusLabel: 'Основа готова к проверке',
    title: 'Система компонентов Bidly',
  },
} satisfies Meta<typeof TechnicalFoundationPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const EmptyChecks: Story = {
  args: { checks: [], statusLabel: 'Нет результатов проверки' },
};

export const LongText: Story = {
  args: {
    description:
      'Очень длинное техническое описание проверяет адаптацию композиции к русскому тексту, узкому экрану, увеличенному масштабу и отсутствию искусственного ограничения по количеству символов.',
  },
};
