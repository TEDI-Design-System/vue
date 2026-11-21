import { mount, type VueWrapper } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createSSRApp, h, nextTick, ref, type Ref } from 'vue';
import { renderToString } from 'vue/server-renderer';

import TediScrollFade from './TediScrollFade.vue';

// jsdom does no layout: every element reports 0 for its scroll sizes, so the tests set them.
const metrics = { scrollTop: 0, scrollHeight: 0, clientHeight: 0 };

const OVERFLOWING = { scrollHeight: 300, clientHeight: 100 };
const AT_TOP = { ...OVERFLOWING, scrollTop: 0 };
const IN_MIDDLE = { ...OVERFLOWING, scrollTop: 100 };
const AT_BOTTOM = { ...OVERFLOWING, scrollTop: 200 };
const FITS = { scrollTop: 0, scrollHeight: 100, clientHeight: 100 };

const scroller = (wrapper: VueWrapper) => wrapper.find('.tedi-scroll-fade__inner');

const scrollTo = async (wrapper: VueWrapper, position: Partial<typeof metrics>) => {
  Object.assign(metrics, position);
  await scroller(wrapper).trigger('scroll');
};

const mountWithText = (options: Parameters<typeof mount<typeof TediScrollFade>>[1] = {}) =>
  mount(TediScrollFade, { slots: { default: 'Lorem ipsum' }, ...options });

