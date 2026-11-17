# Create TEDI Vue Storybook Stories

Target: the component given in the task.

## 1. Understand the Component

1. Read `TediName.vue` for props, emits, `v-model` bindings and slots.
2. **Figma is the source of truth for stories.** Fetch the design with the Figma MCP server. If there is
   no link, ask for one.
3. Read the React and Angular stories for the same component as a reference for coverage.

## 2. Map Figma Sections to Stories

- One named story export per Figma section, **in the same order and with the same naming** (`Default`,
  `WithIcon`, `States`, ...).
- Reproduce Figma's example content (labels, data, item count). Don't invent different data.
- Components with visual states (hover, active, focus, disabled, selected, error) get a `States` story.
- Show variants side by side, not stacked.
- Disabled, loading, error and empty states the component supports get a story even if Figma omits
  them; place them after the Figma-ordered stories.
- **Composition, not inline styles.** Lay out examples with core utility classes (`flex`,
  `align-items-center`, `gap-3`) or TEDI layout components once they exist, never `style="..."`.
- **No component machinery in stories.** If a story needs hand-written ARIA, keyboard handling or focus
  management, the component is missing that behaviour: raise it instead.

## 3. Story Title

Match the React hierarchy for the component's category folder:

| Component path                             | Title                                       |
| ------------------------------------------ | ------------------------------------------- |
| `src/tedi/components/base/`                | `TEDI-Ready/Base/<Name>`                    |
| `src/tedi/components/content/`             | `TEDI-Ready/Content/<Name>`                 |
| `src/tedi/components/layout/`              | `TEDI-Ready/Layout/<Name>`                  |
| Any other `src/tedi/components/<category>` | `TEDI-Ready/Components/<Category>/<Name>`   |
| `src/community/components/<category>`      | `Community/<Category>/<Name>`               |
| MDX docs page in `src/docs/`               | `Documentation/<Page>` (`<Meta title=...>`) |

`<Name>` drops the `Tedi` prefix (`TediIcon` is `TEDI-Ready/Base/Icon`). `.storybook/preview.ts` sorts
`Documentation`, then `TEDI-Ready`, then `Community`.

## 4. Stories File

```ts
import type { Meta, StoryObj } from '@storybook/vue3-vite';

import { TediName } from './index';

/**
 * <a href="https://www.figma.com/design/jWiRIXhHRxwVdMSimKX2FF/...?node-id=<node>&m=dev" target="_blank">Figma ↗</a>
 */
const meta = {
  title: 'TEDI-Ready/Components/Buttons/Name',
  component: TediName,
  argTypes: {
    variant: { control: 'radio', options: ['primary', 'secondary'] },
  },
  args: { variant: 'primary' },
} satisfies Meta<typeof TediName>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => ({
    components: { TediName },
    setup: () => ({ args }),
    template: '<TediName v-bind="args">Label</TediName>',
  }),
};

export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { TediName },
    template: `
      <div class="flex gap-3">
        <TediName variant="primary">Primary</TediName>
        <TediName variant="secondary">Secondary</TediName>
      </div>
    `,
  }),
};
```

Rules:

- Autodocs is on globally (`tags: ['autodocs']` in `.storybook/preview.ts`); don't repeat it.
- Prop descriptions, types and defaults come from the component's JSDoc through `vue-component-meta`.
  Don't repeat them in `argTypes`; add `argTypes` only to choose a control or list `options`.
- **The `Default` story's controls must drive the component**: bind `args` with `v-bind="args"`. Bind
  `v-model` through a local `ref` in `setup` when the story needs two-way state.
- Showcase stories that render fixed configurations disable the controls panel.
- **Figma link** only for the TEDI Figma file (`figma.com/design/jWiRIXhHRxwVdMSimKX2FF/...`), as a
  JSDoc anchor directly above the meta. A Zeroheight link goes on the next line after `<br>`.

## 5. Prose: Default to None

The bar for any docblock is "is this invisible in the rendered story?". A story that looks like its name
(`Default`, `Disabled`, `WithIcon`) needs no prose. Don't restate the story name, compare with other
components, or describe internal wiring. The meta docblock keeps only what a consumer can't see from the
types: required setup, and accessibility wiring that silently fails if done the usual way.

## 6. Verify

```bash
npm start   # http://localhost:4500
```

- Stories appear under the right title, in Figma order
- Changing a control in `Default` updates the rendered component
- The a11y panel shows no violations, in light and dark theme (toolbar)
- No console errors
