import type { Meta, StoryObj } from '@storybook/vue3-vite';

import TediColorTokens from './TediColorTokens.vue';

const meta = {
  title: 'Documentation/Colors',
  component: TediColorTokens,
  // Rendered by colors.mdx, not listed in the sidebar on their own.
  tags: ['!dev', '!autodocs'],
  // Documentation, not a component: kept out of the axe review.
  parameters: { controls: { disable: true }, a11y: { test: 'off' } },
} satisfies Meta<typeof TediColorTokens>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BrandColors: Story = {
  args: { families: ['primary', 'accent'], main: ['tedi-primary-600', 'tedi-accent-600'] },
};

export const BaseColors: Story = {
  args: { families: ['blue', 'green', 'neutral', 'orange', 'red', 'yellow', 'alpha'] },
};
