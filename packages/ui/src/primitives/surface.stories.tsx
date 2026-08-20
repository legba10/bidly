import type { Meta, StoryObj } from '@storybook/react-vite';

import { Surface } from './surface.js';

const meta = {
  title: 'Primitives/Surface',
  component: Surface,
  args: {
    children: 'Нейтральная поверхность не содержит бизнес-логики.',
  },
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Surface>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Raised: Story = {
  args: { elevation: 'raised' },
};

export const LongText: Story = {
  args: {
    children:
      'Длинный русский текст проверяет переносы, читаемость и отсутствие предположений о коротких английских подписях в будущих интерфейсах.',
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '320px' }}>
        <Story />
      </div>
    ),
  ],
};
