---
name: tedi-vue
description: >
  Build UIs with @tedi-design-system/vue, the Vue 3 implementation of TEDI, the Estonian public sector design system
  (`@tedi-design-system/vue`). Use whenever the user is installing, importing or composing TEDI components in a
  downstream Vue or Nuxt app: `TediIcon`, `TediStatusBadge`, `TediStatusIndicator` and any other `Tedi*` component,
  importing from `@tedi-design-system/vue/tedi` or `/community`, loading `index.css` or a single Material Symbols
  style, switching the light/dark theme with the `tedi-theme--*` class, styling with TEDI design tokens, or setting
  TEDI up in Nuxt / SSR. Do NOT use when contributing to the TEDI Vue library repo itself: use its `contributing`
  skill for that.
---

# TEDI Design System: Vue

Vue 3.5 component library implementing TEDI, next to the React and Angular libraries. Single-file components written
with `<script setup>` and TypeScript, global BEM styles with the `tedi-` prefix, and design tokens from
`@tedi-design-system/core`. SSR safe; works in Nuxt without a module.

The library is young: it ships few components, and more arrive with every release. Never assume a component exists
because React or Angular has it. Check the installed package (below).

## Authoritative Sources

This skill teaches the integration idiom and the traps. It is **not** a prop reference: any prop list here would go
stale. Read props from the installed package.

### Read the installed package, not the internet

The consumer's `node_modules` is the exact version their code compiles against, needs no network, and is greppable:

```
node_modules/@tedi-design-system/vue/src/tedi/index.d.ts                 # TEDI-Ready roster (barrel)
node_modules/@tedi-design-system/vue/src/tedi/components/**/*.vue.d.ts   # props, slots, emits + JSDoc
node_modules/@tedi-design-system/vue/src/community/index.d.ts            # community roster
node_modules/@tedi-design-system/core/tokens.json                        # every design token, resolved
```

The `.d.ts` files keep the JSDoc, so defaults (`@default`), accessibility notes and rationale are there. See
[references/components.md](references/components.md) for how to resolve a component to its types.

Confirm the version you are reading, so you can say what your answer applies to:

```bash
npm ls @tedi-design-system/vue @tedi-design-system/core
```

### When there is no install to read

Only when `node_modules` is unavailable (planning before install, or reviewing a diff), fall back to the public repo,
pinned to the **resolved** version from the lockfile (`package.json` holds a range, not a tag):

```bash
# npm
grep -A2 '"node_modules/@tedi-design-system/vue"' package-lock.json
# pnpm / yarn: search the lockfile for the @tedi-design-system/vue entry
grep -A2 '@tedi-design-system/vue' pnpm-lock.yaml yarn.lock
```

Release tags are `vue-<resolved version>` (e.g. `vue-1.0.0-rc.4`); every release, including pre-releases, is tagged.
Fetch raw files, not blob pages:

```
https://raw.githubusercontent.com/TEDI-Design-System/vue/vue-1.0.0-rc.4/src/tedi/index.ts
https://raw.githubusercontent.com/TEDI-Design-System/vue/vue-1.0.0-rc.4/src/tedi/components/base/icon/TediIcon.vue
```

If the tag genuinely doesn't exist, use `rc` and say so in your answer.

### Canonical references

