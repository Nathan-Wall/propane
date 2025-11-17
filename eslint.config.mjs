// @ts-check

import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import prettier from 'eslint-config-prettier/flat';

export default defineConfig(
  // 1) Global ignores (replacement for .eslintignore)
  {
    name: 'setup/ignores',
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
      '**/.next/**',
      '**/.nuxt/**',
      '**/out/**',
      '**/.turbo/**',
      '**/.yarn/**',
      '**/*.min.*',
    ],
  },

  // 2) Core JS recommended rules
  eslint.configs.recommended,

  // 3) TS rules (typed): correctness + light style
  //    See "recommendedTypeChecked" and "stylisticTypeChecked".
  //    These require parserOptions.projectService: true.
  tseslint.configs.recommendedTypeChecked,
  tseslint.configs.stylisticTypeChecked,

  // 4) Project-wide language options + a few common rules
  {
    name: 'setup/options-and-rules',
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        // Enables type-aware rules without listing tsconfig files by hand.
        projectService: true,
        // If your config sits outside the TS project root or you’re in a monorepo,
        // uncomment the next line to avoid path resolution issues:
        // tsconfigRootDir: new URL('.', import.meta.url).pathname,
      },
      // Flat config doesn’t use `env`; use `globals` instead.
      // Add/remove sets to match your runtime.
      globals: {
        ...globals.node,
        ...globals.browser,
        // If you use a test runner, add one:
        // ...globals.jest,
        // ...globals.vitest,
      },
    },
    rules: {
      // Core ergonomics
      curly: ['error', 'all'],
      eqeqeq: ['error', 'smart'],
      'no-console': 'off',
      'max-len': [
        'error',
        {
          code: 80,
          tabWidth: 2,
          ignoreStrings: true,
          ignoreTemplateLiterals: true,
          ignoreComments: true,
          ignoreUrls: true,
        },
      ],

      // TS quality & DX
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^unused_',
          varsIgnorePattern: '^unused_',
          caughtErrorsIgnorePattern: '^unused_',
        },
      ],
    },
  },

  // 5) Turn off type-aware linting on plain JS files (faster, avoids TS project errors)
  {
    name: 'overrides/disable-type-checked-on-js',
    files: ['**/*.{js,cjs,mjs,jsx}'],
    extends: [tseslint.configs.disableTypeChecked],
  },

  // 6) Keep Prettier in charge of formatting — must be last
  prettier,
);
