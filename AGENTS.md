# AGENTS.md

Guidance for AI coding agents working in this repository.

**Before working on components, read `.agents/skills/contributing/SKILL.md`.** It routes to the
references for new components, tests, a11y and stories. Harnesses with skill support load it from
`.agents/skills/` (Claude Code through the `.claude/skills/contributing` symlink).

## Project Overview

TEDI Design System Vue component library (`@tedi-design-system/vue`). Vue 3.5 single-file components,
built as a library with Vite and documented in Storybook 10. It is the third TEDI implementation, next
to React and Angular, and follows their component APIs and behaviour.

Two entry points:

- `@tedi-design-system/vue/tedi`: TEDI-Ready components (maintained by the TEDI team, strict rules)
- `@tedi-design-system/vue/community`: Community components (contributor-owned, NOT a reference for
  TEDI patterns)

The tiers are defined in `node_modules/@tedi-design-system/core/docs/component-types.md`.

## Commands

Node 24, npm 11 (`.nvmrc`).

```bash
npm start                  # Storybook dev server (port 4500)
npm test                   # Vitest, single run
npm run test:watch         # Vitest in watch mode
npx vitest run <path>      # One component (exits 1 if the path matches no spec)
npm run test:coverage      # Vitest with the 80% coverage threshold
npm run typecheck          # vue-tsc over the lib, node, spec and .storybook tsconfigs
npm run lint               # Stylelint (SCSS, Vue) + ESLint, with --fix
npm run lint:ci            # Same without --fix, errors only
npm run build              # Library build to dist/
npm run build:sb           # Static Storybook to dist/storybook-static
npm run test:ssr           # Nuxt SSR smoke test of the packed library (run npm run build first)
```

Before finishing a change, run `npm run lint`, `npm run typecheck` and `npm test`.

## Architecture

### Directory Layout

- `src/tedi/components/<category>/<name>/`: TEDI-Ready components. Categories mirror react: `base`,
  `buttons`, `content`, `filter`, `form`, `layout`, `loaders`, `misc`, `navigation`, `notifications`,
  `overlays`, `tags`.
- `src/tedi/styles/index.scss`: the global stylesheet. Loads core's `index-without-icons` and `@use`s
  every component stylesheet.
- `src/tedi/index.ts`, `src/community/index.ts`: entry point barrels.
- `src/community/`: Community components (separate entry point).
- `src/docs/`: Storybook MDX documentation pages.
- `.storybook/`: Storybook config, TEDI theme and the light/dark theme toolbar.

### Component File Convention

`TediIcon` (`src/tedi/components/base/icon/`) is the reference component. Each component folder holds:

```text
TediName.vue        # SFC: <template> + <script setup lang="ts">, no <style> block
name.scss           # Global BEM styles, @use'd from src/tedi/styles/index.scss
TediName.spec.ts    # Vitest + Vue Test Utils
TediName.stories.ts # Storybook stories (CSF 3)
index.ts            # Named re-exports of the component and its public types
```

### Component Patterns

- `<script setup lang="ts">` only. No Options API, no `defineComponent` in library code.
- Typed macros: `defineProps<TediNameProps>()`, `defineEmits<{ change: [value: string] }>()`,
  `defineModel<T>()` for `v-model`. Declare defaults by destructuring props
  (`const { size = 'default' } = defineProps<TediNameProps>()`).
- JSDoc on every public prop, emit and slot, with `@default` where there is one. Storybook docgen
  (`vue-component-meta`) reads it.
- Names: component and file `TediName` (PascalCase, `Tedi` prefix), props type `TediNameProps`, root
  class `tedi-name`.
- SSR safe: no `window`, `document` or other browser APIs at module top level or during setup. Touch
  them in `onMounted` (and clean up in `onBeforeUnmount`). Generate DOM ids with `useId()`.

### Export Chain

`src/tedi/index.ts` → component `index.ts` → `TediName.vue`. Named exports only:

