import js from '@eslint/js';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import sonarjs from 'eslint-plugin-sonarjs';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      '**/.next/**',
      '**/coverage/**',
      '**/reports/**',
      '**/.stryker-tmp/**',
      '**/playwright-report/**',
      '**/test-results/**',
      '**/node_modules/**',
      '**/*.d.ts',
      'next.config.mjs',
      'eslint.config.mjs',
      'stryker.config.mjs',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  jsxA11y.flatConfigs.recommended,
  sonarjs.configs.recommended,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      'no-undef': 'off',
      complexity: ['error', 10],
      'max-depth': ['error', 3],
      'max-lines-per-function': ['error', { max: 60, skipComments: true, skipBlankLines: true }],
      'max-lines': ['error', { max: 300, skipComments: true, skipBlankLines: true }],
      'max-params': ['error', 4],
      eqeqeq: ['error', 'always'],
      'no-console': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-module-boundary-types': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
      // We forbid `!` (no-non-null-assertion), so we intentionally use targeted
      // `as T` after runtime guards; disable the rule that would demand `!`.
      '@typescript-eslint/non-nullable-type-assertion-style': 'off',
      // Noisy stylistic rule that fights readable, self-documenting tests and
      // domain strings; the meaningful sonarjs complexity rules stay enabled.
      'sonarjs/no-duplicate-string': 'off',
    },
  },
  {
    // JSX component bodies are declarative; the per-function line metric is not
    // a meaningful signal there. Complexity, depth, and params limits remain.
    files: ['src/app/**/*.tsx', 'src/components/**/*.tsx'],
    rules: {
      'max-lines-per-function': 'off',
    },
  },
  {
    files: ['tests/**/*.{ts,tsx}', 'e2e/**/*.ts'],
    rules: {
      'max-lines-per-function': 'off',
      'max-lines': 'off',
      'sonarjs/no-nested-functions': 'off',
      // Test doubles routinely use `async` shapes and empty stubs to match the
      // interfaces they replace; these are noise in test files only.
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      'sonarjs/no-empty-function': 'off',
    },
  },
);
