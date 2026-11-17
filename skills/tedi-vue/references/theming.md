# Theming

TEDI's look comes from design tokens in `@tedi-design-system/core`, exposed as CSS custom properties. Components use
global BEM classes with the `tedi-` prefix.

## Setup

Load the stylesheet once (see SKILL.md → Setup):

```ts
import '@tedi-design-system/vue/index.css';
```

For your own SCSS, `@tedi-design-system/core` is installed with the library. Add it to your `dependencies` if you
`@use` it directly, so you don't rely on a transitive install:

```scss
@use '@tedi-design-system/core/mixins';
@use '@tedi-design-system/core/bootstrap-utility/breakpoints';
```

## Theme switching

Themes are a class on `<html>`:

| Theme     | Class                 |
| --------- | --------------------- |
| `default` | `tedi-theme--default` |
| `dark`    | `tedi-theme--dark`    |

The default theme's tokens are also declared on `:root`, so a page without a class renders in the default theme. The
Vue library has no theme provider (unlike React's `ThemeProvider` and Angular's `provideTedi`); manage the class
yourself.

A small composable for a Vue SPA. Touch `document` only on the client, and persist the choice if you want it to
survive reloads:

```ts
// useTediTheme.ts
import { onMounted, ref, watch } from 'vue';

export type TediTheme = 'default' | 'dark';

export function useTediTheme() {
  const theme = ref<TediTheme>('default');

  onMounted(() => {
    try {
      theme.value = (localStorage.getItem('tedi-theme') as TediTheme | null) ?? 'default';
    } catch {
      // storage unavailable: keep the default
    }
    watch(
      theme,
      (value) => {
        const html = document.documentElement;
        html.classList.remove('tedi-theme--default', 'tedi-theme--dark');
        html.classList.add(`tedi-theme--${value}`);
        try {
          localStorage.setItem('tedi-theme', value);
        } catch {
          // ignore
        }
      },
      { immediate: true },
    );
  });

  return theme;
}
```

In **Nuxt**, set the class through `useHead` so it is server-rendered and there is no flash of the wrong theme. Keep the
choice in a cookie, which the server can read:

```ts
// app.vue <script setup>
const theme = useCookie<'default' | 'dark'>('tedi-theme', { default: () => 'default' });

useHead({ htmlAttrs: { class: () => `tedi-theme--${theme.value}` } });
```

The cookie name is your choice; `tedi-theme` matches the React and Angular libraries.

## Design tokens

Tokens come in two layers: **semantic** `--general-*` tokens (role based: text, surface, border, status) and
**primitive** `--tedi-*` tokens (the raw scale). Prefer semantic tokens; use a primitive only when no semantic token
fits. Semantic tokens re-theme in dark mode, primitives don't.

| Category   | Examples                                                                                      |
| ---------- | --------------------------------------------------------------------------------------------- |
| Text       | `--general-text-primary`, `--general-text-secondary`, `--general-text-disabled`               |
| Surface    | `--general-surface-primary`, `--general-surface-secondary`, `--general-surface-brand-primary` |
| Border     | `--general-border-primary`, `--general-border-secondary`, `--general-border-brand`            |
| Status     | `--general-status-danger-text`, `--general-status-success-border`                             |
| Primitives | `--tedi-primary-600`, `--tedi-neutral-900`, `--tedi-green-600`                                |
| Spacing    | `--tedi-dimensions-02`, `--tedi-dimensions-04`, `--layout-grid-gutters-16`                    |
| Radius     | `--tedi-radius-02-default`, `--tedi-radius-08`                                                |
| Typography | `--family-default`, `--heading-h3-size`, `--heading-h3-weight`                                |

**Look token names up, don't recall them.** The full, machine-readable list ships with the installed core:

```
node_modules/@tedi-design-system/core/tokens.json
```

It is generated from Figma. `themes.default` holds two tiers, `base` (the `--tedi-*` primitives) and `semantic` (the
role tokens); `themes.dark` holds the dark overrides; `breakpoints` the responsive values. Each entry is
`{ value, resolved }`, so you get both the `var()` chain and the computed colour:

```bash
# does a token exist, and what does it resolve to?
python3 -c "import json;t=json.load(open('node_modules/@tedi-design-system/core/tokens.json'));print(t['themes']['default']['semantic']['general-surface-primary'])"
# find every surface token
python3 -c "import json;t=json.load(open('node_modules/@tedi-design-system/core/tokens.json'));print([k for k in t['themes']['default']['semantic'] if 'surface' in k])"
```

The table shows the naming pattern, not the full set. Never invent a token name, and never fall back to a hex value
because a guessed token didn't work.

Use tokens in your own styles:

```scss
.my-section {
  padding: var(--tedi-dimensions-04);
  background-color: var(--general-surface-primary);
  border-radius: var(--tedi-radius-02-default);
}
```

**Do not add `var()` fallbacks.** Write `var(--general-surface-primary)`, not `var(--general-surface-primary, #fff)`.
A fallback hides a missing token and breaks theming.

Utility classes from core (spacing, flex, text) are part of `index.css`; see the
[core CSS utilities reference](https://github.com/TEDI-Design-System/core/blob/rc/docs/css-utilities.md).

## Custom themes

Only `default` and `dark` are bundled. A custom theme overrides tokens under its own class:

```scss
.tedi-theme--my-brand {
  --general-surface-brand-primary: var(--my-brand-600);
  // … override the semantic tokens you need
}
```

Generate a full theme from your project's Figma variables with the
[TEDI Figma Variable Exporter plugin](https://www.figma.com/community/plugin/1612732083806730958), load its CSS after
the TEDI stylesheet, and set `tedi-theme--<name>` on `<html>`. An unknown class fails silently: components keep the
default theme's values from `:root`.

## Overriding component styles

Vue components use **global** BEM classes (not CSS Modules, so nothing is hashed): `.tedi-<name>`,
`.tedi-<name>__<element>`, `.tedi-<name>--<modifier>`. Read the class names from the rendered DOM or the component's
stylesheet in the repo.

Prefer, in order:

1. a prop (`variant`, `size`, `color`) that already gives the look you need;
2. a class on the component (falls through to its root) that sets tokens or layout around it;
3. overriding a TEDI class, scoped to your own context so it doesn't leak:

```scss
.checkout .tedi-status-badge {
  margin-inline-start: var(--tedi-dimensions-02);
}
```

Your own SFCs can use `<style scoped>`; to reach a TEDI component's inner element from scoped styles use `:deep()`:

```vue
<style scoped lang="scss">
.summary :deep(.tedi-icon) {
  vertical-align: middle;
}
</style>
```

Overriding internal elements ties you to markup that can change between versions; a missing prop is worth an issue in
the [vue repository](https://github.com/TEDI-Design-System/vue/issues).

## Responsive styles

Breakpoints: `xs` (< 576px), `sm` (≥ 576px), `md` (≥ 768px), `lg` (≥ 992px), `xl` (≥ 1200px), `xxl` (≥ 1400px).

```scss
@use '@tedi-design-system/core/bootstrap-utility/breakpoints' as bp;

.my-component {
  padding: var(--tedi-dimensions-02);

  @include bp.media-breakpoint-up(md) {
    padding: var(--tedi-dimensions-04);
  }
}
```
