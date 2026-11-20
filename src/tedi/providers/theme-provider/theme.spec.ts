import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createApp, createSSRApp, defineComponent, h, nextTick, ref } from 'vue';
import { renderToString } from 'vue/server-renderer';

import { createTedi } from '../create-tedi';

import { createTheme, type TediTheme, type TediThemeComposable, useTediTheme } from './theme';

const Probe = defineComponent({
  setup(_, { expose }) {
    const theme = useTediTheme();
    expose(theme);
    return () => h('span', theme.theme.value);
  },
});

const probeOf = (wrapper: ReturnType<typeof mount>) => wrapper.vm as unknown as TediThemeComposable;

const themeClasses = () => [...document.documentElement.classList].filter((name) => name.startsWith('tedi-theme--'));

describe('useTediTheme', () => {
  afterEach(() => {
    document.documentElement.className = '';
    document.cookie = 'tedi-theme=; path=/; max-age=0';
  });

  it('falls back to the default theme without setup', async () => {
    const wrapper = mount(Probe);

    probeOf(wrapper).setTheme('dark');
    await nextTick();

    expect(wrapper.text()).toBe('default');
    expect(themeClasses()).toEqual([]);
  });

  it('reads and changes the theme of createTedi', async () => {
    const tedi = createTedi({ theme: 'dark' });
    const wrapper = mount(Probe, { global: { plugins: [tedi] } });
    expect(wrapper.text()).toBe('dark');

    probeOf(wrapper).setTheme('custom-theme');
    await nextTick();

    expect(wrapper.text()).toBe('custom-theme');
    expect(tedi.theme.value).toBe('custom-theme');
  });

  it('applies the initial theme class on install, replacing a server-rendered one', () => {
    document.documentElement.classList.add('tedi-theme--default', 'app-class');

    mount(Probe, { global: { plugins: [createTedi({ theme: 'dark' })] } });

    expect(themeClasses()).toEqual(['tedi-theme--dark']);
    expect(document.documentElement).toHaveClass('app-class');
  });

  it('keeps exactly one theme class on <html> when the theme changes', async () => {
    const tedi = createTedi();
    mount(Probe, { global: { plugins: [tedi] } });
    expect(themeClasses()).toEqual(['tedi-theme--default']);

    tedi.setTheme('dark');
    await nextTick();

    expect(themeClasses()).toEqual(['tedi-theme--dark']);
  });

  it('follows a theme ref passed in', async () => {
    const theme = ref<TediTheme>('default');
    const tedi = createTedi({ theme });
    mount(Probe, { global: { plugins: [tedi] } });

    theme.value = 'dark';
    await nextTick();
    expect(themeClasses()).toEqual(['tedi-theme--dark']);

    tedi.setTheme('default');
    expect(theme.value).toBe('default');
  });

  it('saves theme changes in the tedi-theme cookie, not the initial theme', async () => {
    const tedi = createTedi({ theme: 'dark' });
    mount(Probe, { global: { plugins: [tedi] } });
    await nextTick();
    expect(document.cookie).not.toContain('tedi-theme');

    tedi.setTheme('default');
    await nextTick();

    expect(document.cookie).toContain('tedi-theme=default');
  });

  it('applies the theme class with persist off', async () => {
    const tedi = createTedi({ theme: 'dark', persist: false });
    mount(Probe, { global: { plugins: [tedi] } });
    expect(themeClasses()).toEqual(['tedi-theme--dark']);

    tedi.setTheme('default');
    await nextTick();

    expect(themeClasses()).toEqual(['tedi-theme--default']);
    expect(document.cookie).not.toContain('tedi-theme');
  });

  it('stops changing the class after the app unmounts and leaves the last one', async () => {
    const theme = createTheme({ theme: 'dark' });
    const app = createApp(Probe);
    theme.install(app, true);
    app.mount(document.createElement('div'));

    app.unmount();
    theme.state.setTheme('default');
    await nextTick();

    expect(themeClasses()).toEqual(['tedi-theme--dark']);
  });

  it('renders on the server without touching the document', async () => {
    vi.stubGlobal('document', undefined);
    const app = createSSRApp(Probe);
    app.use(createTedi({ theme: 'dark' }));

    const html = await renderToString(app);

    vi.unstubAllGlobals();
    expect(html).toBe('<span>dark</span>');
    expect(themeClasses()).toEqual([]);
  });
});
