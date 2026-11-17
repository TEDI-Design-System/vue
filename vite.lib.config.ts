import { appendFileSync, copyFileSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig, mergeConfig, type Plugin } from 'vite';
import dts from 'vite-plugin-dts';
import { viteStaticCopy } from 'vite-plugin-static-copy';

import packageJson from './package.json' with { type: 'json' };
import baseConfig from './vite.config';

const externalDependencies = Object.keys(packageJson.peerDependencies);

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
        { src: ['package.json', 'README.md', 'LICENSE'], dest: './' },
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
