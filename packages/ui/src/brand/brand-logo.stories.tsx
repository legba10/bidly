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
  args: { variant: 'mark' },
};

export const OnDark: Story = {
  args: { variant: 'on-dark' },
  decorators: [
    (Story) => (
      <div style={{ background: '#070812', padding: 32 }}>
        <Story />
      </div>
    ),
  ],
};

export const LockupOnDark: Story = {
  args: { variant: 'lockup-on-dark' },
  decorators: [
    (Story) => (
      <div style={{ background: '#070812', padding: 32, width: 560 }}>
        <Story />
      </div>
    ),
  ],
};
