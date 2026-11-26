# TEDI Design System for Vue

`@tedi-design-system/vue` is a library of Vue 3 components implementing the TEDI Design System.

> The library is in early development: it ships a first set of components, and more arrive with each release.

## Getting Started

### Installation

```
npm install @tedi-design-system/vue
```

Peer dependency: `vue` 3.5 or newer. Design tokens, fonts and icons come from `@tedi-design-system/core`, which is installed with the package.

### Setup

Import the stylesheet (fonts, tokens and component styles) once, at your app's entry point:

```ts
import '@tedi-design-system/vue/index.css';
```

To load only one Material Symbols style, use `index-without-icons.css` together with one of `icons/outlined.css`, `icons/rounded.css` or `icons/sharp.css`.

### Usage

TEDI-Ready components are exported from `@tedi-design-system/vue/tedi`, community components from `@tedi-design-system/vue/community`.

```vue
<script setup lang="ts">
import { TediIcon } from '@tedi-design-system/vue/tedi';
</script>

<template>
  <TediIcon name="home" />
</template>
```

Theming, Nuxt setup and icon fonts are covered in the [Get started](https://storybook.tedi.ee/vue/rc/?path=/docs/documentation-get-started--get-started) page in Storybook.

## AI Tooling

### For consumers: the `tedi-vue` skill

Helps AI coding agents build UIs with `@tedi-design-system/vue`. It lives in [`skills/tedi-vue`](./skills/tedi-vue) and teaches an agent the import paths and setup (Vue and Nuxt), how to read components, props, slots and events from the **installed package**, the library's API conventions (slots, `v-model`, compound components, `as` / `as-child`), theming with design tokens from `@tedi-design-system/core`, and the common pitfalls.

Install it into your agent (Claude Code, Cursor, Codex and others) with the [`skills`](https://www.skills.sh) CLI, from your project root:

```bash
npx skills add https://github.com/TEDI-Design-System/vue --skill tedi-vue
```

### For contributors: the `contributing` skill

Guides development inside this repository: creating components, tests, accessibility audits and Storybook stories. Available as `/contributing` when working in this repository. See [CONTRIBUTING.md](./CONTRIBUTING.md).

## Development

Requires Node 24 and npm 11 (see `.nvmrc`).

```
npm install
npm run build      # library build into dist/
npm run typecheck  # vue-tsc --noEmit
npm test           # Vitest unit tests
npm run test:coverage  # tests with the 80% coverage threshold
```

## License

[MIT](LICENSE)
