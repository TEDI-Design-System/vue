<script setup lang="ts">
import { computed } from 'vue';

import TediIcon from '../../base/icon/TediIcon.vue';
import TediStatusIndicator from '../status-indicator/TediStatusIndicator.vue';
import './status-badge.scss';

export type TediStatusBadgeColor = 'neutral' | 'brand' | 'accent' | 'success' | 'danger' | 'warning' | 'transparent';
export type TediStatusBadgeVariant = 'filled' | 'filled-bordered' | 'bordered';
export type TediStatusBadgeSize = 'default' | 'large';
export type TediStatusBadgeStatus = 'danger' | 'success' | 'warning' | 'inactive';

export interface TediStatusBadgeProps {
  /**
   * Specifies the color scheme of the StatusBadge.
   * @default 'neutral'
   */
  color?: TediStatusBadgeColor;
  /**
   * Determines the style or visual type of the StatusBadge.
   * @default 'filled'
   */
  variant?: TediStatusBadgeVariant;
  /**
   * Specifies the size of the StatusBadge.
   * @default 'default'
   */
  size?: TediStatusBadgeSize;
  /**
   * Shows a status indicator in the top right corner of the StatusBadge.
   * The indicator is decorative: convey the status in the text as well.
   */
  status?: TediStatusBadgeStatus;
  /**
   * The name of the icon to be displayed inside the StatusBadge. The icon is rendered using `TediIcon`.
   * Without slot content the badge displays the icon only.
   */
  icon?: string;
  /**
   * Provides the full text or description when the StatusBadge represents an abbreviation.
   * The StatusBadge is then rendered as an `<abbr>` element.
   */
  title?: string;
  /**
   * ARIA role attribute. `status` and `alert` also set the matching `aria-live` politeness
   * (`polite` and `assertive`).
   */
  role?: string;
}

defineOptions({ name: 'TediStatusBadge' });

const {
  color = 'neutral',
  variant = 'filled',
  size = 'default',
  status,
  icon,
  title,
  role,
} = defineProps<TediStatusBadgeProps>();

const slots = defineSlots<{
  /** The content displayed inside the StatusBadge. */
  default?: () => unknown;
}>();

const classes = computed(() => [
  'tedi-status-badge',
  `tedi-status-badge--variant-${variant}`,
  `tedi-status-badge--color-${color}`,
  { 'tedi-status-badge--large': size === 'large' },
]);

const ariaLive = computed(() => {
  if (role === 'alert') return 'assertive';
  if (role === 'status') return 'polite';
  return undefined;
});
</script>

<template>
  <component
    :is="title ? 'abbr' : 'div'"
    :class="[classes, { 'tedi-status-badge__icon-only': icon && !slots.default }]"
    :title="title"
    :role="role"
    :aria-live="ariaLive"
  >
    <TediStatusIndicator
      v-if="status"
      :type="status"
      :size="size === 'large' ? 'lg' : 'sm'"
      has-border
      position="top-right"
    />
    <TediIcon v-if="icon" :name="icon" color="inherit" :size="16" :class="`tedi-status-badge__icon-${color}`" />
    <span v-if="slots.default" class="tedi-status-badge__inner-text"><slot /></span>
  </component>
</template>
