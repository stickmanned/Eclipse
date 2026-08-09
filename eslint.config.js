import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  {
    ignores: [
      'node_modules/**',
      '.output/**',
      '.output-e2e/**',
      'dist/**',
      '.wxt/**',
      'test-results/**',
      'playwright-report/**',
      'blob-report/**',
      'public/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: {
        // WXT auto-imports these into entrypoints.
        defineBackground: 'readonly',
        defineContentScript: 'readonly',
        createShadowRootUi: 'readonly',
      },
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      'no-console': ['error', { allow: ['warn', 'error'] }],
      eqeqeq: ['error', 'smart'],
    },
  },
  {
    // The demo server and the optional API are Node programs: they have Node
    // globals and logging is their job.
    files: ['demo/**/*.mjs', 'server/**/*.ts'],
    languageOptions: {
      globals: {
        process: 'readonly',
        console: 'readonly',
        URL: 'readonly',
        Buffer: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        AbortController: 'readonly',
      },
    },
    rules: {
      'no-console': 'off',
    },
  },
  {
    // These two files match Unicode by code point on purpose: the whitespace
    // class has to contain NBSP, and the safety scanner has to contain the
    // control characters it is there to reject.
    files: ['src/domain/normalize.ts', 'src/domain/safety.ts'],
    rules: {
      'no-irregular-whitespace': 'off',
      'no-control-regex': 'off',
    },
  },
  {
    files: ['tests/**/*.ts', 'tests/**/*.tsx'],
    rules: {
      'no-console': 'off',
    },
  },
  prettier,
);
