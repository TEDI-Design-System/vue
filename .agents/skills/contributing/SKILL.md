---
name: contributing
description: >
  Guide for contributing to TEDI Design System Vue. Covers creating new components (Figma-driven),
  running tests and lint, WCAG accessibility audits and Storybook story creation. Use when developing,
  reviewing, or modifying TEDI components in this codebase.
---

# TEDI Vue Contributing

## Before Any Code

1. Read `AGENTS.md` for the component, styling and export conventions.
2. If creating or modifying a component, find its equivalent in TEDI React
   (`../react/src/tedi/components/`) and TEDI Angular (`../angular/src/tedi/components/`). Match their
   public API and behaviour; use React for the category folder and story title.
3. Check the installed TEDI Core (`node_modules/@tedi-design-system/core/`: `variables/`, `tokens.json`,
   `_mixins.scss`) for design tokens, mixins and shared styles. It matches the version the library builds
   against. Read `../core/src/` only when core is being changed together with the component.
4. Check `package.json` before considering any new dependency.

## Task Router

Load the reference that matches the task:

| If the task involves...                  | Load reference                                  |
| ---------------------------------------- | ----------------------------------------------- |
| Creating a new component from scratch    | [new-component.md](references/new-component.md) |
| Running tests, fixing test/lint failures | [testing.md](references/testing.md)             |
| WCAG audit or accessibility review       | [a11y-review.md](references/a11y-review.md)     |
| Creating or updating Storybook stories   | [stories.md](references/stories.md)             |

For **compound tasks**, follow the primary workflow and load the others as needed. Creating a component
also needs testing.md and stories.md at the end.

## Cross-Cutting Rules

### Figma Integration

Use the Figma MCP server to fetch design context, screenshots and metadata from the provided Figma link.
Extract spacing, colours, typography and states, then map them to core tokens.

### Third-Party Libraries

Prefer existing dependencies. When a new one is needed, **stop and ask for permission** with: library
name, why it's needed, alternatives considered, and bundle size impact.

### Parallel Work

For bulk tasks (e.g. "audit all form components for a11y"), launch parallel agents, one per component,
then collect and summarise the results.

### Consumer-Facing Docs

Consumers learn a component's API from the published type declarations and Storybook, both generated
from the source. What a prop, emit or slot does goes in its JSDoc (with `@default`), not in a
hand-written table.

### Communication

- Be direct and concise.
- **Prose defaults to nothing.** Comments, JSDoc and story docblocks say what the code and the rendered
  story can't. Explain the "why", not the "what".
