import { mount, type VueWrapper } from '@vue/test-utils';
import { describe, expect, expectTypeOf, it } from 'vitest';
import { createSSRApp, defineComponent, h, nextTick, type Ref, ref } from 'vue';
import { renderToString } from 'vue/server-renderer';

import { createTedi } from '../create-tedi';

import { type TediLabelsComposable, useTediLabels } from './labels';
import type { TediLabels, TediLanguage } from './labels-map';
import TediLabelProvider from './TediLabelProvider.vue';

/** Renders `t(key, ...args)` and exposes the composable for assertions. */
const Probe = defineComponent({
  props: { labelKey: { type: String, default: 'scroll-fade.label' }, args: { type: Array, default: () => [] } },
  setup(props, { expose }) {
    const labels = useTediLabels();
    expose(labels);
    return () => h('span', labels.t(props.labelKey, ...props.args));
  },
});

const mountProbe = (
  options: { tedi?: Parameters<typeof createTedi>[0]; provider?: { locale?: TediLanguage; labels?: TediLabels } } = {},
  probeProps: Record<string, unknown> = {},
) => {
  const probe = () => h(Probe, probeProps);
  return mount(() => (options.provider ? h(TediLabelProvider, options.provider, probe) : probe()), {
    global: { plugins: options.tedi ? [createTedi(options.tedi)] : [] },
  });
};

const probeOf = (wrapper: VueWrapper) => wrapper.findComponent(Probe).vm as unknown as TediLabelsComposable;

describe('useTediLabels', () => {
  it('falls back to the built-in Estonian texts without setup', () => {
    const wrapper = mountProbe();

    expect(wrapper.text()).toBe('Keritav sisu');
    expect(probeOf(wrapper).locale).toBe('et');
  });

  it('ignores setLocale without setup', async () => {
    const wrapper = mountProbe();

    probeOf(wrapper).setLocale('en');
    await nextTick();

    expect(wrapper.text()).toBe('Keritav sisu');
  });

  it('returns the key when no text exists', () => {
    expect(mountProbe({}, { labelKey: 'missing.key' }).text()).toBe('missing.key');
  });

  it('ignores keys inherited from Object.prototype', () => {
    expect(mountProbe({}, { labelKey: 'toString' }).text()).toBe('toString');
    expect(mountProbe({ tedi: { labels: {} } }, { labelKey: 'toString' }).text()).toBe('toString');
    expect(mountProbe({ provider: { labels: {} } }, { labelKey: 'hasOwnProperty' }).text()).toBe('hasOwnProperty');
  });

  it('types built-in keys and their arguments', () => {
    const { t } = mount(Probe).vm as unknown as TediLabelsComposable;

    expectTypeOf(t).toBeCallableWith('scroll-fade.label');
    expectTypeOf(t).toBeCallableWith('custom.key', 1, 'two');
    // @ts-expect-error a string label takes no arguments
    t('scroll-fade.label', 1);
  });
});

describe('createTedi', () => {
  it('uses the configured locale', () => {
    expect(mountProbe({ tedi: { locale: 'en' } }).text()).toBe('Scrollable content');
  });

  it('defaults to Estonian', () => {
    expect(mountProbe({ tedi: {} }).text()).toBe('Keritav sisu');
  });

  it('switches the locale with setLocale on the plugin', async () => {
    const tedi = createTedi();
    const wrapper = mount(Probe, { global: { plugins: [tedi] } });

    tedi.setLocale('ru');
    await nextTick();

    expect(wrapper.text()).toBe('Прокручиваемая область');
  });

  it('switches the locale with setLocale from a component', async () => {
    const tedi = createTedi();
    const wrapper = mount(Probe, { global: { plugins: [tedi] } });

    probeOf(wrapper).setLocale('en');
    await nextTick();

    expect(wrapper.text()).toBe('Scrollable content');
    expect(tedi.locale.value).toBe('en');
  });

  it('uses a locale ref passed in, e.g. one derived from vue-i18n', async () => {
    const locale = ref<TediLanguage>('et');
    const tedi = createTedi({ locale });
    const wrapper = mount(Probe, { global: { plugins: [tedi] } });

    expect(tedi.locale).toBe(locale);
    locale.value = 'en';
    await nextTick();
    expect(wrapper.text()).toBe('Scrollable content');

    tedi.setLocale('ru');
    expect(locale.value).toBe('ru');
  });

  it('falls back to Estonian when a shared locale ref holds an unsupported language', () => {
    // e.g. vue-i18n's locale cast to TediLanguage in an app that also supports Finnish
    const locale = ref('fi') as unknown as Ref<TediLanguage>;
    const wrapper = mount(Probe, { global: { plugins: [createTedi({ locale })] } });

    expect(wrapper.text()).toBe('Keritav sisu');
  });

  it('falls back to Estonian when an added key has no text in the current language', () => {
    const labels: TediLabels = { 'app.title': { et: 'Pealkiri' } };

    expect(mountProbe({ tedi: { locale: 'en', labels } }, { labelKey: 'app.title' }).text()).toBe('Pealkiri');
  });

  it('overrides a text for every language', () => {
    const wrapper = mountProbe({ tedi: { locale: 'en', labels: { 'scroll-fade.label': 'Content' } } });

    expect(wrapper.text()).toBe('Content');
  });

  it('overrides a text per language and keeps the built-in text for the others', async () => {
    const tedi = createTedi({ locale: 'en', labels: { 'scroll-fade.label': { en: 'Scrolling area' } } });
    const wrapper = mount(Probe, { global: { plugins: [tedi] } });

    expect(wrapper.text()).toBe('Scrolling area');
    tedi.setLocale('et');
    await nextTick();
    expect(wrapper.text()).toBe('Keritav sisu');
  });

  it('adds new keys, including functions with arguments', () => {
    const labels: TediLabels = { 'app.files': { en: (count: number) => `${count} files` } };
    const wrapper = mountProbe({ tedi: { locale: 'en', labels } }, { labelKey: 'app.files', args: [3] });

    expect(wrapper.text()).toBe('3 files');
  });

  it('keeps state per app when rendered on the server', async () => {
    const render = (locale: TediLanguage) => {
      const app = createSSRApp(Probe);
      app.use(createTedi({ locale }));
      return renderToString(app);
    };

    const [et, en] = await Promise.all([render('et'), render('en')]);

    expect(et).toBe('<span>Keritav sisu</span>');
    expect(en).toBe('<span>Scrollable content</span>');
  });
});

