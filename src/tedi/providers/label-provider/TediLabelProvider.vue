<script setup lang="ts">
import { computed, provide } from 'vue';

import { createLabelResolver, injectLabelsContext, TEDI_LABELS_KEY } from './labels';
import type { TediLabels, TediLanguage } from './labels-map';

export interface TediLabelProviderProps {
  /**
   * Texts that override the built-in ones (or those of an enclosing provider), per key and optionally per
   * language.
   */
  labels?: TediLabels;
}

defineOptions({ name: 'TediLabelProvider' });

const props = defineProps<TediLabelProviderProps>();

/**
 * Language of the component texts inside the provider: `et`, `en` or `ru`. Inherited from the enclosing provider
 * or `createTedi` until set. `setLocale` from `useTediLabels` updates it.
 */
const locale = defineModel<TediLanguage>('locale');

defineSlots<{
  /** Content that gets the provider's locale and labels. */
  default?: () => unknown;
}>();

const parent = injectLabelsContext();

provide(TEDI_LABELS_KEY, {
  locale: computed(() => locale.value ?? parent.locale.value),
  setLocale: (value) => {
    locale.value = value;
  },
  resolve: createLabelResolver(() => props.labels, parent.resolve),
});
</script>

<template>
  <slot />
</template>
