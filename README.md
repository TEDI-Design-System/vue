# TEDI Design System for Vue

`@tedi-design-system/vue` is a library of Vue 3 components implementing the TEDI Design System.

> The library is in early development and does not ship components yet.

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

```ts
import { /* components */ } from '@tedi-design-system/vue/tedi';
```

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
