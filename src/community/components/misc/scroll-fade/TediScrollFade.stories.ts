import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref, type Ref } from 'vue';

import TediScrollFade from './TediScrollFade.vue';

const loremIpsum = `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
  magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris Lorem ipsum dolor sit amet,
  consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`;

/**
 * <a href="https://www.figma.com/design/jWiRIXhHRxwVdMSimKX2FF/TEDI-READY-(work-in-progress)?node-id=10758-111142&m=dev" target="_BLANK">Figma ↗</a><br/>
 * <a href="https://www.tedi.ee/1ee8444b7/p/32b155-scroll-fade" target="_BLANK">Zeroheight ↗</a>
 *
 * The scroll area takes keyboard focus, and attributes such as `aria-label` go to it: give it an
 * `aria-label` that names the content, or screen readers announce only "group".
 *
 * ScrollFade takes the `max-height` of its parent, so cap the parent's height to make it scroll.
 */
const meta = {
  title: 'Community/Helpers/ScrollFade',
  component: TediScrollFade,
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/jWiRIXhHRxwVdMSimKX2FF/TEDI-READY-(work-in-progress)?node-id=10758-111142&m=dev',
    },
  },
  argTypes: {
    fadeSize: { control: 'radio', options: [0, 10, 20] },
    fadePosition: { control: 'radio', options: ['top', 'bottom', 'both'] },
    scrollBar: { control: 'radio', options: ['default', 'custom'] },
  },
  args: { fadeSize: 20, fadePosition: 'both', scrollBar: 'custom' },
} satisfies Meta<typeof TediScrollFade>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => ({
    components: { TediScrollFade },
    setup: () => ({ args, loremIpsum }),
    template: `
      <div style="max-width: 200px; max-height: 200px;">
        <TediScrollFade v-bind="args" aria-label="Sample text">{{ loremIpsum }}</TediScrollFade>
      </div>
    `,
  }),
};

const renderVariants = (
  prop: 'scrollBar' | 'fadeSize' | 'fadePosition',
  variants: [title: string, value: unknown][],
): Story['render'] => {
  return () => ({
    components: { TediScrollFade },
    setup: () => ({ prop, variants, loremIpsum }),
    template: `
      <div class="flex gap-5">
        <div v-for="[title, value] in variants" :key="title" class="flex flex-column gap-3">
          <strong>{{ title }}</strong>
          <div style="max-width: 200px; max-height: 200px;">
            <TediScrollFade :[prop]="value" :aria-label="title">{{ loremIpsum }}</TediScrollFade>
          </div>
        </div>
      </div>
    `,
  });
};

export const Scrollbar: Story = {
  parameters: { controls: { disable: true } },
  render: renderVariants('scrollBar', [
    ['Default Scrollbar', 'default'],
    ['Custom Scrollbar', 'custom'],
  ]),
};

export const FadeSize: Story = {
  parameters: { controls: { disable: true } },
  render: renderVariants('fadeSize', [
    ['No Fade (0%)', 0],
    ['Small Fade (10%)', 10],
    ['Large Fade (20%)', 20],
  ]),
};

export const FadePosition: Story = {
  parameters: { controls: { disable: true } },
  render: renderVariants('fadePosition', [
    ['Top', 'top'],
    ['Bottom', 'bottom'],
    ['Both', 'both'],
  ]),
};

export const NoFadeWithoutScrollbar: Story = {
  render: (args) => ({
    components: { TediScrollFade },
    setup: () => ({ args, loremIpsum }),
    template: `
      <div style="max-width: 200px; max-height: 400px;">
        <TediScrollFade v-bind="args" aria-label="Sample text">{{ loremIpsum }}</TediScrollFade>
      </div>
    `,
  }),
};

export const DynamicContent: Story = {
  render: (args) => ({
    components: { TediScrollFade },
    setup: () => {
      const items: Ref<number[]> = ref([1, 2, 3, 4, 5, 6]);
      const addItem = (): void => {
        items.value = [...items.value, items.value.length + 1];
      };
      const removeItem = (): void => {
        items.value = items.value.slice(0, -1);
      };

      return { args, items, addItem, removeItem };
    },
    template: `
      <div class="flex flex-column gap-3">
        <div class="flex gap-3">
          <button type="button" @click="addItem">Add item</button>
          <button type="button" @click="removeItem">Remove item</button>
        </div>
        <div style="max-width: 200px; max-height: 150px;">
          <TediScrollFade v-bind="args" aria-label="Items">
            <div class="flex flex-column gap-3">
              <p v-for="item in items" :key="item">Item {{ item }}</p>
            </div>
          </TediScrollFade>
        </div>
      </div>
    `,
  }),
};
