<script setup lang="ts">
import { computed } from 'vue';

import './icon.scss';

export type TediIconSize = 8 | 12 | 16 | 18 | 24 | 36 | 48;
export type TediIconType = 'outlined' | 'sharp' | 'rounded';
export type TediIconColor =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'brand'
  | 'brand-dark'
  | 'success'
  | 'warning'
  | 'warning-dark'
  | 'danger'
  | 'white'
  | 'inherit';
export type TediIconBackgroundColor = 'primary' | 'secondary' | 'brand-primary' | 'brand-secondary';
export type TediIconDisplay = 'block' | 'inline';

export interface TediIconProps {
  /**
   * Name of material icon
   * https://fonts.google.com/icons
   */
  name: string;
  /**
   * Type of icon.
   * It is recommended to only use one type throughout your app, and to load only that type's font
   * (`icons/<type>.css` with `index-without-icons.css`) instead of all three via `index.css`.
   * @default 'outlined'
   */
  type?: TediIconType;
  /**
   * Size of the icon
   * @default 24
   */
  size?: TediIconSize;
  /**
   * Render a filled variant of the icon
   * @default false
   */
  filled?: boolean;
  /**
   * Which color the icon should be.
   * Use 'success', 'warning' or 'danger' with caution, usually they should not be in application UI.
   * @default 'primary'
   */
  color?: TediIconColor;
  /**
   * Icon label for screen readers.
   * If omitted then the icon is hidden from screen readers.
   */
  label?: string;
  /**
   * Adds a round background. The icon is then wrapped in a block-level element, and
   * fallthrough attributes (such as `class`) are applied to that wrapper.
   */
  background?: TediIconBackgroundColor;
  /**
   * Type of display. Has no effect when `background` is set.
   * @default 'block'
   */
  display?: TediIconDisplay;
}

defineOptions({ name: 'TediIcon' });

const {
  name,
  type = 'outlined',
  size = 24,
  filled = false,
  color = 'primary',
  label,
  background,
  display = 'block',
} = defineProps<TediIconProps>();

const wrapperClasses = computed(() => [
  'tedi-icon__wrapper',
  'tedi-icon__wrapper--bg',
  `tedi-icon__wrapper--bg-${background}`,
  `tedi-icon__wrapper--size-${size}`,
  'tedi-icon__wrapper--block',
]);

const iconClasses = computed(() => [
  'notranslate',
  'material-symbols',
  `material-symbols--${type}`,
  'tedi-icon',
  `tedi-icon--color-${color}`,
  `tedi-icon--size-${size}`,
  `tedi-icon--${background ? 'block' : display}`,
  { 'tedi-icon--filled': filled },
]);

const a11yAttrs = computed(() => (label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': 'true' as const }));
</script>

<template>
  <div v-if="background" :class="wrapperClasses">
    <span :class="iconClasses" data-name="icon" v-bind="a11yAttrs">{{ name }}</span>
  </div>
  <span v-else :class="iconClasses" data-name="icon" v-bind="a11yAttrs">{{ name }}</span>
</template>
