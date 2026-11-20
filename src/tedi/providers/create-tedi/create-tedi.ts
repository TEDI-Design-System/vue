import type { App } from 'vue';

import { createLabels, type TediLabelsOptions, type TediLabelsState } from '../label-provider/labels';
import { createTheme, type TediThemeOptions, type TediThemeState } from '../theme-provider/theme';

/**
 * App-level settings. Each feature (labels, theme; breakpoints later) defines its own options and the plugin
 * combines them.
 */
export interface TediOptions extends TediLabelsOptions, TediThemeOptions {
  /**
   * Saves changes in cookies (`tedi-lang`, `tedi-theme`) in the browser, so the server can render the same state on
   * the next request. Turn it off when the app stores the settings itself.
   * @default true
   */
  persist?: boolean;
}

/** The installed plugin. Exposes each feature's state for code outside components (e.g. a router guard). */
export interface TediPlugin extends TediLabelsState, TediThemeState {
  install: (app: App) => void;
}

/**
 * Installs TEDI's app-level settings: `app.use(createTedi({ locale: 'en', theme: 'dark' }))`. Every feature keeps
 * its state in the app (`provide` with its own `InjectionKey`), so each server-rendered request gets its own.
 * Without the plugin, components use the defaults (Estonian texts, the `default` theme).
 *
 * A feature plugs in with a `create<Feature>(options)` that returns `{ state, install }`: spread its `state`
 * into the plugin and call its `install` below.
 */
export const createTedi = (options: TediOptions = {}): TediPlugin => {
  const { persist = true } = options;
  const labels = createLabels(options);
  const theme = createTheme(options);
  return {
    ...labels.state,
    ...theme.state,
    install(app) {
      labels.install(app, persist);
      theme.install(app, persist);
    },
  };
};
