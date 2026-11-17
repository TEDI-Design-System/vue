// @ts-check
import eslint from '@eslint/js';
import vuePrettier from '@vue/eslint-config-prettier';
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript';
import { globalIgnores } from 'eslint/config';
import pluginVue from 'eslint-plugin-vue';
import globals from 'globals';

export default defineConfigWithVueTs(
  globalIgnores(['dist/**', 'coverage/**', 'storybook-static/**']),
  {
    files: ['**/*.{js,ts,vue}'],
  },
  eslint.configs.recommended,
  pluginVue.configs['flat/recommended'],
  vueTsConfigs.recommended,
  {
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      // Optional props typed via defineProps<T>() are undefined when omitted; no placeholder defaults needed.
      'vue/require-default-prop': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['*.config.{js,ts}', '.github/**/*.mjs'],
    languageOptions: {
      globals: globals.node,
    },
  },
  vuePrettier,
  {
    // The Vue preset reports formatting as warnings, which `lint:ci --quiet` would hide. Match react.
    rules: {
      'prettier/prettier': 'error',
    },
  },
);
