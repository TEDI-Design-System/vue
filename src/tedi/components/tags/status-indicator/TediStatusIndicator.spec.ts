import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { createSSRApp, h } from 'vue';
import { renderToString } from 'vue/server-renderer';

import TediStatusIndicator from './TediStatusIndicator.vue';

const findIndicator = (wrapper: ReturnType<typeof mount>) => wrapper.find('[data-name="status-indicator"]');

describe('TediStatusIndicator', () => {
  it('renders with default props', () => {
    const indicator = findIndicator(mount(TediStatusIndicator));

    expect(indicator.element.tagName).toBe('SPAN');
    expect(indicator.classes()).toEqual([
      'tedi-status-indicator',
      'tedi-status-indicator--success',
      'tedi-status-indicator--sm',
    ]);
  });

  it('is hidden from assistive technology', () => {
    const indicator = findIndicator(mount(TediStatusIndicator));

    expect(indicator.attributes('aria-hidden')).toBe('true');
    expect(indicator.attributes('role')).toBeUndefined();
  });

  it.each(['success', 'danger', 'warning', 'inactive'] as const)('renders the %s type', (type) => {
    expect(findIndicator(mount(TediStatusIndicator, { props: { type } })).classes()).toContain(
      `tedi-status-indicator--${type}`,
    );
  });

  it('renders the large size', () => {
    expect(findIndicator(mount(TediStatusIndicator, { props: { size: 'lg' } })).classes()).toContain(
      'tedi-status-indicator--lg',
    );
  });

  it('renders the border', () => {
    expect(findIndicator(mount(TediStatusIndicator, { props: { hasBorder: true } })).classes()).toContain(
      'tedi-status-indicator--bordered',
    );
  });

  it('positions itself at the top right', () => {
    const indicator = findIndicator(mount(TediStatusIndicator, { props: { position: 'top-right' } }));

    expect(indicator.classes()).toContain('tedi-status-indicator--top-right');
  });

  it('stays inline by default', () => {
    expect(findIndicator(mount(TediStatusIndicator)).classes()).not.toContain('tedi-status-indicator--top-right');
  });

  it('applies a fallthrough class', () => {
    const indicator = findIndicator(mount(TediStatusIndicator, { attrs: { class: 'custom' } }));

    expect(indicator.classes()).toContain('custom');
  });

  it('renders on the server', async () => {
    const html = await renderToString(createSSRApp({ render: () => h(TediStatusIndicator, { type: 'danger' }) }));

    expect(html).toContain('tedi-status-indicator--danger');
    expect(html).toContain('aria-hidden="true"');
  });
});