describe('TediLabelProvider', () => {
  it('renders its slot without a wrapper element', () => {
    const wrapper = mountProbe({ provider: {} });

    expect(wrapper.html()).toBe('<span>Keritav sisu</span>');
  });

  it('inherits the locale and labels of createTedi', () => {
    const wrapper = mountProbe(
      { tedi: { locale: 'en', labels: { close: 'Dismiss' } }, provider: {} },
      { labelKey: 'close' },
    );

    expect(wrapper.text()).toBe('Dismiss');
  });

  it('overrides the locale for its subtree', () => {
    expect(mountProbe({ tedi: { locale: 'en' }, provider: { locale: 'ru' } }).text()).toBe('Прокручиваемая область');
  });

  it('overrides labels and falls back to the enclosing ones per language', () => {
    const wrapper = mountProbe({
      tedi: { locale: 'en', labels: { 'scroll-fade.label': { en: 'Outer' } } },
      provider: { labels: { 'scroll-fade.label': { ru: 'Inner' } } },
    });

    expect(wrapper.text()).toBe('Outer');
  });

  it('nests providers', () => {
    const wrapper = mount(() =>
      h(TediLabelProvider, { locale: 'en', labels: { close: 'Outer close' } }, () =>
        h(TediLabelProvider, { labels: { 'scroll-fade.label': 'Inner' } }, () => [
          h(Probe),
          h(Probe, { labelKey: 'close' }),
        ]),
      ),
    );

    expect(wrapper.text()).toBe('InnerOuter close');
    expect(probeOf(wrapper).locale).toBe('en');
  });

  it('reacts to prop changes', async () => {
    const locale = ref<TediLanguage>('et');
    const labels = ref<TediLabels>({});
    const wrapper = mount(() => h(TediLabelProvider, { locale: locale.value, labels: labels.value }, () => h(Probe)));

    locale.value = 'en';
    await nextTick();
    expect(wrapper.text()).toBe('Scrollable content');

    labels.value = { 'scroll-fade.label': 'Changed' };
    await nextTick();
    expect(wrapper.text()).toBe('Changed');
  });

  it('keeps its own locale after setLocale when not bound with v-model', async () => {
    const tedi = createTedi({ locale: 'et' });
    const wrapper = mount(() => h(TediLabelProvider, null, () => h(Probe)), { global: { plugins: [tedi] } });

    probeOf(wrapper).setLocale('en');
    await nextTick();

    expect(wrapper.text()).toBe('Scrollable content');
    expect(tedi.locale.value).toBe('et');
  });

  it('updates v-model:locale on setLocale', async () => {
    const locale = ref<TediLanguage>('et');
    const wrapper = mount(() =>
      h(
        TediLabelProvider,
        {
          locale: locale.value,
          'onUpdate:locale': (value: TediLanguage | undefined) => {
            if (value) locale.value = value;
          },
        },
        () => h(Probe),
      ),
    );

    probeOf(wrapper).setLocale('ru');
    await nextTick();

    expect(locale.value).toBe('ru');
    expect(wrapper.text()).toBe('Прокручиваемая область');
  });
});
