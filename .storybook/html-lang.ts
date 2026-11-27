import { defineComponent, onMounted, watch } from 'vue';

import { useTediLabels } from '../src/tedi/providers/label-provider';

/** Keeps `<html lang>` in sync with the TEDI locale. Renders nothing. */
export const StorybookHtmlLang = defineComponent({
  name: 'StorybookHtmlLang',
  setup() {
    const { locale } = useTediLabels();
    onMounted(() => {
      watch(locale, (value) => (document.documentElement.lang = value), { immediate: true });
    });
    return () => null;
  },
});
