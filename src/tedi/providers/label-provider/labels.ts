import { type App, computed, type InjectionKey, inject, isRef, type Ref, ref } from 'vue';

import { persistInCookie } from '../../utils/cookie';

import {
  type TediLabelArgs,
  type TediLabelKey,
  type TediLabels,
  tediLabelsMap,
  type TediLabelValue,
  type TediLanguage,
} from './labels-map';

export interface TediLabelsContext {
  locale: Readonly<Ref<TediLanguage>>;
  setLocale: (locale: TediLanguage) => void;
  /** The text for `key` in `locale`, or `undefined` when no level of the chain has one. */
  resolve: (key: string, locale: TediLanguage) => TediLabelValue | undefined;
}

export const TEDI_LABELS_KEY: InjectionKey<TediLabelsContext> = Symbol('TediLabels');

/** Looks `key` up in `labels`, then in `parent` (the enclosing provider, or the built-in map at the root). */
export const createLabelResolver =
  (labels: () => TediLabels | undefined, parent: TediLabelsContext['resolve']): TediLabelsContext['resolve'] =>
  (key, locale) => {
    const overrides = labels();
    // Own keys only: `toString` and friends come from Object.prototype.
    const override = overrides && Object.hasOwn(overrides, key) ? overrides[key] : undefined;
    const value = typeof override === 'object' ? override[locale] : override;
    return value ?? parent(key, locale);
  };

const resolveBuiltIn: TediLabelsContext['resolve'] = (key, locale) =>
  Object.hasOwn(tediLabelsMap, key) ? tediLabelsMap[key as TediLabelKey][locale] : undefined;

export interface TediLabelsOptions {
  /**
   * Language of the component texts: `et`, `en` or `ru`. A ref passed in stays the source of truth, e.g. one
   * derived from vue-i18n's locale; `setLocale` writes to it. In the browser, changes are saved in the
   * `tedi-lang` cookie (unless `persist` is off); read it on the server and pass it in here.
   * @default 'et'
   */
  locale?: TediLanguage | Ref<TediLanguage>;
  /** Texts that override the built-in ones, per key and optionally per language. */
  labels?: TediLabels;
}

/** The labels part of the `createTedi` plugin. */
export interface TediLabelsState {
  /** The app's locale. */
  locale: Readonly<Ref<TediLanguage>>;
  /** Changes the app's locale, for code outside components (e.g. a router guard). */
  setLocale: (locale: TediLanguage) => void;
}

/** Same cookie name as the angular library, so the choice carries over between TEDI apps. */
export const TEDI_LANG_COOKIE = 'tedi-lang';

/** App-level labels state, installed by `createTedi`. */
export const createLabels = ({ locale = 'et', labels }: TediLabelsOptions = {}) => {
  const localeRef = isRef(locale) ? locale : ref(locale);
  const setLocale = (value: TediLanguage) => {
    localeRef.value = value;
  };
  const state: TediLabelsState = { locale: localeRef, setLocale };
  const install = (app: App, persist: boolean) => {
    app.provide(TEDI_LABELS_KEY, { ...state, resolve: createLabelResolver(() => labels, resolveBuiltIn) });
    if (persist) persistInCookie(app, TEDI_LANG_COOKIE, localeRef);
  };
  return { state, install };
};

/** The nearest provider's context, or the built-in Estonian texts when nothing is installed. */
export const injectLabelsContext = (): TediLabelsContext =>
  inject(TEDI_LABELS_KEY, null) ?? {
    locale: computed<TediLanguage>(() => 'et'),
    // Without createTedi or a provider there is no state to change.
    setLocale: () => {},
    resolve: resolveBuiltIn,
  };

/**
 * Built-in keys are type checked, with the arguments of function labels after the key. Keys added through
 * `labels` take any arguments.
 */
export interface TediTranslate {
  <TKey extends TediLabelKey>(key: TKey, ...args: TediLabelArgs<TKey>): string;
  <TKey extends string>(key: TKey & (TKey extends TediLabelKey ? never : unknown), ...args: unknown[]): string;
}

export interface TediLabelsComposable {
  /**
   * Returns the text for `key` in the current locale, else the Estonian text, else `key` itself. Reactive.
   */
  t: TediTranslate;
  /** The current locale. */
  locale: Readonly<Ref<TediLanguage>>;
  /**
   * Changes the locale of the nearest `TediLabelProvider` (its `v-model:locale`), or else of the app set up with
   * `createTedi`. Does nothing without either.
   */
  setLocale: (locale: TediLanguage) => void;
}

/**
 * Component texts in the current locale. Call it in `setup`. Without `createTedi` or a `TediLabelProvider`, the
 * built-in Estonian texts are used.
 */
export const useTediLabels = (): TediLabelsComposable => {
  const context = injectLabelsContext();

  const t: TediTranslate = (key: string, ...args: unknown[]) => {
    // A locale ref shared with vue-i18n can hold a language TEDI has no texts for (e.g. `fi`): use Estonian
    // rather than reading the raw key out to screen readers.
    const value = context.resolve(key, context.locale.value) ?? context.resolve(key, 'et');
    if (value === undefined) return key;
    return typeof value === 'function' ? (value as (...args: unknown[]) => string)(...args) : value;
  };

  return { t, locale: computed(() => context.locale.value), setLocale: context.setLocale };
};
