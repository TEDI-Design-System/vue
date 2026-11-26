# Create New TEDI Component

## Prerequisites

A Figma link MUST be provided with the task. If there is none, stop and ask the user for one.

Only links to the TEDI Figma file (`figma.com/design/jWiRIXhHRxwVdMSimKX2FF/...`) go into the stories. A
design in any other Figma file can't be opened by readers of the docs: use it for implementation and
leave the link out ([stories.md](stories.md)).

## Step 1: Gather Context

1. Fetch design context, screenshots and metadata with the Figma MCP server.
2. Read the React (`../react/src/tedi/components/`) and Angular (`../angular/src/tedi/components/`)
   equivalents. Match their design contract: BEM classes, tokens, states, behaviour, accessibility and
   names for the same concepts. Do not copy either API shape: react puts a lot into props, angular
   composes. Shape the Vue API by "API Design" in `AGENTS.md` (slots for content, props for
   configuration, compound parts with `provide` / `inject`, `v-model`, `as` / `as-child`), and note
   every difference from react and angular in the plan.
3. Check the installed core (`node_modules/@tedi-design-system/core/`) for tokens and mixins.

## Step 2: Plan

Write a plan and get it approved before writing code. It covers:

- **Name**: `TediName`, root class `tedi-name`
- **Category**: the folder under `src/tedi/components/`, the same as React's
- **API**: props (types, defaults), emits, `v-model` bindings (`defineModel`), slots, and for a component
  with parts the compound components and what they share via `provide` / `inject`. For anything beyond a
  single element, write this API into the issue first, with a short comparison to react and angular.
- **Accessibility**: roles, keyboard interaction, screen reader behaviour, focus management
- **Dependencies**: existing TEDI components to reuse, new libraries (ask first)
- **Test plan** and **stories plan** (one story per Figma section)

## Step 3: Scaffold Files

In `src/tedi/components/<category>/<name>/` (`TediIcon` in `base/icon/` is the reference):

```text
TediName.vue
name.scss
TediName.spec.ts
TediName.stories.ts
index.ts
```

## Step 4: Implement

### SFC

```vue
<script setup lang="ts">
import { computed } from 'vue';

import './name.scss';

export interface TediNameProps {
  /**
   * Visual variant.
   * @default 'primary'
   */
  variant?: 'primary' | 'secondary';
  /**
   * Disables interaction.
   * @default false
   */
  disabled?: boolean;
}

const { variant = 'primary', disabled = false } = defineProps<TediNameProps>();

const emit = defineEmits<{
  /** Fired when the user activates the component. */
  activate: [event: MouseEvent];
}>();

/** Selected value, bound with `v-model`. */
const value = defineModel<string>();

const classes = computed(() => ['tedi-name', `tedi-name--${variant}`, { 'tedi-name--disabled': disabled }]);
</script>

<template>
  <div :class="classes">
    <!-- @slot Main content. -->
    <slot />
  </div>
</template>
```

Rules:

- `<script setup lang="ts">`, type-based macros, no `<style>` block; the stylesheet is imported with
  `import './name.scss';`.
- Props destructured with defaults; never assign to props, emit or use `defineModel` instead.
- Root class `tedi-name`, modifiers `tedi-name--<value>`, elements `tedi-name__<part>`.
- Browser APIs only in `onMounted` / event handlers. Remove listeners in `onBeforeUnmount`. Ids from
  `useId()`.
- Form controls: two-way value through `defineModel`, a native control inside so labels, forms and
  validation work.
- Floating or layered UI (modal, sheet, popover, tooltip, dropdown, select, toast): build it on the
  matching Reka UI primitive (`reka-ui`), styled with TEDI classes. Fall back to `@floating-ui/vue`
  for positioning only when no primitive fits, and then write focus management, Escape / outside
  click and ARIA wiring yourself. See "Floating and Overlay Components" in `AGENTS.md`.
- Non-floating components may use a Reka UI primitive (Accordion, Tabs, Checkbox, RadioGroup, Switch,
  Slider, Pagination, Stepper) when its behaviour matches the Figma design and react's component.

Example, a popover with a TEDI trigger:

```vue
<template>
  <PopoverRoot v-model:open="open">
    <PopoverTrigger as-child>
      <TediButton visual-type="secondary">{{ label }}</TediButton>
    </PopoverTrigger>
    <PopoverPortal>
      <PopoverContent class="tedi-popover" :side-offset="8">
        <slot />
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>
```

### Styles

`name.scss` holds global BEM rules using core tokens:

```scss
.tedi-name {
  color: var(--general-text-primary);

  &--secondary {
    color: var(--general-text-secondary);
  }
}
```

Import it from the SFC, after the other imports in `<script setup>`:

```ts
import './name.scss';
```

Do not `@use` it from `src/tedi/styles/index.scss`: the library build collects the import into
`dist/index.css` either way, but Chromatic's TurboSnap only sees module imports, so a stylesheet pulled in
with Sass `@use` would never re-snapshot the stories that use the component.

## Step 5: Export

1. `index.ts` in the component folder:

   ```ts
   export { default as TediName } from './TediName.vue';
   export type { TediNameProps } from './TediName.vue';
   ```

2. Add `export * from './components/<category>/<name>';` to `src/tedi/index.ts`.

## Step 6: Verify

```bash
npx vitest run src/tedi/components/<category>/<name>/
npm run lint
npm run typecheck
npm run build
```

Fix every failure. Then write tests and stories ([testing.md](testing.md), [stories.md](stories.md)) and
review accessibility ([a11y-review.md](a11y-review.md)).
