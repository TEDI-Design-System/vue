import { type Decorator, type Preview, setup } from '@storybook/vue3-vite';
import { h, ref } from 'vue';

import { createTedi } from '../src/tedi/providers/create-tedi';
import { TediLabelProvider } from '../src/tedi/providers/label-provider';
import type { TediTheme } from '../src/tedi/providers/theme-provider';

import { freezeDateInChromatic } from './fixed-date';
import { StorybookHtmlLang } from './html-lang';

import '../src/tedi/styles/index.scss';
import '../node_modules/@tedi-design-system/core/icons/_all.scss';
import '../node_modules/@tedi-design-system/core/tedi-storybook-styles.scss';

freezeDateInChromatic();

// The toolbar's theme, shared by every story app (Storybook is client only, so module state is fine). Each story
// app installs createTedi with it, and the library keeps the `tedi-theme--<name>` class on <html> in sync, as in a
// consumer app; preview-head.html paints the surface from the same class.
const storybookTheme = ref<TediTheme>('default');
const toolbarTheme = (globals: Record<string, unknown> | undefined) => (globals?.theme as TediTheme) ?? 'default';

setup((app, context) => {
  storybookTheme.value = toolbarTheme(context?.globals);
  // No cookies: the toolbar is the source of truth.
  app.use(createTedi({ theme: storybookTheme, persist: false }));
});

// Decorators re-run when a toolbar global changes, without remounting the story app.
const themeDecorator: Decorator = (story, context) => {
  storybookTheme.value = toolbarTheme(context.globals);
  return story();
};

// Every story gets its own label provider (Estonian, changeable with
// setLocale), and <html lang> follows its locale for axe and screen readers.
const localeDecorator: Decorator = (story) => ({
  render: () => h(TediLabelProvider, null, () => [h(StorybookHtmlLang), h(story())]),
});

const preview: Preview = {
  tags: ['autodocs'],
  decorators: [themeDecorator, localeDecorator],
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'TEDI theme',
      toolbar: {
        icon: 'paintbrush',
        items: [
          { value: 'default', title: 'Light mode (default)' },
          { value: 'dark', title: 'Dark mode' },
        ],
      },
    },
  },
  initialGlobals: {
    theme: 'default',
    backgrounds: { value: 'default' },
  },
  parameters: {
    viewMode: 'docs',
    options: {
      storySort: {
        order: ['Documentation', ['Welcome', '*'], 'TEDI-Ready', 'Community'],
      },
    },
    a11y: {
      test: 'error',
      // axe leaves target-size (WCAG 2.2, 2.5.8) off by default. Set via options.rules, not
      // config.rules, so stories that override config.rules don't drop it (same as react).
      options: {
        rules: { 'target-size': { enabled: true } },
      },
    },
    backgrounds: {
      options: {
        default: { name: 'Default', value: 'var(--general-surface-primary)' },
        inverted: { name: 'Inverted', value: 'var(--general-surface-inverted-primary)' },
        brand: { name: 'Brand', value: 'var(--general-surface-brand-primary)' },
      },
    },
    docs: {
      codePanel: true,
      toc: true,
    },
  },
};

export default preview;