```ts
// src/tedi/components/base/icon/index.ts
export { default as TediIcon } from './TediIcon.vue';
export type { TediIconProps } from './TediIcon.vue';

// src/tedi/index.ts
export * from './components/base/icon';
```

Published subpaths: `/tedi`, `/community`, `/index.css`, `/index-without-icons.css`, `/icons/*.css`.

## Styling

- Global SCSS, never `<style scoped>` or a `<style>` block in the SFC. Each component stylesheet is
  `@use`d from `src/tedi/styles/index.scss` so it lands in `dist/index.css`; do not import it from the
  component or its `index.ts`.
- BEM with `tedi-` prefix: `.tedi-name`, `.tedi-name__element`, `.tedi-name--modifier`. Stylelint
  enforces the pattern.
- Design tokens only, from `@tedi-design-system/core` (6.13.0). Stylelint rejects raw colour values.
- Max nesting depth: 4.

## Testing and Storybook

- Vitest, jsdom, `@vue/test-utils`, `@testing-library/jest-dom` matchers (`vitest.setup.ts`). 80%
  threshold on statements, branches, functions and lines over `src/tedi/components/**`. Patterns:
  `.agents/skills/contributing/references/testing.md`.
- Stories at `src/tedi/**/*.stories.ts`, docs pages at `src/docs/**/*.mdx`. Titles:
  `TEDI-Ready/Components/<Category>/<Name>` (`TEDI-Ready/<Base|Content|Layout>/<Name>` for those
  groups), `Community/<Category>/<Name>`, `Documentation/<Page>`. Rules:
  `.agents/skills/contributing/references/stories.md`.
- The Storybook a11y addon runs axe with `test: 'error'`; fix violations rather than disabling rules.

## Commits

- Conventional commits enforced by commitlint:
  [commit convention](https://github.com/TEDI-Design-System/general/wiki/Commit-convention).
- Format `type(scope): Subject #issue`, e.g. `feat(icon): Add TediIcon Component #15`.
- Issue reference required, subject at least 10 characters, Start Case subject (warning).
- The pre-commit hook runs lint-staged (Stylelint, ESLint, Prettier on staged files).

## Related Repositories

- **TEDI Angular** (`../angular/`): primary model for repo structure and conventions.
- **TEDI React** (`../react/`): behavioural reference and the category/story hierarchy.
- **TEDI Core** (`../core/`): design tokens, SCSS variables, fonts and icons.

> These sibling repositories exist in local development only. Do not rely on `../` paths in build
> scripts, tests or imports.

## Branches

- `main`: production releases
- `rc`: pre-releases (base branch for PRs)

PRs to `rc` and `main` run `.github/workflows/vue-test-and-lint.yml`: `lint:ci` + `typecheck`, `build`, `test:ssr` and
`test:coverage` (uploaded to Codecov; patch target 80% in `.codecov.yml`). semantic-release and Chromatic are not set up
yet (upcoming issues).

## Do NOT

- Use `<style scoped>`, CSS modules or a `<style>` block in an SFC: write global BEM SCSS in `name.scss`
- Import a component's SCSS from the component or its `index.ts`: `@use` it from `src/tedi/styles/index.scss`
- Hardcode colour values: always use `@tedi-design-system/core` tokens
- Use fallback values in CSS `var()`: write `var(--token-name)`, not `var(--token-name, fallback)`
- Use the Options API, `defineComponent` or runtime-only `defineProps({...})` declarations in library code
- Use default exports from `index.ts` files or barrels: named exports only
- Name a component or export without the `Tedi` prefix
- Access `window`, `document`, `localStorage` or `matchMedia` at module top level or during setup
- Add event listeners without removing them in `onBeforeUnmount`
- Use `any` (`@typescript-eslint/no-explicit-any` is an error) or `@ts-ignore`
- Use `src/community/` components as a reference for coding patterns
- Add a dependency without asking first