- **Source & tags**: [github.com/TEDI-Design-System/vue](https://github.com/TEDI-Design-System/vue). TEDI-Ready lives
  under `src/tedi/components/<category>/<name>/`, community under `src/community/`.
- **Live Storybook (args tables + runnable examples)**:
  [storybook.tedi.ee/vue/rc](https://storybook.tedi.ee/vue/rc/?path=/docs/documentation-get-started--get-started)
  (latest pre-release) and `storybook.tedi.ee/vue/main` (latest stable, once the first stable release is out).
  Generated from the same JSDoc; the installed
  `.d.ts` wins on any disagreement.
- **Design system wiki** (cross-framework guidelines):
  [github.com/TEDI-Design-System/general/wiki](https://github.com/TEDI-Design-System/general/wiki)
- **Design guidelines and component documentation**: [tedi.ee](https://www.tedi.ee/)
- **Releases & changelog**: [releases](https://github.com/TEDI-Design-System/vue/releases),
  [CHANGELOG.md](https://github.com/TEDI-Design-System/vue/blob/rc/CHANGELOG.md),
  [issues](https://github.com/TEDI-Design-System/vue/issues)
- **npm**: [@tedi-design-system/vue](https://www.npmjs.com/package/@tedi-design-system/vue)
- **Sibling packages**: [@tedi-design-system/core](https://www.npmjs.com/package/@tedi-design-system/core) (tokens,
  SCSS, icons); [@tedi-design-system/react](https://www.npmjs.com/package/@tedi-design-system/react) and
  [@tedi-design-system/angular](https://www.npmjs.com/package/@tedi-design-system/angular) for behavioural parity
  questions. They share BEM classes, tokens and behaviour with Vue, **not** the API shape.

**Never invent a prop, slot, event or component.** If it isn't in the types, it doesn't exist. Say so instead of
guessing a plausible name, and don't port a React or Angular prop name across without checking.

## Installation

```bash
npm install @tedi-design-system/vue
```

`@tedi-design-system/core` is a dependency and installs with it; add it explicitly only if your own SCSS `@use`s it.
Peer dependency: `vue ^3.5.0`.

## Setup

### 1. Import the stylesheet once

```ts
// main.ts
import { createApp } from 'vue';

import '@tedi-design-system/vue/index.css';

import App from './App.vue';

createApp(App).mount('#app');
```

The component JavaScript imports no CSS, so without this stylesheet components render unstyled. `index.css` holds the
fonts, tokens, utility classes and every component's styles.

`index.css` declares all three Material Symbols fonts. When the app uses one `TediIcon` `type` (recommended), load only
that font:

```ts
import '@tedi-design-system/vue/index-without-icons.css';
import '@tedi-design-system/vue/icons/outlined.css'; // or rounded.css / sharp.css
```

### 2. Use components

There is no global registration: import each component where you use it.

```vue
<script setup lang="ts">
import { TediIcon, TediStatusBadge } from '@tedi-design-system/vue/tedi';
</script>

<template>
  <TediStatusBadge color="success">Kinnitatud</TediStatusBadge>
  <TediIcon name="info" label="Lisainfo" color="brand" />
</template>
```

Verify the props in the installed `.d.ts` before using them; the example shows the shape, not a reference.

### 3. Language (optional)

Built-in component texts (accessible names, button labels) are Estonian by default; `en` and `ru` ship too. Set the
language for the app with the plugin, and change it with `setLocale`:

```ts
import { createTedi } from '@tedi-design-system/vue/tedi';

app.use(createTedi({ locale: 'en', labels: { close: { en: 'Dismiss' } } }));
```

`useTediLabels()` returns `{ t, locale, setLocale }`; `TediLabelProvider` (`v-model:locale`, `labels`) scopes them to
part of the page. With vue-i18n or `@nuxtjs/i18n`, pass the app's locale ref as `locale` instead of keeping two;
languages other than `et`, `en` and `ru` get the Estonian texts. In the browser, `createTedi` saves language changes in
the `tedi-lang` cookie but never reads it: pass the saved value in as `locale` (in Nuxt, `useCookie('tedi-lang')` in a
plugin, see below). The Storybook "Documentation/Labels" page lists every key.

### 4. Breakpoints (optional)

`useTediBreakpoint()` returns `{ breakpoint, isAbove, isBelow, resolve }` for the TEDI breakpoints (`TEDI_BREAKPOINTS`,
in `rem`: `xs 0, sm 36, md 48, lg 62, xl 75, xxl 87.5`). Props typed `TediBreakpointValue<T>` take a value per
breakpoint, mobile first: `:size="{ xs: 'small', md: 'default' }"`. `breakpoint` is `undefined` on the server and until
mount (values resolve to `xs`), then follows the viewport. For purely visual changes, prefer CSS media queries.

### Nuxt

No module is needed. Register the stylesheet and import components as above:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  css: ['@tedi-design-system/vue/index.css'],
});
```

Install `createTedi` from a plugin, so the server renders the saved language:

```ts
// app/plugins/tedi.ts
import { createTedi, type TediLanguage } from '@tedi-design-system/vue/tedi';

export default defineNuxtPlugin((nuxtApp) => {
  const lang = useCookie<TediLanguage | undefined>('tedi-lang');
  nuxtApp.vueApp.use(createTedi({ locale: lang.value ?? 'et' }));
});
```

Components server-render. Components that generate DOM ids use Vue's `useId()`, so ids match between server and
client. Overlay components (modal, popover, tooltip, dropdown; built on Reka UI) render their content on the client
after hydration; the trigger renders on the server.

## Component Conventions

The library follows one set of API rules. Knowing them lets you read any component's types quickly:

- **Names**: every component and export has the `Tedi` prefix (`TediIcon`, props type `TediIconProps`). The root
  element carries the BEM class `tedi-<name>` (`tedi-icon`).
- **Content goes in slots**, not props: the label or body is the default slot; icons, headers, footers and actions are
  named slots (`#icon-left`, `#header`, `#footer`). A prop is used only for a plain string or identifier, such as an
  icon name (`icon="home"`).
- **Configuration goes in props**: variants, sizes and flags, usually one union-typed prop (`variant="secondary"`)
  rather than several booleans.
- **State uses `v-model`**: values, `v-model:open`, the active tab. Changes are emitted events (`update:*`, `change`);
  there are no `onX` callback props.
- **Compound components** for anything with parts (`TediCard` + `TediCardHeader` + `TediCardContent`). Parts share
  state through provide/inject, so use them inside their parent.
- **Element choice with `as` / `as-child`** where a component supports it (for example a button rendered as a link or
  as `RouterLink` / `NuxtLink`). Check the types: not every component has it.
- **Attributes fall through**: `class`, `style`, `id`, `aria-*` and `data-*` go to the root element. There are no
  `className`, `id` or `ariaLabel` props.

See [references/components.md](references/components.md) for the details and for mapping React or Angular examples to
Vue.

## Theming

Themes are a class on `<html>`: `tedi-theme--default` or `tedi-theme--dark`. With no class the default theme applies
(its tokens are also declared on `:root`). The library has no theme provider; set the class yourself, and in Nuxt with
`useHead({ htmlAttrs: { class: 'tedi-theme--dark' } })` so the server renders it too. See
[references/theming.md](references/theming.md) for tokens, custom themes and style overrides.

## Common Pitfalls

- **Import from `/tedi` or `/community`, never the package root.** `@tedi-design-system/vue` itself is not an entry
  point. The valid paths are `/tedi`, `/community`, `/index.css`, `/index-without-icons.css` and `/icons/*.css`.
- **Don't forget the stylesheet.** Unstyled TEDI components almost always mean `index.css` (or
  `index-without-icons.css` + an icon style) is not loaded.
- **Prefer TEDI-Ready over community.** Use a community component only where no TEDI-Ready one exists, and check its
  JSDoc for `@deprecated`.
- **Don't port APIs across frameworks.** React's `onChange`, `className`, `isDisabled`-style props and Angular's
  attribute selectors (`<button tedi-button>`) have no Vue equivalent. Vue uses `v-model`, events, slots and
  fallthrough attributes.
- **Label meaningful icons.** `TediIcon` without `label` is hidden from screen readers. Give it a `label` when the icon
  carries meaning on its own.
- **Use design tokens, not hardcoded colours**, and never add `var()` fallbacks: write
  `var(--general-surface-primary)`, not `var(--general-surface-primary, #fff)`.
- **Don't touch `window` or `document` during setup** in your own wrappers if the app is server-rendered: do it in
  `onMounted`.

## Additional References

Load based on your task, **not all at once**:

- [references/components.md](references/components.md): finding a component and its props, slots and events in the
  installed types; slots, `v-model`, compound parts and `as` / `as-child` in practice; mapping React or Angular
  examples to Vue; testing components that use TEDI
- [references/theming.md](references/theming.md): design tokens and how to look them up, theme switching (Vue and
  Nuxt), custom themes, overriding component styles, responsive SCSS
