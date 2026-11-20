# Test & Verify TEDI Component

Target: the component path given in the task, or the whole suite.

## Setup

- Vitest with jsdom (`vite.config.ts`), specs at `src/**/*.spec.ts`.
- `vitest.setup.ts` registers the `@testing-library/jest-dom` matchers (`toBeInTheDocument`,
  `toHaveAttribute`, `toHaveAccessibleName`, ...).
- Components are mounted with `@vue/test-utils`.
- Coverage (`npm run test:coverage`): v8, over `src/tedi/{components,providers,utils}/**/*.{ts,vue}` excluding specs,
  stories and `index.ts`. 80% threshold on statements, branches, functions and lines. With `CI` set,
  a `junit.xml` report is written too.

## Workflow

### 1. Run Tests

```bash
npx vitest run src/tedi/components/<category>/<name>/   # one component
npm test                                                 # whole suite
npm run test:coverage                                    # whole suite with the threshold
```

Don't pass `--coverage` on a narrow run: the threshold is measured over all components and fails.

### 2. Fix Failures

Read the spec and the component, decide whether the test or the component is wrong, fix it, re-run.

### 3. Lint and Typecheck

```bash
npm run lint
npm run typecheck
```

### 4. Report

Tests pass/fail count, lint and typecheck status, anything that needs manual attention.

## Patterns

### Basic Test

```ts
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import { TediName } from './index';

describe('TediName', () => {
  it('renders the default variant', () => {
    const wrapper = mount(TediName, { slots: { default: 'Label' } });

    expect(wrapper.classes()).toContain('tedi-name--primary');
    expect(wrapper.element).toHaveTextContent('Label');
  });
});
```

### Props

```ts
const wrapper = mount(TediName, { props: { variant: 'secondary' } });
await wrapper.setProps({ disabled: true });
expect(wrapper.classes()).toContain('tedi-name--disabled');
```

### Emits and v-model

```ts
const wrapper = mount(TediName, {
  props: { modelValue: 'a', 'onUpdate:modelValue': (value: string) => wrapper.setProps({ modelValue: value }) },
});
await wrapper.find('input').setValue('b');
expect(wrapper.emitted('update:modelValue')).toEqual([['b']]);
expect(wrapper.props('modelValue')).toBe('b');
```

### Keyboard and Focus

Attach to the document when the test depends on focus, and unmount afterwards:

```ts
const wrapper = mount(TediName, { attachTo: document.body });
await wrapper.find('[role="option"]').trigger('keydown', { key: 'ArrowDown' });
expect(document.activeElement).toBe(wrapper.findAll('[role="option"]')[1].element);
wrapper.unmount();
```

### Accessibility

- Assert roles and ARIA attributes (`toHaveAttribute('aria-expanded', 'true')`, `toHaveAccessibleName`).
- Assert keyboard activation (Enter, Space, Escape, arrows) and focus movement.
- Assert the disabled state blocks interaction and is exposed (`disabled` or `aria-disabled`).

### Pitfalls

- `await` every `trigger`, `setValue` and `setProps`, or the DOM isn't updated yet.
- Mock browser APIs jsdom lacks (`matchMedia`, `ResizeObserver`) with `vi.stubGlobal` and restore them
  with `vi.unstubAllGlobals()` in `afterEach`.
- Use fake timers (`vi.useFakeTimers()`) for timeouts and reset them with `vi.useRealTimers()`.
