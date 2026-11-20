import type { Decorator, Preview } from '@storybook/vue3-vite';

import { freezeDateInChromatic } from './fixed-date';

import '../src/tedi/styles/index.scss';
import '../node_modules/@tedi-design-system/core/icons/_all.scss';
import '../node_modules/@tedi-design-system/core/tedi-storybook-styles.scss';

freezeDateInChromatic();

type Theme = 'default' | 'dark';

// Core keys theme tokens off a `tedi-theme--<name>` class on <html>; preview-head.html paints the
// surface from the same class. Replace with the library's theme provider once it exists.
const themeDecorator: Decorator = (story, context) => {
  const theme = (context.globals.theme ?? 'default') as Theme;
  const html = document.documentElement;
  html.classList.remove('tedi-theme--default', 'tedi-theme--dark');
  html.classList.add(`tedi-theme--${theme}`);
  return story();
};

const preview: Preview = {
  tags: ['autodocs'],
  decorators: [themeDecorator],
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
        order: [
          'Documentation',
          ['Welcome', 'Get started', 'Colors', 'CSS utilities', '*', 'Changelog'],
          'TEDI-Ready',
          'Community',
        ],
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
