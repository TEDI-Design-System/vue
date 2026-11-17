import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { createSSRApp, h } from 'vue';
import { renderToString } from 'vue/server-renderer';

import TediIcon from './TediIcon.vue';

const findIcon = (wrapper: ReturnType<typeof mount>) => wrapper.find('span[data-name="icon"]');

describe('TediIcon', () => {
  it('renders with default props', () => {
    const wrapper = mount(TediIcon, { props: { name: 'add' } });
    const icon = findIcon(wrapper);

    expect(icon.exists()).toBe(true);
    expect(icon.text()).toBe('add');
    expect(icon.classes()).toEqual(
      expect.arrayContaining([
        'notranslate',
        'material-symbols',
        'material-symbols--outlined',
        'tedi-icon',
        'tedi-icon--color-primary',
        'tedi-icon--size-24',
        'tedi-icon--block',
      ]),
    );
    expect(icon.classes()).not.toContain('tedi-icon--filled');
    expect(wrapper.find('div.tedi-icon__wrapper').exists()).toBe(false);
  });

  it('applies fallthrough class to the icon when no background is set', () => {
    const wrapper = mount(TediIcon, { props: { name: 'add' }, attrs: { class: 'custom-class' } });

    expect(findIcon(wrapper).classes()).toContain('custom-class');
  });

  it('applies fallthrough class to the wrapper when background is set', () => {
    const wrapper = mount(TediIcon, {
      props: { name: 'add', background: 'primary' },
      attrs: { class: 'custom-class' },
    });
    const wrapperElement = wrapper.find('div.tedi-icon__wrapper');

    expect(wrapperElement.classes()).toEqual(
      expect.arrayContaining(['custom-class', 'tedi-icon__wrapper--bg', 'tedi-icon__wrapper--bg-primary']),
    );
    expect(findIcon(wrapper).classes()).not.toContain('custom-class');
  });

  it.each([8, 12, 16, 18, 24, 36, 48] as const)('renders size %i', (size) => {
    const wrapper = mount(TediIcon, { props: { name: 'add', size } });

    expect(findIcon(wrapper).classes()).toContain(`tedi-icon--size-${size}`);
  });

  it.each(['outlined', 'sharp', 'rounded'] as const)('renders type %s', (type) => {
    const wrapper = mount(TediIcon, { props: { name: 'add', type } });

    expect(findIcon(wrapper).classes()).toContain(`material-symbols--${type}`);
  });

  it.each(['success', 'brand-dark', 'white', 'inherit'] as const)('renders color %s', (color) => {
    const wrapper = mount(TediIcon, { props: { name: 'add', color } });

    expect(findIcon(wrapper).classes()).toContain(`tedi-icon--color-${color}`);
  });

  it('renders inline display', () => {
    const wrapper = mount(TediIcon, { props: { name: 'add', display: 'inline' } });
    const icon = findIcon(wrapper);

    expect(icon.classes()).toContain('tedi-icon--inline');
    expect(icon.classes()).not.toContain('tedi-icon--block');
  });

  it('renders filled variant', () => {
    const wrapper = mount(TediIcon, { props: { name: 'add', filled: true } });

    expect(findIcon(wrapper).classes()).toContain('tedi-icon--filled');
  });

  it('renders with background color and wrapper size', () => {
    const wrapper = mount(TediIcon, { props: { name: 'add', size: 48, background: 'brand-secondary' } });
    const wrapperElement = wrapper.find('div.tedi-icon__wrapper');

    expect(wrapper.element).toBe(wrapperElement.element);
    expect(wrapperElement.classes()).toEqual(
      expect.arrayContaining([
        'tedi-icon__wrapper--bg',
        'tedi-icon__wrapper--bg-brand-secondary',
        'tedi-icon__wrapper--size-48',
        'tedi-icon__wrapper--block',
      ]),
    );
    expect(findIcon(wrapper).classes()).toContain('tedi-icon--size-48');
  });

  it('forces block display on the icon when background is set', () => {
    const wrapper = mount(TediIcon, {
      // display is ignored with a background, same as react
      props: { name: 'add', background: 'primary', display: 'inline' },
    });

    expect(findIcon(wrapper).classes()).toContain('tedi-icon--block');
    expect(findIcon(wrapper).classes()).not.toContain('tedi-icon--inline');
  });

  describe('accessibility', () => {
    it('hides the icon from screen readers without a label', () => {
      const icon = findIcon(mount(TediIcon, { props: { name: 'add' } }));

      expect(icon.attributes('aria-hidden')).toBe('true');
      expect(icon.attributes('role')).toBeUndefined();
      expect(icon.attributes('aria-label')).toBeUndefined();
    });

    it('exposes the icon as an image with a label', () => {
      const icon = findIcon(mount(TediIcon, { props: { name: 'add', label: 'Add item' } }));

      expect(icon.attributes('role')).toBe('img');
      expect(icon.attributes('aria-label')).toBe('Add item');
      expect(icon.attributes('aria-hidden')).toBeUndefined();
    });

    it('puts the a11y attributes on the icon, not the wrapper, when background is set', () => {
      const wrapper = mount(TediIcon, { props: { name: 'add', background: 'primary', label: 'Add item' } });

      expect(wrapper.attributes('role')).toBeUndefined();
      expect(findIcon(wrapper).attributes('role')).toBe('img');
      expect(findIcon(wrapper).attributes('aria-label')).toBe('Add item');
    });
  });

  it('renders on the server', async () => {
    const html = await renderToString(createSSRApp({ render: () => h(TediIcon, { name: 'add', label: 'Add' }) }));

    expect(html).toContain('class="notranslate material-symbols material-symbols--outlined tedi-icon');
    expect(html).toContain('role="img"');
  });
});
