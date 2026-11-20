import { createTedi, type TediLanguage } from '@tedi-design-system/vue/tedi';

// The setup documented in Get started: the server reads the tedi-lang cookie from the request.
export default defineNuxtPlugin((nuxtApp) => {
  const lang = useCookie<TediLanguage | undefined>('tedi-lang');
  nuxtApp.vueApp.use(createTedi({ locale: lang.value ?? 'et' }));
});
