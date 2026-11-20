import { createTedi, type TediLanguage, type TediTheme } from '@tedi-design-system/vue/tedi';

// The setup documented in Get started: the server reads the tedi-lang and tedi-theme cookies from the request.
export default defineNuxtPlugin((nuxtApp) => {
  const lang = useCookie<TediLanguage | undefined>('tedi-lang');
  const theme = useCookie<TediTheme | undefined>('tedi-theme');
  nuxtApp.vueApp.use(createTedi({ locale: lang.value ?? 'et', theme: theme.value ?? 'default' }));
});
