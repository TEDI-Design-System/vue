<script setup lang="ts">
import { computed } from 'vue';

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

const props = withDefaults(defineProps<TediIconProps>(), {
  type: 'outlined',
  size: 24,
  filled: false,
  color: 'primary',
  label: undefined,
  background: undefined,
  display: 'block',
});

const wrapperClasses = computed(() => [
  'tedi-icon__wrapper',
  'tedi-icon__wrapper--bg',
  `tedi-icon__wrapper--bg-${props.background}`,
  `tedi-icon__wrapper--size-${props.size}`,
  'tedi-icon__wrapper--block',
]);

const iconClasses = computed(() => [
  'notranslate',
  'material-symbols',
  `material-symbols--${props.type}`,
  'tedi-icon',
  `tedi-icon--color-${props.color}`,
  `tedi-icon--size-${props.size}`,
  `tedi-icon--${props.background ? 'block' : props.display}`,
  { 'tedi-icon--filled': props.filled },
]);

const a11yAttrs = computed(() =>
  props.label ? { role: 'img', 'aria-label': props.label } : { 'aria-hidden': 'true' as const },
);
</script>

<template>
  <div v-if="background" :class="wrapperClasses">
    <span :class="iconClasses" data-name="icon" v-bind="a11yAttrs">{{ name }}</span>
  </div>
  <span v-else :class="iconClasses" data-name="icon" v-bind="a11yAttrs">{{ name }}</span>
</template>
