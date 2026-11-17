# Components

How to find a TEDI Vue component, read its API from the installed package, and use it the way the library intends.

## Finding a component

The barrel is the roster. Anything not exported there is not public:

```bash
cat node_modules/@tedi-design-system/vue/src/tedi/index.d.ts
cat node_modules/@tedi-design-system/vue/src/community/index.d.ts
```

Each line re-exports one component folder (`export * from './components/<category>/<name>'`). Categories mirror the
React library: `base`, `buttons`, `content`, `filter`, `form`, `layout`, `loaders`, `misc`, `navigation`,
`notifications`, `overlays`, `tags`.

Then read the component's declaration file:

```bash
ls node_modules/@tedi-design-system/vue/src/tedi/components/*/*/
cat node_modules/@tedi-design-system/vue/src/tedi/components/base/icon/TediIcon.vue.d.ts
```

What to read in it:

| Look for                                                                                            | Tells you                                                    |
| --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `export interface Tedi<Name>Props`                                                                  | Props, with JSDoc and `@default`                             |
| Exported union types (`TediIconSize`, `TediStatusBadgeColor`)                                       | The allowed values of a prop                                 |
| `type __VLS_Slots = { … }` (from `defineSlots`)                                                     | Slot names, their JSDoc and scoped props                     |
| The emits (from `defineEmits` / `defineModel`), search the file for `update:` and `on` + event name | Event names and payloads, including `update:*` for `v-model` |
| `@deprecated` in JSDoc                                                                              | Use the replacement it names                                 |

Search across all components:

```bash
# which components have a given prop or slot?
grep -rl "icon?:" node_modules/@tedi-design-system/vue/src/tedi/components
# every exported props type
grep -rh "export interface Tedi.*Props" node_modules/@tedi-design-system/vue/src
```

If the component the user wants is not in the roster, say so. Don't substitute the React or Angular component, and
don't hand-build a lookalike without telling the user: offer the closest existing TEDI component, a community one, or
building it with TEDI tokens and the documented BEM classes (below), and say which you chose.

## Slots

Content is passed as slots. A text label is the default slot, not a `label` / `text` / `children` prop:

```vue
<TediStatusBadge color="success">Kinnitatud</TediStatusBadge>
```

Named slots hold icons, headers, footers and actions. Check the slots type for the exact names:

```vue
<TediCard>
  <template #header>Pealkiri</template>
  Sisu
  <template #footer>…</template>
</TediCard>
```

A string prop is used only for identifiers, such as an icon name (`icon="check"`), which the component renders with
`TediIcon`.

## v-model and events

State is bound with `v-model`, and the component emits `update:<prop>`:

```vue
<script setup lang="ts">
import { ref } from 'vue';

const open = ref(false);
const value = ref('');
</script>

<template>
  <TediSomeField v-model="value" />
  <TediSomeOverlay v-model:open="open" />
</template>
```

Listen to events with `@`, not callback props: `@change="onChange"`, never `:on-change`. The emits type lists what
exists.

When you wrap a TEDI form control in your own component, expose `v-model` with `defineModel()` and pass it through,
rather than copying the value into local state:

```vue
<script setup lang="ts">
const model = defineModel<string>();
</script>

<template>
  <TediSomeField v-model="model" />
</template>
```

## Compound components

Components with parts are split into one component per part, matching the Angular library and Reka UI: for example
`TediCard` + `TediCardHeader` + `TediCardContent`, or `TediTabs` + `TediTabsList` + `TediTabsTrigger` +
`TediTabsContent`. Parts get their state from the parent through provide/inject, so:

- render parts only inside their parent;
- don't pass the parent's state to parts by hand;
- import each part by name from `/tedi` (there is no `Card.Header` dot notation as in React).

## `as` and `as-child`

Where a component supports it (check the props for `as` / `asChild`), it can render a different element:

```vue
<script setup lang="ts">
import { RouterLink } from 'vue-router';
</script>

<template>
  <!-- render as a link -->
  <TediSomeButton as="a" href="/profile">Profiil</TediSomeButton>
  <!-- render as a router link; extra attributes such as `to` fall through -->
  <TediSomeButton :as="RouterLink" to="/profile">Profiil</TediSomeButton>
  <!-- merge onto your own element instead of adding one -->
  <TediSomeButton as-child>
    <NuxtLink to="/profile">Profiil</NuxtLink>
  </TediSomeButton>
</template>
```

## Fallthrough attributes

`class`, `style`, `id`, `aria-*`, `data-*` and native event listeners fall through to the component's root element
(for a component whose root is a wrapper, to the element its JSDoc names). Use them directly:

```vue
<TediIcon name="home" class="my-icon" data-test="home-icon" />
```

`TediIcon` with `background` wraps the icon in an extra element and attributes go to that wrapper (stated in its
JSDoc). Read the JSDoc when it matters where an attribute lands.

## Global BEM classes as a fallback

TEDI's BEM classes are global (not hashed), so `class="tedi-<name> tedi-<name>--<modifier>"` styles a plain element
the same way, like Angular's attribute selectors. Use this only where the component can't be used, for example markup
you don't control. The component is the API: it adds behaviour and accessibility the classes don't.

## Mapping React or Angular examples to Vue

TEDI documentation and examples are often written for React or Angular. The BEM classes, tokens, states and
accessibility behaviour are the same in Vue; the API shape is not:

| React                             | Angular                                    | Vue                                                                   |
| --------------------------------- | ------------------------------------------ | --------------------------------------------------------------------- |
| `<Button visualType="secondary">` | `<button tedi-button variant="secondary">` | `<TediButton variant="secondary">` (check the prop name in the types) |
| `children` / `label` prop         | content projection                         | default slot                                                          |
| `onChange={fn}`                   | `(change)="fn($event)"`                    | `@change="fn"` or `v-model`                                           |
| `value` + `onChange`              | `[(ngModel)]` / form control               | `v-model`                                                             |
| `Card.Header`                     | `<tedi-card-header>`                       | `<TediCardHeader>`                                                    |
| `className="x"`                   | `class="x"`                                | `class="x"` (fallthrough)                                             |
| `ThemeProvider`, `LabelProvider`  | `provideTedi()`                            | none: theme class on `<html>` (see theming.md)                        |

Always confirm the Vue prop name in the types: Vue follows the React/Angular _names_ for the same concept where it can,
but not always their _props_.

## Accessibility notes

- **`TediIcon`** is hidden from screen readers (`aria-hidden`) unless it has a `label`. Give it a `label` when the icon
  carries meaning without visible text next to it.
- **`TediStatusBadge`**: its `status` indicator is decorative, so put the status in the text too. `role="status"` or
  `role="alert"` also sets the matching `aria-live` politeness; use them only for content that changes and must be
  announced.
- Read each component's JSDoc for its own accessibility requirements; they are written there, next to the prop they
  concern.

## Testing your components

TEDI components render in jsdom with `@vue/test-utils` without extra setup. Query by role and accessible name rather
than by TEDI's internal classes, which are styling hooks and can change between versions:

```ts
import { mount } from '@vue/test-utils';

import MyPage from './MyPage.vue';

it('labels the info icon', () => {
  const wrapper = mount(MyPage);
  expect(wrapper.find('[aria-label="Lisainfo"]').exists()).toBe(true);
});
```

Overlay content is teleported to `body`, so query `document.body` for it, and attach the wrapper to the document
(`attachTo: document.body`) when a test depends on focus.
