import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { defineComponent, h, ref } from 'vue';

// Smoke test for the test setup (jsdom, Vue Test Utils, jest-dom matchers).
// Remove once real component specs exist.
const Counter = defineComponent({
  setup() {
    const count = ref(0);
    return () => h('button', { type: 'button', onClick: () => count.value++ }, `Count: ${count.value}`);
  },
});

describe('test setup', () => {
  it('mounts a component and uses jest-dom matchers', async () => {
    const wrapper = mount(Counter, { attachTo: document.body });

    await wrapper.trigger('click');

    expect(wrapper.element).toBeInTheDocument();
    expect(wrapper.element).toHaveTextContent('Count: 1');
    wrapper.unmount();
  });
});