beforeEach(() => {
  Object.assign(metrics, { scrollTop: 0, scrollHeight: 0, clientHeight: 0 });
  (['scrollTop', 'scrollHeight', 'clientHeight'] as const).forEach((property) => {
    vi.spyOn(Element.prototype, property, 'get').mockImplementation(() => metrics[property]);
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('TediScrollFade', () => {
  it('renders a focusable scroll area around the content', () => {
    const wrapper = mountWithText();
    const inner = scroller(wrapper);

    expect(wrapper.attributes('data-name')).toBe('scroll-fade');
    expect(wrapper.classes()).toEqual(['tedi-scroll-fade']);
    expect(inner.classes()).toEqual(['tedi-scroll-fade__inner', 'tedi-scroll-fade__inner--custom-scroll']);
    expect(inner.attributes('tabindex')).toBe('0');
    expect(inner.attributes('role')).toBe('group');
    expect(inner.find('.tedi-scroll-fade__content').text()).toBe('Lorem ipsum');
  });

  it('uses the browser scrollbar when scrollBar is default', () => {
    const wrapper = mountWithText({ props: { scrollBar: 'default' } });

    expect(scroller(wrapper).classes()).toEqual(['tedi-scroll-fade__inner']);
  });

  it('keeps the defaults when the props are passed as undefined', async () => {
    const wrapper = mountWithText({
      props: { fadeSize: undefined, fadePosition: undefined, scrollBar: undefined },
    });

    await scrollTo(wrapper, IN_MIDDLE);

    expect(wrapper.classes()).toEqual(['tedi-scroll-fade', 'tedi-scroll-fade--top-20', 'tedi-scroll-fade--bottom-20']);
    expect(scroller(wrapper).classes()).toContain('tedi-scroll-fade__inner--custom-scroll');
  });

  it.each([
    ['at the top', AT_TOP, ['tedi-scroll-fade--bottom-20']],
    ['in the middle', IN_MIDDLE, ['tedi-scroll-fade--top-20', 'tedi-scroll-fade--bottom-20']],
    ['at the bottom', AT_BOTTOM, ['tedi-scroll-fade--top-20']],
    ['with content that fits', FITS, []],
  ])('fades the edges with hidden content when scrolled %s', async (_, position, fades) => {
    const wrapper = mountWithText();

    await scrollTo(wrapper, position);

    expect(wrapper.classes()).toEqual(['tedi-scroll-fade', ...fades]);
  });

  it.each([
    ['top', ['tedi-scroll-fade--top-20']],
    ['bottom', ['tedi-scroll-fade--bottom-20']],
    ['both', ['tedi-scroll-fade--top-20', 'tedi-scroll-fade--bottom-20']],
  ] as const)('fades only the %s edge when fadePosition is set to it', async (fadePosition, fades) => {
    const wrapper = mountWithText({ props: { fadePosition } });

    await scrollTo(wrapper, IN_MIDDLE);

    expect(wrapper.classes()).toEqual(['tedi-scroll-fade', ...fades]);
  });

  it.each([0, 10, 20] as const)('sizes the fade by fadeSize %s', async (fadeSize) => {
    const wrapper = mountWithText({ props: { fadeSize } });

    await scrollTo(wrapper, IN_MIDDLE);

    expect(wrapper.classes()).toContain(`tedi-scroll-fade--top-${fadeSize}`);
    expect(wrapper.classes()).toContain(`tedi-scroll-fade--bottom-${fadeSize}`);
  });

  it('measures the content on mount', async () => {
    Object.assign(metrics, AT_TOP);

    const wrapper = mountWithText();
    await nextTick();

    expect(wrapper.classes()).toEqual(['tedi-scroll-fade', 'tedi-scroll-fade--bottom-20']);
  });

  it('treats a scroll position within 1px of an edge as the edge', async () => {
    const wrapper = mountWithText();

    await scrollTo(wrapper, { ...OVERFLOWING, scrollTop: 1 });
    expect(wrapper.classes()).not.toContain('tedi-scroll-fade--top-20');

    await scrollTo(wrapper, { ...OVERFLOWING, scrollTop: 199.5 });
    expect(wrapper.classes()).not.toContain('tedi-scroll-fade--bottom-20');
  });

  describe('events', () => {
    it('emits scrollToTop on mount when the content starts at the top', () => {
      Object.assign(metrics, AT_TOP);

      const wrapper = mountWithText();

      expect(wrapper.emitted('scrollToTop')).toHaveLength(1);
      expect(wrapper.emitted('scrollToBottom')).toBeUndefined();
    });

    it('emits both events on mount when the content fits', () => {
      Object.assign(metrics, FITS);

      const wrapper = mountWithText();

      expect(wrapper.emitted('scrollToTop')).toHaveLength(1);
      expect(wrapper.emitted('scrollToBottom')).toHaveLength(1);
    });

    it('emits once on reaching an edge, not on every scroll event there', async () => {
      Object.assign(metrics, AT_TOP);
      const wrapper = mountWithText();

      await scrollTo(wrapper, AT_BOTTOM);
      await scrollTo(wrapper, AT_BOTTOM);
      expect(wrapper.emitted('scrollToBottom')).toHaveLength(1);

      await scrollTo(wrapper, IN_MIDDLE);
      await scrollTo(wrapper, AT_TOP);
      await scrollTo(wrapper, AT_TOP);
      expect(wrapper.emitted('scrollToTop')).toHaveLength(2);
      expect(wrapper.emitted('scrollToBottom')).toHaveLength(1);
    });
  });

  describe('size changes', () => {
    const observe = vi.fn();
    const disconnect = vi.fn();
    let notifyResize: () => void;

    class ResizeObserverStub {
      constructor(callback: () => void) {
        notifyResize = callback;
      }

      observe = observe;
      unobserve = vi.fn();
      disconnect = disconnect;
    }

    beforeEach(() => {
      observe.mockClear();
      disconnect.mockClear();
      vi.stubGlobal('ResizeObserver', ResizeObserverStub);
    });

    it('observes the scroller and the content wrapper', () => {
      const wrapper = mountWithText();

      expect(observe).toHaveBeenCalledTimes(2);
      expect(observe).toHaveBeenCalledWith(scroller(wrapper).element);
      expect(observe).toHaveBeenCalledWith(wrapper.find('.tedi-scroll-fade__content').element);
    });

    it('brings the bottom fade back when content is added below a scroller at the bottom', async () => {
      const wrapper = mountWithText();
      await scrollTo(wrapper, AT_BOTTOM);
      expect(wrapper.classes()).not.toContain('tedi-scroll-fade--bottom-20');

      // The scroller is capped, so only the content grows: the scroll event never fires.
      Object.assign(metrics, { scrollHeight: 400 });
      notifyResize();
      await nextTick();

      expect(wrapper.classes()).toContain('tedi-scroll-fade--bottom-20');
    });

    it('stops observing on unmount', () => {
      const wrapper = mountWithText();

      wrapper.unmount();

      expect(disconnect).toHaveBeenCalledOnce();
    });
  });

  it('still updates on scroll in browsers without ResizeObserver', async () => {
    vi.stubGlobal('ResizeObserver', undefined);
    const wrapper = mountWithText();

    await scrollTo(wrapper, IN_MIDDLE);

    expect(wrapper.classes()).toContain('tedi-scroll-fade--top-20');
  });

  it('keeps class and style on the root, which sits in the consumer layout', async () => {
    const wrapper = mountWithText({ attrs: { class: 'flex-grow-1', style: 'flex-grow: 1;' } });
    const inner = scroller(wrapper);

    await scrollTo(wrapper, IN_MIDDLE);

    expect(wrapper.classes()).toEqual([
      'tedi-scroll-fade',
      'tedi-scroll-fade--top-20',
      'tedi-scroll-fade--bottom-20',
      'flex-grow-1',
    ]);
    expect(wrapper.attributes('style')).toBe('flex-grow: 1;');
    expect(inner.classes()).toEqual(['tedi-scroll-fade__inner', 'tedi-scroll-fade__inner--custom-scroll']);
    expect(inner.attributes('style')).toBeUndefined();
  });

  it('passes other attributes to the scroller, which takes focus', () => {
    const wrapper = mountWithText({
      attrs: { 'aria-label': 'Terms of use', id: 'terms', class: 'flex-grow-1', 'data-test': 'terms' },
    });
    const inner = scroller(wrapper);

    expect(inner.element).toHaveAccessibleName('Terms of use');
    expect(inner.attributes('id')).toBe('terms');
    expect(inner.attributes('data-test')).toBe('terms');
    expect(wrapper.attributes('aria-label')).toBeUndefined();
    expect(wrapper.attributes('id')).toBeUndefined();
    expect(wrapper.attributes('data-test')).toBeUndefined();
  });

  it('passes attributes added after mount to the scroller', async () => {
    // Starts without attributes, so nothing is read from them until they are added.
    const consumerAttrs: Ref<Record<string, string>> = ref({});
    const wrapper = mount(() => h(TediScrollFade, consumerAttrs.value, () => 'Lorem ipsum'));

    consumerAttrs.value = { 'aria-label': 'Terms of use', class: 'flex-grow-1' };
    await nextTick();

    expect(scroller(wrapper).element).toHaveAccessibleName('Terms of use');
    expect(wrapper.classes()).toContain('flex-grow-1');
    expect(scroller(wrapper).classes()).not.toContain('flex-grow-1');
  });

  it('keeps its focusability and role when the consumer passes their own', () => {
    const wrapper = mountWithText({ attrs: { tabindex: '-1', role: 'region' } });

    expect(scroller(wrapper).attributes('tabindex')).toBe('0');
    expect(scroller(wrapper).attributes('role')).toBe('group');
  });

  it("calls the consumer's scroll listener next to its own", async () => {
    const onScroll = vi.fn();
    const wrapper = mountWithText({ attrs: { onScroll } });

    await scrollTo(wrapper, IN_MIDDLE);

    expect(onScroll).toHaveBeenCalledOnce();
    expect(wrapper.classes()).toContain('tedi-scroll-fade--top-20');
  });

  it('renders on the server without measuring', async () => {
    const html = await renderToString(
      createSSRApp({
        render: () => h(TediScrollFade, { 'aria-label': 'Terms of use' }, () => 'Lorem ipsum'),
      }),
    );

    expect(html).toContain('class="tedi-scroll-fade"');
    expect(html).toContain('tedi-scroll-fade__inner--custom-scroll');
    expect(html).toContain('tabindex="0"');
    expect(html).toContain('role="group"');
    expect(html).toContain('aria-label="Terms of use"');
    expect(html).toContain('Lorem ipsum');
  });
});
