import { type App, computed, effectScope, type InjectionKey, inject, isRef, type Ref, ref, watch } from 'vue';

import { persistInCookie } from '../../utils/cookie';

/**
 * A theme name. `default` and `dark` ship with the library's CSS; any other name is a custom theme whose stylesheet
 * the app loads itself (generated from Figma, scoped to `.tedi-theme--<name>`).
 */
export type TediTheme = 'default' | 'dark' | (string & {});

export interface TediThemeOptions {
  /**
   * The app's theme, applied as the `tedi-theme--<name>` class on `<html>`. A ref passed in stays the source of
   * truth; `setTheme` writes to it. In the browser, changes are saved in the `tedi-theme` cookie (unless `persist`
   * is off); read it on the server and pass it in here.
   * @default 'default'
   */
  theme?: TediTheme | Ref<TediTheme>;
}

/** The theme part of the `createTedi` plugin. */
export interface TediThemeState {
  /** The app's theme. */
  theme: Readonly<Ref<TediTheme>>;
  /** Changes the app's theme, for code outside components. */
  setTheme: (theme: TediTheme) => void;
}

export const TEDI_THEME_KEY: InjectionKey<TediThemeState> = Symbol('TediTheme');

/** Same cookie name as the angular and react libraries, so the choice carries over between TEDI apps. */
export const TEDI_THEME_COOKIE = 'tedi-theme';

/** Core keys the theme tokens off this class prefix on `<html>`. */
export const TEDI_THEME_CLASS_PREFIX = 'tedi-theme--';

/** Leaves exactly one theme class on `<html>`, including replacing one the server rendered. */
const applyThemeClass = (theme: TediTheme) => {
  const { classList } = document.documentElement;
  const stale = [...classList].filter((name) => name.startsWith(TEDI_THEME_CLASS_PREFIX));
  classList.remove(...stale);
  classList.add(`${TEDI_THEME_CLASS_PREFIX}${theme}`);
};

/**
 * Keeps the theme class on `<html>` in sync with `source`, from install on (so a client-only app gets the class
 * before its first paint). Browser only; stops when the app unmounts and leaves the last class in place.
 */
const syncThemeClass = (app: App, source: Readonly<Ref<TediTheme>>) => {
  if (typeof document === 'undefined') return;
  const scope = effectScope(true);
  scope.run(() => watch(source, applyThemeClass, { immediate: true }));
  app.onUnmount(() => scope.stop());
};

/** App-level theme state, installed by `createTedi`. */
export const createTheme = ({ theme = 'default' }: TediThemeOptions = {}) => {
  const themeRef = isRef(theme) ? theme : ref(theme);
  const setTheme = (value: TediTheme) => {
    themeRef.value = value;
  };
  const state: TediThemeState = { theme: themeRef, setTheme };
  const install = (app: App, persist: boolean) => {
    app.provide(TEDI_THEME_KEY, state);
    syncThemeClass(app, themeRef);
    if (persist) persistInCookie(app, TEDI_THEME_COOKIE, themeRef);
  };
  return { state, install };
};

export interface TediThemeComposable {
  /** The current theme. */
  theme: Readonly<Ref<TediTheme>>;
  /** Changes the theme of the app set up with `createTedi`. Does nothing without it. */
  setTheme: (theme: TediTheme) => void;
}

/** The app's theme. Call it in `setup`. Without `createTedi`, the theme is `default` and cannot be changed. */
export const useTediTheme = (): TediThemeComposable => {
  const state = inject(TEDI_THEME_KEY, null);
  if (!state) {
    // Without createTedi there is no state to change.
    return { theme: computed<TediTheme>(() => 'default'), setTheme: () => {} };
  }
  return { theme: computed(() => state.theme.value), setTheme: state.setTheme };
};
