<script setup lang="ts">
import { computed } from 'vue';

import './status-indicator.scss';

export type TediStatusIndicatorType = 'success' | 'danger' | 'warning' | 'inactive';
export type TediStatusIndicatorSize = 'sm' | 'lg';
export type TediStatusIndicatorPosition = 'default' | 'top-right';

export interface TediStatusIndicatorProps {
  /**
   * The status type, which determines the indicator color.
   * @default 'success'
   */
  type?: TediStatusIndicatorType;
  /**
   * The size of the indicator.
   * @default 'sm'
   */
  size?: TediStatusIndicatorSize;
  /**
   * Whether the indicator has a white border ring.
   * @default false
   */
  hasBorder?: boolean;
  /**
   * Controls positioning of the indicator.
   * - `'default'`: inline, no absolute positioning
   * - `'top-right'`: absolutely positioned at the top-right corner of the parent (give the parent
   *   `position: relative`)
   * @default 'default'
   */
  position?: TediStatusIndicatorPosition;
}

defineOptions({ name: 'TediStatusIndicator' });

const {
  type = 'success',
  size = 'sm',
  hasBorder = false,
  position = 'default',
} = defineProps<TediStatusIndicatorProps>();

const classes = computed(() => [
  'tedi-status-indicator',
  `tedi-status-indicator--${type}`,
  `tedi-status-indicator--${size}`,
  {
    'tedi-status-indicator--bordered': hasBorder,
    'tedi-status-indicator--top-right': position === 'top-right',
  },
]);
</script>

<template>
  <!-- Decorative: the status must also be conveyed in text next to it. -->
  <span data-name="status-indicator" :class="classes" aria-hidden="true" />
</template>
