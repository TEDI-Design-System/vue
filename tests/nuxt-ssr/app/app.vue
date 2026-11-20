<script setup lang="ts">
import { TediIcon, useTediLabels, useTediTheme } from '@tedi-design-system/vue/tedi';

const { t, locale } = useTediLabels();
const { theme } = useTediTheme();
useHead({ htmlAttrs: { class: computed(() => `tedi-theme--${theme.value}`) } });
</script>

<template>
  <main>
    <TediIcon name="home" data-ssr-smoke="decorative" />
    <TediIcon name="info" label="Information" color="brand" :size="24" data-ssr-smoke="labelled" />
    <span :lang="locale" data-ssr-smoke="label">{{ t('close') }}</span>
  </main>
</template>
