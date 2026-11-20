import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import { defineComponent, h, nextTick, ref } from 'vue';

import { type TediLanguage, useTediLabels } from '../label-provider';

import { createTedi } from './create-tedi';

const Probe = defineComponent({
  setup(_, { expose }) {
    const labels = useTediLabels();
    expose(labels);
    return () => h('span', labels.t('close'));
  },
});

const clearLangCookie = () => {
  document.cookie = 'tedi-lang=; path=/; max-age=0';
};

describe('createTedi', () => {
  afterEach(clearLangCookie);

  it('exposes the app state', () => {
    const tedi = createTedi({ locale: 'en' });

    expect(tedi.locale.value).toBe('en');
    tedi.setLocale('ru');
    expect(tedi.locale.value).toBe('ru');
  });

  it('provides its state to components', () => {
    const wrapper = mount(Probe, { global: { plugins: [createTedi({ locale: 'en' })] } });

    expect(wrapper.text()).toBe('Close');
  });

  it('does not write the tedi-lang cookie for the initial locale', async () => {
    mount(Probe, { global: { plugins: [createTedi({ locale: 'en' })] } });
    await nextTick();

    expect(document.cookie).not.toContain('tedi-lang');
  });

  it('saves locale changes in the tedi-lang cookie', async () => {
    const tedi = createTedi();
    mount(Probe, { global: { plugins: [tedi] } });

    tedi.setLocale('ru');
    await nextTick();

    expect(document.cookie).toContain('tedi-lang=ru');
  });

  it('saves changes of a locale ref passed in', async () => {
    const locale = ref<TediLanguage>('et');
    mount(Probe, { global: { plugins: [createTedi({ locale })] } });

    locale.value = 'en';
    await nextTick();

    expect(document.cookie).toContain('tedi-lang=en');
  });

  it('does not write the cookie with persist off', async () => {
    const tedi = createTedi({ persist: false });
    mount(Probe, { global: { plugins: [tedi] } });

    tedi.setLocale('ru');
    await nextTick();

    expect(document.cookie).not.toContain('tedi-lang');
  });
});
