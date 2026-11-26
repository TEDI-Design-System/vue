import type { Meta, StoryObj } from '@storybook/vue3-vite';

import TediStatusIndicator, {
  type TediStatusIndicatorSize,
  type TediStatusIndicatorType,
} from './TediStatusIndicator.vue';

/**
 * <a href="https://www.figma.com/design/jWiRIXhHRxwVdMSimKX2FF/TEDI-READY-2.38.59?node-id=2405-53326&m=dev" target="_BLANK">Figma ↗</a>
 */
const meta = {
  title: 'TEDI-Ready/Components/Helpers/StatusIndicator',
  component: TediStatusIndicator,
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/jWiRIXhHRxwVdMSimKX2FF/TEDI-READY-2.38.59?node-id=2405-53326&m=dev',
    },
  },
} satisfies Meta<typeof TediStatusIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

const types: TediStatusIndicatorType[] = ['success', 'danger', 'warning', 'inactive'];
const sizes: TediStatusIndicatorSize[] = ['sm', 'lg'];
const rows = [
  ...sizes.map((size) => ({ size, hasBorder: false, label: size === 'sm' ? 'Small' : 'Large' })),
  ...sizes.map((size) => ({ size, hasBorder: true, label: size === 'sm' ? 'Small bordered' : 'Large bordered' })),
];

export const Default: Story = {
  args: {
    type: 'success',
    size: 'sm',
    hasBorder: false,
  },
};

// Plain flex rows stand in for react's Row/Col and Text until the vue grid and Text exist.
export const AllVariants: Story = {
  render: () => ({
    components: { TediStatusIndicator },
    setup: () => ({ rows, types }),
    template: `
      <div>
        <div v-for="row in rows" :key="row.label" class="padding-14-16" style="display: flex; gap: 1.5rem;">
          <div class="flex align-items-center" style="flex: 0 0 16.6667%;"><strong>{{ row.label }}</strong></div>
          <div class="flex align-items-center gap-3">
            <TediStatusIndicator v-for="type in types" :key="type" :type="type" :size="row.size" :has-border="row.hasBorder" />
          </div>
        </div>
      </div>
    `,
  }),
};

export const Examples: Story = {
  render: () => ({
    components: { TediStatusIndicator },
    template: `
      <span style="position: relative;">
        Lugemata teated&nbsp;
        <TediStatusIndicator type="danger" position="top-right" />
      </span>
    `,
  }),
};
