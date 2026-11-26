# WCAG Accessibility Review

Target: the component given in the task.

## Standard

TEDI follows EN 301 549 and, for web content, **WCAG 2.2 level AA**. Check the criteria new in 2.2
explicitly (2.4.11 Focus Not Obscured, 2.5.7 Dragging Movements, 2.5.8 Target Size) and report a
failure as a Major finding like any other AA violation. The
[accessibility page on tedi.ee](https://www.tedi.ee/1ee8444b7/p/33df89-sissejuhatus/b/05a2e8) is the
canonical statement.

Storybook runs axe on every story through `@storybook/addon-a11y` with `test: 'error'` and the
`target-size` rule enabled. A clean axe run is necessary but not sufficient: keyboard, screen reader and
zoom need a manual check.

## Audit Procedure

### 1. Read the Component

- `TediName.vue`: template roles, `aria-*` bindings, semantic elements, event handlers
- `name.scss`: focus styles, contrast, reduced motion
- `TediName.spec.ts`: whether the accessibility behaviour is tested

### 2. ARIA & Semantics

Check against the WAI-ARIA Authoring Practices pattern for the component:

- [ ] Correct `role`, and required ARIA attributes (`aria-label`, `aria-labelledby`,
      `aria-describedby`, `aria-expanded`, `aria-selected`, `aria-checked`, ...)
- [ ] Ids referenced by ARIA attributes come from `useId()`, so they are unique and SSR safe
- [ ] `aria-live` regions for dynamic content updates
- [ ] Semantic HTML (`<button>`, `<input>`, `<nav>`, `<dialog>`) instead of ARIA on `<div>`/`<span>`
- [ ] No redundant ARIA (e.g. `role="button"` on `<button>`)
- [ ] `aria-hidden="true"` on decorative elements (decorative icons)
- [ ] Attributes passed by the consumer reach the right element (`inheritAttrs: false` plus
      `v-bind="$attrs"` when the root is a wrapper)

### 3. Keyboard Navigation

- [ ] All standalone interactive elements reachable with Tab
- [ ] Composite widgets (listbox, menu, tabs, grid) are a single Tab stop with arrow-key navigation
- [ ] No positive `tabindex`
- [ ] Enter/Space activates buttons and controls; Escape closes overlays and returns focus
- [ ] Home/End move to the first/last item where applicable
- [ ] No keyboard traps

### 4. Focus Management

- [ ] Visible focus indicator on all interactive elements
- [ ] Focus moves to newly opened content and returns to the trigger on close
- [ ] No focus on hidden elements
- [ ] Focused element not hidden behind sticky or overlaid content (2.4.11)

### 5. Visual & Motion

- [ ] Text contrast 4.5:1 (3:1 large text), UI component contrast 3:1, in light and dark theme
- [ ] Information not conveyed by colour alone
- [ ] `prefers-reduced-motion` respected
- [ ] Usable at 200% zoom

### 6. Touch & Pointer

- [ ] Targets at least 24x24 CSS pixels or enough spacing (2.5.8)
- [ ] Dragging has a single-pointer alternative (2.5.7)
- [ ] Nothing depends on hover alone

### 7. Test Coverage

- [ ] ARIA attributes asserted in the spec
- [ ] Keyboard behaviour and focus movement asserted
- [ ] Disabled state blocks interaction and is exposed to assistive tech

### 8. Report

Group findings by severity:

- **Critical**: WCAG A violations, keyboard traps, missing roles on interactive elements
- **Major**: WCAG AA violations, missing ARIA attributes, no visible focus indicator
- **Minor**: best-practice improvements, missing reduced-motion handling, missing tests

For each finding give the file and line, the issue, the fix, and the WCAG criterion (e.g. 2.1.1
Keyboard, 4.1.2 Name, Role, Value).
