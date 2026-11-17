import type { Meta, StoryObj } from '@storybook/vue3-vite';

import TediIcon, { type TediIconColor, type TediIconProps, type TediIconSize } from './TediIcon.vue';

/**
 * <a href="https://www.figma.com/file/jWiRIXhHRxwVdMSimKX2FF/TEDI-Design-System-(draft)?type=design&node-id=45-30752&mode=dev" target="_blank">Figma ↗</a><br/>
 * <a href="https://www.tedi.ee/1ee8444b7/p/28835d-icon" target="_blank">Zeroheight ↗</a><hr/>
 * <a href="https://fonts.google.com/icons?icon.set=Material+Icons" target="_blank">Official Google Material Icons homepage icons ↗</a><br/>
 * <a href="https://www.figma.com/community/file/1014241558898418245/material-design-icons?searchSessionId=lvxhc4l5-a6" target="_blank">Material Icons Figma ↗</a><br/>
 * <a href="https://www.figma.com/community/plugin/740272380439725040/material-design-icons" target="_blank">Figma Material Symbols plugin ↗</a><hr/>
 *
 * Use a single icon `type` throughout your application. Each type is a separate font file, so import
 * `index-without-icons.css` together with only the style you use (e.g. `icons/outlined.css`) instead of
 * `index.css`.
 */
const meta = {
  title: 'TEDI-Ready/Base/Icon',
  component: TediIcon,
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/jWiRIXhHRxwVdMSimKX2FF/TEDI-Design-System-(draft)?type=design&node-id=45-30752&mode=dev',
    },
  },
  args: {
    name: 'account_circle',
  },
} satisfies Meta<typeof TediIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

const sizes: TediIconSize[] = [8, 12, 16, 18, 24, 36, 48];
const colors: TediIconColor[] = [
  'primary',
  'secondary',
  'tertiary',
  'brand',
  'brand-dark',
  'success',
  'warning',
  'warning-dark',
  'danger',
  'white',
];

// Stand-in for react's Row/Col (bootstrap grid, 1.5rem gutter) until the vue grid exists.
const rowStyle = 'display: flex; flex-wrap: wrap; align-items: center; gap: 1.5rem;';

export const Default: Story = {};

export const Sizes: Story = {
  name: 'Icon Size',
  args: {
    color: 'primary',
  },
  render: (args) => ({
    components: { TediIcon },
    setup: () => ({ args, sizes }),
    template: `
      <div class="example-list w-50">
        <div
          v-for="(size, index) in sizes"
          :key="size"
          style="display: flex"
          :class="['padding-14-16', { 'border-bottom': index !== sizes.length - 1 }]"
        >
          <div class="w-50 flex">
            {{ size }}&nbsp;<small v-if="size === 24" class="example-text--secondary">default</small>
          </div>
          <div class="flex">
            <TediIcon v-bind="args" :size="size" />
            &nbsp;
            <TediIcon v-bind="args" :size="size" filled />
          </div>
        </div>
      </div>
    `,
  }),
};

export const SizesWithBackground: Story = {
  name: 'Icon size inside background',
  render: () => ({
    components: { TediIcon },
    setup: () => ({
      items: [
        { name: 'info', color: 'brand', background: 'brand-secondary', size: 16 },
        { name: 'vaccines', color: 'brand', background: 'brand-secondary', size: 24 },
      ] satisfies TediIconProps[],
    }),
    template: `
      <div class="example-list w-50">
        <div
          v-for="(item, index) in items"
          :key="item.size"
          style="display: flex"
          :class="['padding-14-16', { 'border-bottom': index !== items.length - 1 }]"
        >
          <div class="w-50 flex">
            {{ item.size }}&nbsp;<small v-if="item.size === 24" class="example-text--secondary">default</small>
          </div>
          <div class="flex">
            <TediIcon v-bind="item" />
            &nbsp;
            <TediIcon v-bind="item" filled />
          </div>
        </div>
      </div>
    `,
  }),
};

export const Colors: Story = {
  name: 'Icon colors',
  args: {
    size: 48,
  },
  render: (args) => ({
    components: { TediIcon },
    setup: () => ({ args, colors, rowStyle }),
    template: `
      <div>
        <div>Outlined</div>
        <div :style="rowStyle">
          <div v-for="color in colors" :key="color" :class="{ 'bg bg-primary': color === 'white' }">
            <TediIcon v-bind="args" :color="color" />
          </div>
        </div>
        <div>Filled</div>
        <div :style="rowStyle">
          <div v-for="color in colors" :key="color" :class="{ 'bg bg-primary': color === 'white' }">
            <TediIcon v-bind="args" :color="color" filled />
          </div>
        </div>
      </div>
    `,
  }),
};

export const Backgrounds: Story = {
  name: 'Icon background colors',
  render: () => ({
    components: { TediIcon },
    setup: () => ({ rowStyle }),
    template: `
      <div :style="rowStyle">
        <div :style="rowStyle">
          <TediIcon name="Vaccines" background="brand-primary" color="white" />
          <TediIcon name="Info" background="brand-primary" color="white" :size="16" />
          <TediIcon name="Vaccines" background="brand-secondary" color="brand" />
          <TediIcon name="Info" background="brand-secondary" color="brand" :size="16" />
        </div>
        <div class="bg bg-primary" :style="rowStyle">
          <TediIcon name="Vaccines" background="primary" color="brand" />
          <TediIcon name="Info" background="primary" color="brand" :size="16" />
          <TediIcon name="Vaccines" background="secondary" color="white" />
          <TediIcon name="Info" background="secondary" color="white" :size="16" />
        </div>
      </div>
    `,
  }),
};

export const UsedInsideText: Story = {
  render: (args) => ({
    components: { TediIcon },
    setup: () => ({ args, headings: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }),
    template: `
      <div style="display: flex; flex-direction: column; gap: 0.25rem;">
        <component :is="heading" v-for="(heading, index) in headings" :key="heading">
          <TediIcon :name="args.name" display="inline" />This is level {{ index + 1 }} heading with inline
          <TediIcon color="brand" :name="args.name" display="inline" /> icon
        </component>
        <p>
          <TediIcon :name="args.name" display="inline" />This is paragraph text with inline <TediIcon color="brand" :name="args.name" display="inline" /> icon
        </p>
        <small>
          <TediIcon :name="args.name" display="inline" />This is small text with inline <TediIcon color="brand" :name="args.name" display="inline" /> icon
        </small>
      </div>
    `,
  }),
};
