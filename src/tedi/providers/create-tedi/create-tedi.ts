import type { App } from 'vue';

import { createBreakpoints } from '../breakpoint-provider/breakpoint';
import { createLabels, type TediLabelsOptions, type TediLabelsState } from '../label-provider/labels';

/**
 * App-level settings. Each feature (labels; theme later) defines its own options and the plugin
 * combines them: `extends TediLabelsOptions, TediThemeOptions`.
 */
export interface TediOptions extends TediLabelsOptions {
  /**
   * Saves changes in cookies (`tedi-lang`) in the browser, so the server can render the same state on the next
   * request. Turn it off when the app stores the settings itself.
   * @default true
   */
  persist?: boolean;
}

/** The installed plugin. Exposes each feature's state for code outside components (e.g. a router guard). */
export interface TediPlugin extends TediLabelsState {
  install: (app: App) => void;
}

/**
 * Installs TEDI's app-level settings: `app.use(createTedi({ locale: 'en' }))`. Every feature keeps its state in
 * the app (`provide` with its own `InjectionKey`), so each server-rendered request gets its own. Without the
 * plugin, components use the defaults (Estonian texts) and keep their own breakpoint listeners.
 *
 * A feature plugs in with a `create<Feature>(options)` that returns `{ state, install }`: spread its `state`
 * into the plugin and call its `install` below.
 */
export const createTedi = (options: TediOptions = {}): TediPlugin => {
  const { persist = true } = options;
  const labels = createLabels(options);
  const breakpoints = createBreakpoints();
  return {
    ...labels.state,
    install(app) {
      labels.install(app, persist);
      breakpoints.install(app);
    },
  };
};
