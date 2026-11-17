<script setup lang="ts">
import { computed } from 'vue';

import './feedback-text.scss';

export type TediFeedbackTextType = 'hint' | 'valid' | 'error';
export type TediFeedbackTextPosition = 'left' | 'right';

export interface TediFeedbackTextProps {
  /**
   * Type of the feedback. `valid` and `error` are announced to screen readers immediately
   * (`role="alert"`), `hint` politely when it changes.
   * @default 'hint'
   */
  type?: TediFeedbackTextType;
  /**
   * Alignment of the text. In a row shared with other feedback, `left` fills the free space and
   * `right` takes only its own width.
   * @default 'left'
   */
  position?: TediFeedbackTextPosition;
}

defineOptions({ name: 'TediFeedbackText' });

const { type = 'hint', position = 'left' } = defineProps<TediFeedbackTextProps>();

defineSlots<{
  /** The feedback text. Set an `id` and reference it from the control's `aria-describedby`. */
  default?: () => unknown;
}>();

const classes = computed(() => [
  'tedi-feedback-text',
  `tedi-feedback-text--${type}`,
  `tedi-feedback-text--${position}`,
]);

const isAnnounced = computed(() => type === 'valid' || type === 'error');
</script>

<template>
  <div
    data-name="feedback-text"
    :class="classes"
    :role="isAnnounced ? 'alert' : undefined"
    :aria-live="isAnnounced ? 'assertive' : 'polite'"
  >
    <slot />
  </div>
</template>
