import { create } from 'storybook/theming';

export default create({
  base: 'dark',
  brandTitle: 'TEDI Vue components',
  brandUrl: 'https://storybook.tedi.ee/vue',
  brandImage: 'TEDI-logo-valge.svg',
  brandTarget: '_self',

  // TEDI green-700: tells the Vue Storybook apart from react (blue) and angular (light) at a glance.
  appBg: '#266b42',
  colorPrimary: '#ff8000',
  colorSecondary: '#ffffff80',

  textColor: '#fff',
  textInverseColor: '#ffffff',

  barTextColor: '#fff',
  textMutedColor: '#fff',
});
