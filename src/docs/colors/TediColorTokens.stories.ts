import type { Meta, StoryObj } from '@storybook/vue3-vite';

import TediColorTokens from './TediColorTokens.vue';

const meta = {
  title: 'Documentation/Colors',
  component: TediColorTokens,
  // Rendered by colors.mdx, not listed in the sidebar on their own.
  tags: ['!dev', '!autodocs'],
  parameters: { controls: { disable: true } },
} satisfies Meta<typeof TediColorTokens>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BrandColors: Story = {
  args: { families: ['primary', 'accent'], main: ['tedi-primary-600', 'tedi-accent-600'] },
};

export const BaseColors: Story = {
  args: { families: ['blue', 'green', 'neutral', 'orange', 'red', 'yellow', 'alpha'] },
};
