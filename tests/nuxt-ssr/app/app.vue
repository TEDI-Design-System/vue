<script setup lang="ts">
import { TediIcon } from '@tedi-design-system/vue/tedi';
</script>

<template>
  <main>
    <TediIcon name="home" data-ssr-smoke="decorative" />
    <TediIcon name="info" label="Information" color="brand" :size="24" data-ssr-smoke="labelled" />
  </main>
</template>
