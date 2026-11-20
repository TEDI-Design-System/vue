<script setup lang="ts">
import { TediIcon, useTediBreakpoint, useTediLabels } from '@tedi-design-system/vue/tedi';

const { t, locale } = useTediLabels();
const { breakpoint, resolve } = useTediBreakpoint();
const size = resolve({ xs: 'small', md: 'large' });
</script>

<template>
  <main>
    <TediIcon name="home" data-ssr-smoke="decorative" />
    <TediIcon name="info" label="Information" color="brand" :size="24" data-ssr-smoke="labelled" />
    <span :lang="locale" data-ssr-smoke="label">{{ t('close') }}</span>
    <span data-ssr-smoke="breakpoint">{{ breakpoint ?? 'none' }} {{ size }}</span>
  </main>
</template>
