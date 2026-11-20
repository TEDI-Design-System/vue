<script setup lang="ts">
import { TediIcon, useTediLabels } from '@tedi-design-system/vue/tedi';

const { t, locale } = useTediLabels();
</script>

<template>
  <main>
    <TediIcon name="home" data-ssr-smoke="decorative" />
    <TediIcon name="info" label="Information" color="brand" :size="24" data-ssr-smoke="labelled" />
    <span :lang="locale" data-ssr-smoke="label">{{ t('close') }}</span>
  </main>
</template>
