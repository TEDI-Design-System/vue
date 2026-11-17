import type { Meta, StoryObj } from '@storybook/vue3-vite';

import TediStatusBadge, {
  type TediStatusBadgeColor,
  type TediStatusBadgeSize,
  type TediStatusBadgeStatus,
  type TediStatusBadgeVariant,
} from './TediStatusBadge.vue';

/**
 * <a href="https://www.figma.com/design/jWiRIXhHRxwVdMSimKX2FF/TEDI-READY?node-id=2385-24154&m=dev" target="_BLANK">Figma ↗</a><br/>
 * <a href="https://www.tedi.ee/1ee8444b7/p/764a67-status-badge" target="_BLANK">Zeroheight ↗</a>
 *
 * An icon-only badge has no visible text: give it a `title`, or text nearby, so its meaning is
 * available to everyone.
 */
const meta = {
  title: 'TEDI-Ready/Components/Tag/StatusBadge',
  component: TediStatusBadge,
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/jWiRIXhHRxwVdMSimKX2FF/TEDI-READY?node-id=2385-24154&m=dev',
    },
  },
} satisfies Meta<typeof TediStatusBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

const colors: TediStatusBadgeColor[] = ['neutral', 'brand', 'accent', 'warning', 'danger', 'success'];
const variants: TediStatusBadgeVariant[] = ['filled', 'filled-bordered', 'bordered'];
const statuses: TediStatusBadgeStatus[] = ['inactive', 'success', 'warning', 'danger'];
const sizes: TediStatusBadgeSize[] = ['default', 'large'];
const colorToIconMap: Record<TediStatusBadgeColor, string> = {
  neutral: 'edit',
  brand: 'send',
  accent: 'sync',
  success: 'check',
  danger: 'error',
  warning: 'warning',
  transparent: 'edit',
};
const statusToIconMap: Record<TediStatusBadgeStatus, string> = {
  inactive: 'edit',
  success: 'send',
  warning: 'sync',
  danger: 'error',
};
const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

// Stand-ins for react's Row/Col (bootstrap grid, 1.5rem gutter) and VerticalSpacing until the vue
// layout components exist.
const rowStyle = 'display: flex; flex-wrap: wrap; margin: 0 -0.75rem;';
const spacedRowStyle = `${rowStyle} margin-bottom: 1rem;`;
const labelColStyle = 'flex: 0 0 16.6667%; padding: 0 0.75rem;';
const colStyle = 'padding: 0 0.75rem;';

export const Default: Story = {
  args: {
    color: 'neutral',
    variant: 'filled',
  },
  render: (args) => ({
    components: { TediStatusBadge },
    setup: () => ({ args }),
    template: '<TediStatusBadge v-bind="args">Text</TediStatusBadge>',
  }),
};

export const Sizes: Story = {
  args: {
    color: 'neutral',
  },
  render: (args) => ({
    components: { TediStatusBadge },
    setup: () => ({ args, sizes, capitalize, rowStyle, colStyle }),
    template: `
      <div class="example-list">
        <div
          v-for="(size, index) in sizes"
          :key="size"
          :class="[{ 'border-bottom': index !== sizes.length - 1 }, 'padding-14-16']"
          :style="rowStyle"
        >
          <div :style="colStyle + ' flex: 0 0 50%;'"><p class="text-bold">{{ capitalize(size) }}</p></div>
          <div class="flex gap-2" :style="colStyle + ' flex: 1 0 0%;'">
            <TediStatusBadge v-bind="args" :size="size">Draft</TediStatusBadge>
            <TediStatusBadge v-bind="args" :size="size" status="success">Draft</TediStatusBadge>
          </div>
        </div>
      </div>
    `,
  }),
};

export const Colors: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { TediStatusBadge },
    setup: () => ({ colors, variants, colorToIconMap, capitalize, spacedRowStyle, rowStyle, labelColStyle, colStyle }),
    template: `
      <div class="badge-grid">
        <div
          v-for="(color, index) in colors"
          :key="color"
          :style="index === colors.length - 1 ? rowStyle : spacedRowStyle"
        >
          <div :style="labelColStyle"><strong>{{ capitalize(color) }}</strong></div>
          <template v-for="variant in variants" :key="variant">
            <div :style="colStyle">
              <TediStatusBadge :color="color" :variant="variant">Text</TediStatusBadge>
            </div>
            <div :style="colStyle">
              <TediStatusBadge :color="color" :variant="variant" :icon="colorToIconMap[color]">Text</TediStatusBadge>
            </div>
            <div :style="colStyle">
              <TediStatusBadge :color="color" :variant="variant" :icon="colorToIconMap[color]" />
            </div>
          </template>
        </div>
      </div>
    `,
  }),
};

export const StatusIndicator: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { TediStatusBadge },
    setup: () => ({
      statuses,
      variants,
      statusToIconMap,
      capitalize,
      spacedRowStyle,
      rowStyle,
      labelColStyle,
      colStyle,
    }),
    template: `
      <div class="badge-grid">
        <div
          v-for="(status, index) in statuses"
          :key="status"
          :style="index === statuses.length - 1 ? rowStyle : spacedRowStyle"
        >
          <div :style="labelColStyle"><strong>{{ capitalize(status) }}</strong></div>
          <template v-for="variant in variants" :key="variant">
            <div :style="colStyle">
              <TediStatusBadge color="neutral" :variant="variant" :status="status">Text</TediStatusBadge>
            </div>
            <div :style="colStyle">
              <TediStatusBadge color="neutral" :variant="variant" :icon="statusToIconMap[status]" :status="status">Text</TediStatusBadge>
            </div>
            <div :style="colStyle">
              <TediStatusBadge color="neutral" :variant="variant" :icon="statusToIconMap[status]" :status="status" />
            </div>
          </template>
        </div>
      </div>
    `,
  }),
};
