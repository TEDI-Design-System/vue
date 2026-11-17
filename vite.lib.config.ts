import { appendFileSync, copyFileSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig, mergeConfig, type Plugin } from 'vite';
import dts from 'vite-plugin-dts';
import { viteStaticCopy } from 'vite-plugin-static-copy';

import packageJson from './package.json' with { type: 'json' };
import baseConfig from './vite.config';

// Runtime dependencies (reka-ui, @floating-ui/vue, ...) stay external like the peers, so consumers share one
// copy and their bundler tree-shakes it, instead of a copy being bundled into dist/.
const externalDependencies = [...Object.keys(packageJson.peerDependencies), ...Object.keys(packageJson.dependencies)];

const coreDir = './node_modules/@tedi-design-system/core';
const dist = (file: string) => resolve(import.meta.dirname, 'dist', file);

/**
 * The bundled CSS has no icon fonts (styles use core's index-without-icons). index.css gets all three
 * Material Symbols styles appended, and the icon-less bundle ships as index-without-icons.css so apps
 * can pair it with one icons/<style>.css. Core writes font URLs as /fonts/; they are rewritten to
 * ./fonts/ so they resolve next to the CSS in the published package.
 */
const tediStylesheets = (): Plugin => ({
  name: 'tedi-stylesheets',
  apply: 'build',
  closeBundle() {
    const indexCss = dist('index.css');
    const withoutIcons = dist('index-without-icons.css');
    // Runs once per output format: only rewrite root-relative URLs so a second pass is a no-op.
    writeFileSync(indexCss, readFileSync(indexCss, 'utf8').replace(/url\((['"]?)\/fonts\//g, 'url($1./fonts/'));
    copyFileSync(indexCss, withoutIcons);
    const allIcons = readFileSync(resolve(import.meta.dirname, coreDir, 'icons/all.css'), 'utf8');
    appendFileSync(indexCss, allIcons.replace(/\.\.\/fonts\//g, './fonts/'));
  },
});

/**
 * dist/package.json is what semantic-release publishes (pkgRoot: dist). Drop the repo-only fields so
 * `npm publish` from dist/ runs no lifecycle scripts (prepare would call husky) and consumers do not
 * see the dev tooling. `engines` (Node 24 / npm 11) is the contributor toolchain, not a consumer
 * requirement: Yarn 1 would refuse to install the package on an older Node.
 */
const repoOnlyFields = new Set(['scripts', 'devDependencies', 'commitlint', 'lint-staged', 'engines']);
const publishedPackageJson = (content: string) => {
  const published = Object.entries(JSON.parse(content)).filter(([key]) => !repoOnlyFields.has(key));
  return `${JSON.stringify(Object.fromEntries(published), null, 2)}\n`;
};

const libConfig = defineConfig({
  mode: 'production',
  plugins: [
    dts({
      processor: 'vue',
      tsconfigPath: './tsconfig.lib.json',
      entryRoot: './src',
      outDirs: './dist/src',
    }),
    viteStaticCopy({
      targets: [
        { src: 'package.json', dest: './', transform: publishedPackageJson },
        { src: ['README.md', 'LICENSE'], dest: './' },
        { src: `${coreDir}/fonts/*`, dest: './fonts', rename: { stripBase: true } },
        { src: `${coreDir}/icons/*.css`, dest: './icons', rename: { stripBase: true } },
      ],
    }),
    tediStylesheets(),
  ],
  build: {
    emptyOutDir: true,
    cssCodeSplit: false,
    copyPublicDir: false,
    lib: {
      entry: {
        tedi: resolve(import.meta.dirname, 'src/tedi/index.ts'),
        community: resolve(import.meta.dirname, 'src/community/index.ts'),
      },
      name: '@tedi-design-system/vue',
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => `${entryName}.${format === 'cjs' ? 'cjs' : 'es.js'}`,
      cssFileName: 'index',
    },
    rolldownOptions: {
      external: (id) => externalDependencies.some((pkg) => id === pkg || id.startsWith(`${pkg}/`)),
      output: {
        preserveModules: true,
        exports: 'named',
      },
    },
  },
});

export default mergeConfig(baseConfig, libConfig);
