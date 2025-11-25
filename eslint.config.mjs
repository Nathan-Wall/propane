// @ts-check

import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import prettier from 'eslint-config-prettier/flat';
import unicorn from 'eslint-plugin-unicorn';

export default defineConfig(
  // 1) Global ignores (replacement for .eslintignore)
  {
    name: 'setup/ignores',
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      'tests/tmp/**',
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
  unicorn.configs.recommended,
  {
    rules: {
      'unicorn/catch-error-name': 'off',
      'unicorn/escape-case': ['error', 'lowercase'],
      'unicorn/expiring-todo-comments': 'off',
      'unicorn/explicit-length-check': 'off',
      'unicorn/no-anonymous-default-export': 'off',
      'unicorn/no-array-callback-reference': 'off',
      'unicorn/no-array-reduce': 'off',
      'unicorn/no-for-loop': 'off',
      'unicorn/no-null': 'off',
      'unicorn/no-process-exit': 'off',
      'unicorn/no-useless-undefined': 'off',
      'unicorn/prefer-math-trunc': 'off',
      'unicorn/prefer-number-properties': [
        'error',
        {
          checkNaN: false,
          checkInfinity: false,
        },
      ],
      'unicorn/prefer-spread': 'off',
      // In general a decent rule, but we specifically want to use
      // JSON.parse(JSON.stringify(value)), as an intended low level data clone,
      // particularly in our tests.
      'unicorn/prefer-structured-clone': 'off',
      'unicorn/prevent-abbreviations': 'off',
      'unicorn/switch-case-braces': 'off',
    },
  },

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
      '@typescript-eslint/array-type': [
        'error',
        {
          default: 'array',
        },
      ],
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^unused_',
          varsIgnorePattern: '^unused_',
          caughtErrorsIgnorePattern: '^unused_',
        },
      ],

      // TODO: Temporarily disabled. Remove these lines, check affected code,
      // and assess whether to fix code or re-enable the rule.
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',

      // Allow || for boolean expressions (the rule is meant for null/undefined coalescing)
      '@typescript-eslint/prefer-nullish-coalescing': [
        'error',
        {
          ignorePrimitives: {
            boolean: true,
            string: true,
          },
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

  // 6) Keep Prettier in charge of formatting — place before any project style overrides
  prettier,

  // 7) Project formatting overrides
  {
    name: 'overrides/operator-linebreak',
    rules: {
      'operator-linebreak': [
        'error',
        'before',
        {
          overrides: {
            '=': 'after',
          },
        },
      ],
    },
  },

  // Disable type-aware rules for babel/ directory due to TypeScript's inability
  // to resolve types properly when moduleResolution: NodeNext is used with
  // module: ESNext. This is a known limitation with complex Babel types.
  {
    name: 'overrides/babel-type-inference',
    files: ['babel/**/*.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-redundant-type-constituents': 'off',
    },
  },

  // 8) Disable type-aware linting for test files (they rely on transpiled outputs)
  {
    name: 'overrides/tests-no-type-check',
    files: ['tests/**/*.ts'],
    extends: [tseslint.configs.disableTypeChecked],
    rules: {
      '@typescript-eslint/consistent-type-imports': 'off',
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

  // 9) Suppress "Unused eslint-disable directive" for generated propane files
  {
    name: 'overrides/generated-propane-files',
    files: ['**/*.propane.ts'],
    linterOptions: {
      reportUnusedDisableDirectives: 'off',
    },
    rules: {
      // Generated code style constraints are relaxed.
      '@typescript-eslint/array-type': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'unicorn/prefer-spread': 'off',
    },
  },
);
