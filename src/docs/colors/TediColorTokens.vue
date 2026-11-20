<script setup lang="ts">
import tokens from '@tedi-design-system/core/tokens.json';
import { computed } from 'vue';

import './color-tokens.scss';

export interface TediColorTokensProps {
  /**
   * Colour families to show, in this order. A family is the name between `tedi-` and the shade,
   * e.g. `primary` lists `--tedi-primary-100` to `--tedi-primary-800`.
   */
  families: string[];
  /**
   * Token names (without `--`) marked as the family's main colour.
   */
  main?: string[];
}

const { families, main = [] } = defineProps<TediColorTokensProps>();

// Base tokens come from core's generated token export, so the page follows the installed core
// version. They are theme-independent: core's dark theme only overrides semantic tokens.
const baseTokens: Record<string, { value: string; resolved: string }> = tokens.themes.default.base;

const groups = computed(() =>
  families.map((family) => {
    const shade = new RegExp(`^tedi-${family}-[a-z]*-?\\d+$`);
    return {
      family,
      colors: Object.entries(baseTokens)
        .filter(([name]) => shade.test(name))
        .map(([name, token]) => ({
          name,
          alias: token.value.startsWith('var(') ? token.value : undefined,
          resolved: token.resolved,
          main: main.includes(name),
        })),
    };
  }),
);
</script>

<template>
  <div class="tedi-color-tokens">
    <section v-for="group in groups" :key="group.family" class="tedi-color-tokens__group">
      <h3 class="tedi-color-tokens__title">{{ group.family }}</h3>
      <ul class="tedi-color-tokens__list">
        <li v-for="color in group.colors" :key="color.name" class="tedi-color-tokens__item">
          <div class="color-card" :style="{ backgroundColor: `var(--${color.name})` }" aria-hidden="true" />
          <strong class="tedi-color-tokens__name">--{{ color.name }}</strong>
          <code v-if="color.alias" class="tedi-color-tokens__value">{{ color.alias }}</code>
          <code class="tedi-color-tokens__value">{{ color.resolved }}</code>
          <span v-if="color.main" class="tedi-color-tokens__main">Main</span>
        </li>
      </ul>
    </section>
  </div>
</template>
