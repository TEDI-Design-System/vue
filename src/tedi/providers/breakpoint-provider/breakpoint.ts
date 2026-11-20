import {
  type App,
  computed,
  type ComputedRef,
  type InjectionKey,
  inject,
  type MaybeRefOrGetter,
  onBeforeUnmount,
  onMounted,
  type Ref,
  shallowRef,
  toValue,
} from 'vue';

/**
 * Grid breakpoints in `rem`, mirroring core's `$grid-breakpoints`. `rem` (not `px`) keeps them in line with the CSS
 * media queries when the user changes the browser's font size.
 */
export const TEDI_BREAKPOINTS = {
  xs: 0,
  sm: 36,
  md: 48,
  lg: 62,
  xl: 75,
  xxl: 87.5,
} as const;

export type TediBreakpoint = keyof typeof TEDI_BREAKPOINTS;

const ORDER = Object.keys(TEDI_BREAKPOINTS) as TediBreakpoint[];

/** Per-breakpoint values, mobile first: each applies from its breakpoint up. `xs` is the value before mount. */
export type TediBreakpointObject<T> = { xs: T } & Partial<Record<Exclude<TediBreakpoint, 'xs'>, T>>;

/** A prop that can change by viewport: `size="small"` or `:size="{ xs: 'small', md: 'default' }"`. */
export type TediBreakpointValue<T> = T | TediBreakpointObject<T>;

interface BreakpointState {
  breakpoint: Readonly<Ref<TediBreakpoint | undefined>>;
  /** Starts the `matchMedia` listeners. Idempotent, browser only. */
  start: () => void;
  stop: () => void;
}

export const TEDI_BREAKPOINT_KEY: InjectionKey<BreakpointState> = Symbol('TediBreakpoint');

const createBreakpointState = (): BreakpointState => {
  const breakpoint = shallowRef<TediBreakpoint | undefined>();
  let removeListeners: (() => void) | undefined;

  return {
    breakpoint,
    start() {
      // jsdom (and other test environments) has no matchMedia: stay before-mount.
      if (removeListeners || typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
      const queries = ORDER.slice(1).map((bp) => window.matchMedia(`(min-width: ${TEDI_BREAKPOINTS[bp]}rem)`));
      // Queries start at sm, so the number of matches is the index in ORDER (none: xs).
      const update = () => {
        breakpoint.value = ORDER[queries.filter((query) => query.matches).length];
      };
      queries.forEach((query) => query.addEventListener('change', update));
      update();
      removeListeners = () => {
        queries.forEach((query) => query.removeEventListener('change', update));
        removeListeners = undefined;
      };
    },
    stop: () => removeListeners?.(),
  };
};

/**
 * App-level breakpoint state, installed by `createTedi`: one set of `matchMedia` listeners for the app, started
 * when the first component using `useTediBreakpoint` mounts and removed when the app unmounts.
 */
export const createBreakpoints = () => {
  const state = createBreakpointState();
  const install = (app: App) => {
    app.provide(TEDI_BREAKPOINT_KEY, state);
    app.onUnmount(state.stop);
  };
  return { install };
};

const isBreakpointObject = <T>(value: TediBreakpointValue<T>): value is TediBreakpointObject<T> =>
  typeof value === 'object' && value !== null && 'xs' in value;

/** The value that applies at `breakpoint`: the nearest one defined at or below it. Before mount, `xs`. */
export const resolveBreakpointValue = <T>(value: TediBreakpointValue<T>, breakpoint: TediBreakpoint | undefined): T => {
  if (!isBreakpointObject(value)) return value;
  for (let i = breakpoint ? ORDER.indexOf(breakpoint) : 0; i > 0; i--) {
    const candidate = value[ORDER[i] as Exclude<TediBreakpoint, 'xs'>];
    if (candidate !== undefined) return candidate;
  }
  return value.xs;
};

export interface TediBreakpointComposable {
  /**
   * The current breakpoint. `undefined` on the server and until the component mounts, so the server render and
   * hydration match; it updates right after mount.
   */
  breakpoint: Readonly<Ref<TediBreakpoint | undefined>>;
  /** Whether the viewport is at `bp` or wider. `false` before mount. */
  isAbove: (bp: MaybeRefOrGetter<TediBreakpoint>) => ComputedRef<boolean>;
  /** Whether the viewport is narrower than `bp`. `false` before mount. */
  isBelow: (bp: MaybeRefOrGetter<TediBreakpoint>) => ComputedRef<boolean>;
  /** Resolves a `TediBreakpointValue` for the current breakpoint. Before mount, the `xs` value. */
  resolve: <T>(value: MaybeRefOrGetter<TediBreakpointValue<T>>) => ComputedRef<T>;
}

/**
 * The current viewport breakpoint. Call it in `setup`. Without `createTedi`, the component keeps its own listeners.
 * Prefer CSS media queries when the change is only visual: they apply in the server-rendered HTML too.
 */
export const useTediBreakpoint = (): TediBreakpointComposable => {
  const appState = inject(TEDI_BREAKPOINT_KEY, null);
  const state = appState ?? createBreakpointState();

  onMounted(state.start);
  if (!appState) onBeforeUnmount(state.stop);

  const { breakpoint } = state;
  const compare = (bp: MaybeRefOrGetter<TediBreakpoint>, above: boolean) =>
    computed(() => {
      if (!breakpoint.value) return false;
      return ORDER.indexOf(breakpoint.value) >= ORDER.indexOf(toValue(bp)) === above;
    });

  return {
    breakpoint: computed(() => breakpoint.value),
    isAbove: (bp) => compare(bp, true),
    isBelow: (bp) => compare(bp, false),
    resolve: (value) => computed(() => resolveBreakpointValue(toValue(value), breakpoint.value)),
  };
};
