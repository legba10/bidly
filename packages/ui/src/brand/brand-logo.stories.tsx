import type { Meta, StoryObj } from '@storybook/react-vite';

import { BrandLogo } from './brand-logo.js';

const meta = {
  title: 'Brand/BrandLogo',
  component: BrandLogo,
  args: {},
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof BrandLogo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Wordmark: Story = {};

export const Mark: Story = {
  args: { compact: true },
};
