# Contributing to TEDI Vue

Thanks for helping improve `@tedi-design-system/vue`. This page covers what is specific to this repository. The full process (component tiers, Definition of Done, Gitflow, release process) is in the [TEDI wiki](https://github.com/TEDI-Design-System/general/wiki).

Everyone taking part is expected to follow the [Code of Conduct](https://github.com/TEDI-Design-System/.github/blob/main/CODE_OF_CONDUCT.md).

## Reporting issues

- **Bugs:** open an issue and pick the template that matches the component tier (TEDI-READY or community).
- **New components and feature ideas:** propose them in [Discussions](https://github.com/TEDI-Design-System/general/discussions).
- **Design or UX problems:** report them in the [design](https://github.com/TEDI-Design-System/design/issues) repository.
- **Accessibility problems:** use the "Accessibility issue" template.
- **Security vulnerabilities:** do not open a public issue. Report privately via [Security → Report a vulnerability](https://github.com/TEDI-Design-System/vue/security/advisories/new) or email info@tedi.ee. See the [security policy](https://github.com/TEDI-Design-System/.github/blob/main/SECURITY.md).
- **Questions:** ask in the [TEDI Slack](https://join.slack.com/t/tedisystem/shared_invite/zt-3hd8tnjf7-Z1smXI~ns0p8E2cxoFUKbQ). See [Getting help](https://github.com/TEDI-Design-System/.github/blob/main/SUPPORT.md) for other channels.

## Making a change

1. Open an issue first and describe what you plan to do. New components start as a [Discussion](https://github.com/TEDI-Design-System/general/discussions), where the API can be agreed before an issue is created.
2. Branch off `rc` (fork the repository if you don't have push access). Name the branch `<type>/<issue number>-<short-description>`, for example `feat/123-add-tooltip`.
3. Write commits in the [commit convention](https://github.com/TEDI-Design-System/general/wiki/Commit-convention) format with the issue number in the header, for example `feat(icon): Add TediIcon Component #15`. A `commit-msg` hook checks the format, and a `pre-commit` hook runs lint-staged on the staged files.
4. Open a pull request against `rc`. Add `Closes #<issue number>` to the description so the issue closes on merge.

Maintainers and fork contributors have slightly different steps for test environments. See [Contributor workflow](https://github.com/TEDI-Design-System/general/wiki/Contributor-workflow).

## Local setup

Requires Node.js 24 and npm 11 (see `.nvmrc`).

```bash
npm install
npm run start          # Storybook on http://localhost:4500
npm run lint           # Stylelint + ESLint, with --fix
npm run typecheck      # vue-tsc
npm run test           # Vitest
npm run test:coverage  # Vitest with coverage (80% threshold)
npm run build          # library build into dist/
npm run build:sb       # static Storybook into dist/storybook-static
npm run test:ssr       # Nuxt SSR smoke test of the packed library (after npm run build)
```

On Windows, enable symlinks before cloning. `.claude/skills/` links to `.agents/skills/`, and without symlinks Claude Code doesn't find the repository's skills. Turn on Developer Mode, then:

```bash
git clone -c core.symlinks=true <repo-url>
```

In an existing clone, run `git config core.symlinks true`, delete the files under `.claude/skills/` and run `git checkout -- .claude/skills`.

## Writing components

Components live in two tiers: `src/tedi/` (TEDI-READY, must meet the [Definition of Done](https://github.com/TEDI-Design-System/general/wiki/Definition-of-Done)) and `src/community/` (looser requirements). The tiers are described on the Storybook welcome page.

In short (the full conventions are in [AGENTS.md](AGENTS.md)):

- Single-file components with `<script setup lang="ts">` and typed `defineProps`, `defineEmits` and `defineModel`.
- Components are named `TediName` and exported by name, never as a default export.
- Styles are global SCSS with BEM `tedi-` classes in the component's `name.scss`, imported by the component's `.vue` file. No `<style scoped>`. Colours and spacing come from `@tedi-design-system/core` tokens.
- Components must render on the server: browser APIs only in `onMounted` or event handlers.
- Every component has unit tests (`TediName.spec.ts`) and stories (`TediName.stories.ts`). Match the API and behaviour of the React and Angular implementations.

## Accessibility

TEDI targets WCAG 2.2 level AA. Storybook runs axe on every story (the Accessibility panel) and reports violations as errors. Fix them rather than disabling rules. The automated check catches only part of the problems: TEDI-READY components also need manual testing (keyboard, screen reader, zoom), as listed in the Definition of Done.

## CI and releases

Every pull request to `rc` or `main` runs lint, typecheck, the library build, the Nuxt SSR smoke test and the tests with coverage (reported to Codecov). Run `npm run lint`, `npm run typecheck` and `npm test` locally before opening a pull request. Chromatic visual tests run once a pull request is approved (and on every push to `rc`), and comment the result on the pull request. Automated releases are not set up yet.

## AI tooling

The repository ships a `contributing` skill for AI coding agents, available as `/contributing`. It covers creating components, tests, accessibility audits and stories. [AGENTS.md](AGENTS.md) holds the conventions agents load automatically.
