// eslint.config.mjs
import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import { globalIgnores } from 'eslint/config';
import { qwikEslint9Plugin } from 'eslint-plugin-qwik';

const ignores = [
  "**/*.log",
  "**/.DS_Store",
  "**/*.",
  ".vscode/settings.json",
  "**/.history",
  "**/.yarn",
  "**/bazel-*",
  "**/bazel-bin",
  "**/bazel-out",
  "**/bazel-qwik",
  "**/bazel-testlogs",
  "**/dist",
  "**/dist-dev",
  "**/lib",
  "**/lib-types",
  "**/etc",
  "**/external",
  "**/node_modules",
  "**/temp",
  "**/tsc-out",
  "**/tsdoc-metadata.json",
  "**/target",
  "**/output",
  "**/rollup.config.js",
  "**/build",
  "**/.cache",
  "**/.vscode",
  "**/.rollup.cache",
  "**/dist",
  "**/tsconfig.tsbuildinfo",
  "**/vite.config.ts",
  "**/*.spec.tsx",
  "**/*.spec.ts",
  "**/.netlify",
  "**/pnpm-lock.yaml",
  "**/package-lock.json",
  "**/yarn.lock",
  "**/server",
  "eslint.config.js",
];

export default tseslint.config(
  globalIgnores(ignores),
  js.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  qwikEslint9Plugin.configs.recommended,
  {
    files: ['src/**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}'],
    languageOptions: {
      globals: {
        ...globals.serviceworker,
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-redundant-type-constituents': 'off',
      '@typescript-eslint/no-duplicate-type-constituents': 'off',
      '@typescript-eslint/no-base-to-string': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/only-throw-error': 'off',
      'indent': ['error', 2],
      'quotes': ['error', 'single'],
      'semi': ['error', 'always'],
      'comma-dangle': ['error', 'always-multiline'],
      'no-trailing-spaces': ['error'],
      'no-multiple-empty-lines': ['error', { max: 1 }],
      'block-spacing': ['error', 'always'],
      'object-curly-spacing': ['error', 'always'],
      'array-bracket-spacing': ['error', 'never'],
      'key-spacing': ['error', { beforeColon: false, afterColon: true }],
      'keyword-spacing': ['error', { before: true, after: true }],
    },
  }
);