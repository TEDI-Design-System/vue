import type { StorybookConfig } from '@storybook/vue3-vite';
import { fileURLToPath } from 'node:url';
import type { Plugin } from 'vite';

const excludeCommunity = process.env.STORYBOOK_EXCLUDE_COMMUNITY === 'true';

/**
 * Core writes font URLs as /fonts/, which only works when Storybook is served from the domain root.
 * The deployed build lives under a sub-path, so point the bundled CSS (in assets/) at ../fonts/,
 * where staticDirs copies the core fonts.
 */
const relativeFontUrls = (): Plugin => ({
  name: 'tedi-storybook-relative-font-urls',
  apply: 'build',
  generateBundle(_options, bundle) {
    for (const asset of Object.values(bundle)) {
      if (asset.type === 'asset' && asset.fileName.endsWith('.css') && typeof asset.source === 'string') {
        asset.source = asset.source.replace(/url\((['"]?)\/fonts\//g, 'url($1../fonts/');
      }
    }
  },
});

const config: StorybookConfig = {
  stories: [
    '../src/docs/**/*.mdx',
    '../src/docs/**/*.stories.ts',
    '../src/tedi/**/*.mdx',
    '../src/tedi/**/*.stories.ts',
    ...(excludeCommunity ? [] : ['../src/community/**/*.mdx', '../src/community/**/*.stories.ts']),
  ],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  core: {
    disableTelemetry: true,
  },
  staticDirs: ['../public', { from: '../node_modules/@tedi-design-system/core/fonts', to: '/fonts' }],
  framework: {
    name: '@storybook/vue3-vite',
    options: {
      docgen: {
        plugin: 'vue-component-meta',
        tsconfig: 'tsconfig.lib.json',
      },
    },
  },
  async viteFinal(config) {
    // Workaround for storybookjs/storybook#33537 (same as react): addon-docs resolves its MDX provider
    // to a `file://` URL that Vite's import analysis can't resolve. Convert it back to a path.
    const fileUrlResolveFix: Plugin = {
      name: 'tedi-storybook-mdx-file-url-fix',
      enforce: 'pre',
      resolveId(id) {
        return id.startsWith('file://') ? fileURLToPath(id) : null;
      },
    };

    return {
      ...config,
      plugins: [fileUrlResolveFix, ...(config.plugins ?? []), relativeFontUrls()],
    };
  },
};

export default config;
