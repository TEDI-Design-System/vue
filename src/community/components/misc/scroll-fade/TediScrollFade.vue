<script setup lang="ts">
import { computed, useTemplateRef } from 'vue';

import { useScrollFade } from './useScrollFade';

import './scroll-fade.scss';

export type TediScrollFadeSize = 0 | 10 | 20;
export type TediScrollFadePosition = 'top' | 'bottom' | 'both';
export type TediScrollFadeScrollBar = 'default' | 'custom';

export interface TediScrollFadeProps {
  /**
   * Height of the fade, in percent of the visible area.
   * @default 20
   */
  fadeSize?: TediScrollFadeSize;
  /**
   * Edges that fade while content is hidden past them.
   * @default 'both'
   */
  fadePosition?: TediScrollFadePosition;
  /**
   * `custom` is a thin TEDI scrollbar in Chromium and Safari; Firefox shows its own either way.
   * @default 'custom'
   */
  scrollBar?: TediScrollFadeScrollBar;
}

defineOptions({ name: 'TediScrollFade', inheritAttrs: false });

const { fadeSize = 20, fadePosition = 'both', scrollBar = 'custom' } = defineProps<TediScrollFadeProps>();

const emit = defineEmits<{
  /** Fired when the content is scrolled to the top, and on mount when it starts there. */
  scrollToTop: [];
  /** Fired when the content is scrolled to the bottom, and on mount when it all fits. */
  scrollToBottom: [];
}>();

defineSlots<{
  /** The scrollable content. */
  default?: () => unknown;
}>();

const scroller = useTemplateRef<HTMLDivElement>('scroller');
const content = useTemplateRef<HTMLDivElement>('content');

const { canScrollUp, canScrollDown, update } = useScrollFade(scroller, content, {
  onScrollToTop: () => emit('scrollToTop'),
  onScrollToBottom: () => emit('scrollToBottom'),
});

const classes = computed(() => [
  'tedi-scroll-fade',
  {
    [`tedi-scroll-fade--top-${fadeSize}`]: canScrollUp.value && fadePosition !== 'bottom',
    [`tedi-scroll-fade--bottom-${fadeSize}`]: canScrollDown.value && fadePosition !== 'top',
  },
]);

const innerClasses = computed(() => [
  'tedi-scroll-fade__inner',
  { 'tedi-scroll-fade__inner--custom-scroll': scrollBar === 'custom' },
]);
</script>

<template>
  <div data-name="scroll-fade" :class="classes">
    <!-- Attributes go to the scroller: it takes focus, so an aria-label names what the user scrolls. -->
    <div ref="scroller" v-bind="$attrs" :class="innerClasses" tabindex="0" role="group" @scroll="update">
      <div ref="content" class="tedi-scroll-fade__content">
        <slot />
      </div>
    </div>
  </div>
</template>
