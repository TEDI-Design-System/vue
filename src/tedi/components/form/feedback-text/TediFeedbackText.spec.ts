import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { createSSRApp, h } from 'vue';
import { renderToString } from 'vue/server-renderer';

import TediFeedbackText from './TediFeedbackText.vue';

describe('TediFeedbackText', () => {
  it('renders a hint on the left by default', () => {
    const wrapper = mount(TediFeedbackText, { slots: { default: 'Helper text' } });

    expect(wrapper.element.tagName).toBe('DIV');
    expect(wrapper.attributes('data-name')).toBe('feedback-text');
    expect(wrapper.classes()).toEqual(['tedi-feedback-text', 'tedi-feedback-text--hint', 'tedi-feedback-text--left']);
    expect(wrapper.text()).toBe('Helper text');
    expect(wrapper.attributes('role')).toBeUndefined();
    expect(wrapper.attributes('aria-live')).toBe('polite');
  });

  it.each([
    ['hint', undefined, 'polite'],
    ['valid', 'alert', 'assertive'],
    ['error', 'alert', 'assertive'],
  ] as const)('renders the %s type with role %s and aria-live %s', (type, role, ariaLive) => {
    const wrapper = mount(TediFeedbackText, { props: { type }, slots: { default: 'Feedback' } });

    expect(wrapper.classes()).toContain(`tedi-feedback-text--${type}`);
    expect(wrapper.attributes('role')).toBe(role);
    expect(wrapper.attributes('aria-live')).toBe(ariaLive);
  });

  it.each(['left', 'right'] as const)('renders the %s position', (position) => {
    const wrapper = mount(TediFeedbackText, { props: { position }, slots: { default: 'Feedback' } });

    expect(wrapper.classes()).toContain(`tedi-feedback-text--${position}`);
  });

  it('updates the role when the type changes', async () => {
    const wrapper = mount(TediFeedbackText, { slots: { default: 'Feedback' } });

    await wrapper.setProps({ type: 'error' });

    expect(wrapper.classes()).toContain('tedi-feedback-text--error');
    expect(wrapper.attributes('role')).toBe('alert');
  });

  it('keeps the defaults when type and position are passed as undefined', () => {
    const wrapper = mount(TediFeedbackText, {
      props: { type: undefined, position: undefined },
      slots: { default: 'Feedback' },
    });

    expect(wrapper.classes()).toEqual(['tedi-feedback-text', 'tedi-feedback-text--hint', 'tedi-feedback-text--left']);
    expect(wrapper.classes().join(' ')).not.toContain('undefined');
  });

  it('renders markup passed in the slot', () => {
    const wrapper = mount(TediFeedbackText, {
      props: { type: 'error' },
      slots: { default: '<strong>Required.</strong> Enter your name.' },
    });

    expect(wrapper.find('strong').text()).toBe('Required.');
    expect(wrapper.text()).toBe('Required. Enter your name.');
  });

  it('applies fallthrough attributes', () => {
    const wrapper = mount(TediFeedbackText, {
      attrs: { id: 'name-feedback', class: 'custom-class' },
      slots: { default: 'Feedback' },
    });

    expect(wrapper.attributes('id')).toBe('name-feedback');
    expect(wrapper.classes()).toContain('custom-class');
  });

  it('renders on the server', async () => {
    const html = await renderToString(
      createSSRApp({
        render: () => h(TediFeedbackText, { type: 'error', position: 'right', id: 'field-error' }, () => 'Viga'),
      }),
    );

    expect(html).toContain('tedi-feedback-text--error');
    expect(html).toContain('tedi-feedback-text--right');
    expect(html).toContain('role="alert"');
    expect(html).toContain('id="field-error"');
    expect(html).toContain('Viga');
  });
});
