export type TediLanguage = 'et' | 'en' | 'ru';

/** `(...args: never) => string` is the supertype of every label function, whatever its parameters. */
export type TediLabelValue = string | ((...args: never) => string);

type TediLabelEntry<TValue extends TediLabelValue> = {
  /** What the text is for, shown in the labels table. */
  description: string;
  /** Components that use the text. */
  components: string[];
} & Record<TediLanguage, TValue>;

export type TediLabelKey = keyof typeof tediLabelsMap;

/** The type of a built-in label: `string`, or its function type. */
type TediLabelText<TKey extends TediLabelKey> = (typeof tediLabelsMap)[TKey]['et'] extends string
  ? string
  : (typeof tediLabelsMap)[TKey]['et'];

/** Arguments of a function label, `[]` for a plain string. */
export type TediLabelArgs<TKey extends TediLabelKey> =
  TediLabelText<TKey> extends (...args: infer TArgs) => string ? TArgs : [];

type TediLabelOverride<TValue extends TediLabelValue> = TValue | Partial<Record<TediLanguage, TValue>>;

/**
 * Texts that override the built-in ones or add new keys. A value is one text for every language, or an object
 * with a text per language (languages left out keep the built-in text).
 */
export type TediLabels = {
  [TKey in TediLabelKey]?: TediLabelOverride<TediLabelText<TKey>>;
} & Record<string, TediLabelOverride<TediLabelValue>>;

/** Every language of an entry must have the same type: all strings, or functions with the same parameters. */
const defineLabels = <TMap extends Record<string, TediLabelEntry<TediLabelValue>>>(
  map: TMap & { [TKey in keyof TMap]: TediLabelEntry<TMap[TKey]['et'] extends string ? string : TMap[TKey]['et']> },
): TMap => map;

/**
 * Built-in texts. Keys and texts follow angular's `translations.ts` (and react's `labels-map.ts` where they
 * overlap). Add an entry when a component needs it.
 */
export const tediLabelsMap = defineLabels({
  close: {
    description: 'Used for closing',
    components: [],
    et: 'Sulge',
    en: 'Close',
    ru: 'Закрыть',
  },
  'scroll-fade.label': {
    description: 'Default label for the scrollable region',
    components: ['ScrollFade'],
    et: 'Keritav sisu',
    en: 'Scrollable content',
    ru: 'Прокручиваемая область',
  },
});
