import { mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp, defineComponent, h, nextTick, type PropType, type Ref } from 'vue';

import { createTedi } from '../create-tedi';

import {
  resolveBreakpointValue,
  type TediBreakpoint,
  type TediBreakpointComposable,
  type TediBreakpointValue,
  useTediBreakpoint,
} from './breakpoint';

/** A viewport `width` rem wide: `(min-width: Nrem)` queries match against it and fire `change` on resize. */
const fakeViewport = (initialWidth: number) => {
  let width = initialWidth;
  const queries: { min: number; listeners: Set<() => void> }[] = [];
  const matchMedia = vi.fn((media: string) => {
    const min = Number(/min-width: ([\d.]+)rem/.exec(media)?.[1]);
    const listeners = new Set<() => void>();
    queries.push({ min, listeners });
    return {
      media,
      get matches() {
        return width >= min;
      },
      addEventListener: (_: string, listener: () => void) => listeners.add(listener),
      removeEventListener: (_: string, listener: () => void) => listeners.delete(listener),
    };
  });
  vi.stubGlobal('matchMedia', matchMedia);
  return {
    matchMedia,
    listenerCount: () => queries.reduce((sum, query) => sum + query.listeners.size, 0),
    resize(next: number) {
      const crossed = queries.filter(({ min }) => width >= min !== next >= min);
      width = next;
      crossed.forEach(({ listeners }) => listeners.forEach((listener) => listener()));
    },
  };
};

/** The last mounted Probe's composable, and what each Probe render showed. */
let vm: TediBreakpointComposable & {
  isAboveTarget: Readonly<Ref<boolean>>;
  isBelowMd: Readonly<Ref<boolean>>;
  size: Readonly<Ref<string>>;
};
let renders: string[];

const Probe = defineComponent({
  props: {
    size: { type: [String, Object], default: 'small' },
    target: { type: String as PropType<TediBreakpoint>, default: 'md' },
  },
  setup(props) {
    const bp = useTediBreakpoint();
    vm = {
      ...bp,
      isAboveTarget: bp.isAbove(() => props.target),
      isBelowMd: bp.isBelow('md'),
      size: bp.resolve(() => props.size as TediBreakpointValue<string>),
    };
    const { breakpoint, size } = vm;
    return () => {
      const text = `${breakpoint.value ?? 'none'} ${size.value}`;
      renders.push(text);
      return h('span', text);
    };
  },
});

describe('useTediBreakpoint', () => {
  let viewport: ReturnType<typeof fakeViewport>;

  beforeEach(() => {
    viewport = fakeViewport(50); // md
    renders = [];
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('reads the breakpoint after mount', async () => {
    const wrapper = mount(Probe);
    await nextTick();

    expect(wrapper.text()).toBe('md small');
    expect(vm.isAboveTarget.value).toBe(true);
    expect(vm.isBelowMd.value).toBe(false);
  });

  it('is undefined in the first render, as on the server', async () => {
    mount(Probe);
    await nextTick();

    expect(renders).toEqual(['none small', 'md small']);
  });

  it('follows viewport changes', async () => {
    mount(Probe);
    await nextTick();

    viewport.resize(20);
    await nextTick();
    expect(vm.breakpoint.value).toBe('xs');
    expect(vm.isBelowMd.value).toBe(true);

    viewport.resize(100);
    await nextTick();
    expect(vm.breakpoint.value).toBe('xxl');
    expect(vm.isAboveTarget.value).toBe(true);
  });

  it('resolves breakpoint values mobile first', async () => {
    mount(Probe, { props: { size: { xs: 'small', sm: 'medium', lg: 'large' } } });
    await nextTick();
    expect(vm.size.value).toBe('medium');

    viewport.resize(70);
    await nextTick();
    expect(vm.size.value).toBe('large');

    viewport.resize(10);
    await nextTick();
    expect(vm.size.value).toBe('small');
  });

  it('takes the breakpoint to compare as a getter', async () => {
    const wrapper = mount(Probe);
    await nextTick();
    expect(vm.isAboveTarget.value).toBe(true);

    await wrapper.setProps({ target: 'lg' });
    expect(vm.isAboveTarget.value).toBe(false);
  });

  it('shares one set of listeners per app with createTedi and removes them on unmount', async () => {
    const root = document.createElement('div');
    const app = createApp(() => [h(Probe), h(Probe)]).use(createTedi({ persist: false }));
    app.mount(root);
    await nextTick();

    expect(viewport.matchMedia).toHaveBeenCalledTimes(5);
    expect(root.textContent).toBe('md smallmd small');

    app.unmount();
    expect(viewport.listenerCount()).toBe(0);
  });

  it('keeps per-component listeners without createTedi and removes them on unmount', async () => {
    const first = mount(Probe);
    const second = mount(Probe);
    await nextTick();
    expect(viewport.listenerCount()).toBe(10);

    first.unmount();
    second.unmount();
    expect(viewport.listenerCount()).toBe(0);
  });

  it('stays undefined without matchMedia', async () => {
    vi.stubGlobal('matchMedia', undefined);
    const wrapper = mount(Probe);
    await nextTick();

    expect(wrapper.text()).toBe('none small');
    expect(vm.isAboveTarget.value).toBe(false);
    expect(vm.isBelowMd.value).toBe(false);
  });
});

describe('resolveBreakpointValue', () => {
  it('returns a plain value as is', () => {
    expect(resolveBreakpointValue('a', 'lg')).toBe('a');
  });

  it('uses xs before mount', () => {
    expect(resolveBreakpointValue({ xs: 'a', md: 'b' }, undefined)).toBe('a');
  });

  it('uses the nearest value at or below the breakpoint', () => {
    expect(resolveBreakpointValue({ xs: 'a', md: 'b' }, 'sm')).toBe('a');
    expect(resolveBreakpointValue({ xs: 'a', md: 'b' }, 'md')).toBe('b');
    expect(resolveBreakpointValue({ xs: 'a', md: 'b' }, 'xxl')).toBe('b');
  });

  it('keeps falsy values', () => {
    expect(resolveBreakpointValue({ xs: true, md: false }, 'lg')).toBe(false);
  });
});
