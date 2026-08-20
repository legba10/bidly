import type { Meta, StoryObj } from '@storybook/react-vite';

import { IntegrationUnavailable } from './integration-unavailable.js';

const meta = {
  title: 'Patterns/IntegrationUnavailable',
  component: IntegrationUnavailable,
  args: {
    title: 'Рынок появится после подключения данных',
    detail:
      'Интерфейс не показывает вымышленные торги, цены или доступность до публикации нужного API.',
  },
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof IntegrationUnavailable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
