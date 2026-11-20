import { type App, effectScope, type Ref, watch } from 'vue';

/** 30 days, like the angular library's cookies. */
const MAX_AGE = 60 * 60 * 24 * 30;

/** Writes a first-party cookie for the whole site. Browser only. */
export const writeCookie = (name: string, value: string): void => {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${MAX_AGE}; samesite=lax`;
};

const hasCookie = (name: string): boolean => document.cookie.split('; ').some((c) => c.startsWith(`${name}=`));

/**
 * Saves every change of `source` in the cookie `name`, so the server can read it on the next request and render
 * the same state. Browser only: the server has no `document`, and reading the cookie there is the app's job (it
 * passes the value to `createTedi`). At startup it rewrites the cookie only when one is already set, so each visit
 * renews the 30 days (as angular does) without setting a cookie for users who never chose. The watcher stops when
 * the app unmounts.
 */
export const persistInCookie = (app: App, name: string, source: Readonly<Ref<string>>): void => {
  if (typeof document === 'undefined') return;
  if (hasCookie(name)) writeCookie(name, source.value);
  const scope = effectScope(true);
  scope.run(() => watch(source, (value) => writeCookie(name, value)));
  app.onUnmount(() => scope.stop());
};
