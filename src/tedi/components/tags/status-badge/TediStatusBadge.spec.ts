import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { createSSRApp, h } from 'vue';
import { renderToString } from 'vue/server-renderer';

import TediStatusBadge from './TediStatusBadge.vue';

describe('TediStatusBadge', () => {
  it('renders with default props', () => {
    const wrapper = mount(TediStatusBadge, { slots: { default: 'Default Badge' } });

    expect(wrapper.element.tagName).toBe('DIV');
    expect(wrapper.classes()).toEqual([
      'tedi-status-badge',
      'tedi-status-badge--variant-filled',
      'tedi-status-badge--color-neutral',
    ]);
    expect(wrapper.find('.tedi-status-badge__inner-text').text()).toBe('Default Badge');
    expect(wrapper.attributes('role')).toBeUndefined();
    expect(wrapper.attributes('aria-live')).toBeUndefined();
    expect(wrapper.attributes('title')).toBeUndefined();
    expect(wrapper.find('[data-name="status-indicator"]').exists()).toBe(false);
    expect(wrapper.find('[data-name="icon"]').exists()).toBe(false);
  });

  it('renders the specified color and variant', () => {
    const wrapper = mount(TediStatusBadge, {
      props: { color: 'brand', variant: 'bordered' },
      slots: { default: 'Primary Bordered Badge' },
    });

    expect(wrapper.classes()).toContain('tedi-status-badge--variant-bordered');
    expect(wrapper.classes()).toContain('tedi-status-badge--color-brand');
  });

  it('renders the large size', () => {
    const wrapper = mount(TediStatusBadge, { props: { size: 'large' }, slots: { default: 'Large Badge' } });

    expect(wrapper.classes()).toContain('tedi-status-badge--large');
  });

  it.each([
    ['default', 'tedi-status-indicator--sm'],
    ['large', 'tedi-status-indicator--lg'],
  ] as const)('renders a %s size status indicator', (size, sizeClass) => {
    const wrapper = mount(TediStatusBadge, { props: { status: 'warning', size }, slots: { default: 'Warning Badge' } });
    const indicator = wrapper.find('[data-name="status-indicator"]');

    expect(indicator.classes()).toEqual(
      expect.arrayContaining([
        'tedi-status-indicator--warning',
        sizeClass,
        'tedi-status-indicator--bordered',
        'tedi-status-indicator--top-right',
      ]),
    );
    expect(indicator.attributes('aria-hidden')).toBe('true');
  });

  it('renders an icon only badge', () => {
    const wrapper = mount(TediStatusBadge, { props: { icon: 'check_circle' } });
    const icon = wrapper.find('[data-name="icon"]');

    expect(wrapper.classes()).toContain('tedi-status-badge__icon-only');
    expect(icon.text()).toBe('check_circle');
    expect(icon.classes()).toEqual(
      expect.arrayContaining(['tedi-status-badge__icon-neutral', 'tedi-icon--color-inherit', 'tedi-icon--size-16']),
    );
    expect(icon.attributes('aria-hidden')).toBe('true');
    expect(wrapper.find('.tedi-status-badge__inner-text').exists()).toBe(false);
  });

  it('renders an icon with text', () => {
    const wrapper = mount(TediStatusBadge, {
      props: { icon: 'check_circle', color: 'success' },
      slots: { default: 'Badge with Icon' },
    });

    expect(wrapper.classes()).not.toContain('tedi-status-badge__icon-only');
    expect(wrapper.find('.tedi-status-badge__icon-success').exists()).toBe(true);
    expect(wrapper.find('.tedi-status-badge__inner-text').text()).toBe('Badge with Icon');
  });

  it('renders as an abbreviation when title is set', () => {
    const wrapper = mount(TediStatusBadge, { props: { title: 'Draft Status' }, slots: { default: 'DS' } });

    expect(wrapper.element.tagName).toBe('ABBR');
    expect(wrapper.attributes('title')).toBe('Draft Status');
    expect(wrapper.text()).toBe('DS');
  });

  it.each([
    ['status', 'polite'],
    ['alert', 'assertive'],
  ])('sets aria-live from role %s', (role, ariaLive) => {
    const wrapper = mount(TediStatusBadge, { props: { role }, slots: { default: 'Live Badge' } });

    expect(wrapper.attributes('role')).toBe(role);
    expect(wrapper.attributes('aria-live')).toBe(ariaLive);
  });

  it('does not set aria-live for other roles', () => {
    const wrapper = mount(TediStatusBadge, { props: { role: 'note' }, slots: { default: 'Note' } });

    expect(wrapper.attributes('role')).toBe('note');
    expect(wrapper.attributes('aria-live')).toBeUndefined();
  });

  it('applies fallthrough attributes', () => {
    const wrapper = mount(TediStatusBadge, {
      attrs: { class: 'custom-class', id: 'badge-id' },
      slots: { default: 'Custom Class Badge' },
    });

    expect(wrapper.classes()).toContain('custom-class');
    expect(wrapper.attributes('id')).toBe('badge-id');
  });

  it('renders correctly with all props', () => {
    const wrapper = mount(TediStatusBadge, {
      props: {
        color: 'accent',
        variant: 'filled-bordered',
        size: 'large',
        status: 'success',
        icon: 'star',
        title: 'Success Badge',
        role: 'status',
      },
      slots: { default: 'All Props Badge' },
    });

    expect(wrapper.element.tagName).toBe('ABBR');
    expect(wrapper.classes()).toEqual(
      expect.arrayContaining([
        'tedi-status-badge--variant-filled-bordered',
        'tedi-status-badge--color-accent',
        'tedi-status-badge--large',
      ]),
    );
    expect(wrapper.find('.tedi-status-indicator--success').exists()).toBe(true);
    expect(wrapper.find('.tedi-status-badge__icon-accent').exists()).toBe(true);
    expect(wrapper.text()).toContain('All Props Badge');
    expect(wrapper.attributes('title')).toBe('Success Badge');
    expect(wrapper.attributes('role')).toBe('status');
    expect(wrapper.attributes('aria-live')).toBe('polite');
  });

  it('renders on the server', async () => {
    const html = await renderToString(
      createSSRApp({
        render: () => h(TediStatusBadge, { color: 'danger', status: 'danger', icon: 'error' }, () => 'Viga'),
      }),
    );

    expect(html).toContain('tedi-status-badge--color-danger');
    expect(html).toContain('tedi-status-indicator--danger');
    expect(html).toContain('tedi-status-badge__icon-danger');
    expect(html).toMatch(/<span class="tedi-status-badge__inner-text">(<!--\[-->)?Viga/);
  });
});
