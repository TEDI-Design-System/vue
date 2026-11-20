import { afterEach, describe, expect, it, vi } from 'vitest';
import { createApp, nextTick, ref } from 'vue';

import { persistInCookie, writeCookie } from './cookie';

const Root = { render: () => null };

const clearCookie = (name: string) => {
  document.cookie = `${name}=; path=/; max-age=0`;
};

describe('writeCookie', () => {
  afterEach(() => clearCookie('tedi-test'));

  it('writes an encoded value for the whole site', () => {
    const set = vi.spyOn(document, 'cookie', 'set');

    writeCookie('tedi-test', 'a b');

    expect(set).toHaveBeenCalledWith('tedi-test=a%20b; path=/; max-age=2592000; samesite=lax');
    expect(document.cookie).toContain('tedi-test=a%20b');
    set.mockRestore();
  });
});

describe('persistInCookie', () => {
  afterEach(() => {
    clearCookie('tedi-test');
    vi.unstubAllGlobals();
  });

  it('writes on change only, until the app unmounts', async () => {
    const app = createApp(Root);
    const source = ref('et');
    persistInCookie(app, 'tedi-test', source);
    app.mount(document.createElement('div'));

    await nextTick();
    expect(document.cookie).not.toContain('tedi-test');

    source.value = 'en';
    await nextTick();
    expect(document.cookie).toContain('tedi-test=en');

    app.unmount();
    source.value = 'ru';
    await nextTick();
    expect(document.cookie).toContain('tedi-test=en');
  });

  it('renews an existing cookie at startup', () => {
    document.cookie = 'tedi-test=et; path=/';
    const set = vi.spyOn(document, 'cookie', 'set');

    persistInCookie(createApp(Root), 'tedi-test', ref('en'));

    expect(set).toHaveBeenCalledWith('tedi-test=en; path=/; max-age=2592000; samesite=lax');
    set.mockRestore();
  });

  it('does nothing on the server', async () => {
    const app = createApp(Root);
    const onUnmount = vi.spyOn(app, 'onUnmount');
    const source = ref('et');
    vi.stubGlobal('document', undefined);

    persistInCookie(app, 'tedi-test', source);
    source.value = 'en';
    await nextTick();

    vi.unstubAllGlobals();
    expect(onUnmount).not.toHaveBeenCalled();
    expect(document.cookie).not.toContain('tedi-test');
  });
});
