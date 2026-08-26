// oxlint-disable typescript/no-unsafe-assignment
import eslint from '@eslint/js'
import { fixupPluginRules } from '@eslint/compat'
import tseslint from 'typescript-eslint'
import jsdoc from 'eslint-plugin-jsdoc'
import importRules from 'eslint-plugin-import'
import reactHooks from 'eslint-plugin-react-hooks'
import eslintConfigPrettier from 'eslint-config-prettier'
import eslintSortDestructueKeys from 'eslint-plugin-sort-destructure-keys'
import jest from 'eslint-plugin-jest'
import reactPlugin from 'eslint-plugin-react'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import oxlint from 'eslint-plugin-oxlint'
import nextPlugin from '@next/eslint-plugin-next'

export default tseslint.config(
  eslint.configs.recommended,
  jsdoc.configs['flat/recommended'],

  // TS rules, but NOT type-aware (type-awareness is done via oxlint + tsc).
  ...tseslint.configs.recommended,
  reactPlugin.configs.flat.all,
  oxlint.configs['flat/recommended'],
  {
    files: ['*.ts', '*.tsx', '*.mjs', '*.mts', '**/*.ts', '**/*.tsx', '**/*.mts'],
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      'sort-destructure-keys': eslintSortDestructueKeys,
      'jsx-a11y': jsxA11y,
      'react-hooks': reactHooks,
      import: fixupPluginRules(importRules),
      jsdoc,
      react: reactPlugin,
    },
    languageOptions: {
      parser: tseslint.parser,
    },
    settings: {
      'import/internal-regex': '^@/',
      'import/resolver': {
        node: {},
        typescript: {},
      },
      react: {
        version: 'detect',
      },
    },
    rules: {
      // All type-aware @typescript-eslint rules OFF — deferred to oxlint.
      '@typescript-eslint/ban-ts-ignore': 0,
      '@typescript-eslint/camelcase': 0,
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-use-before-define': 0,
      '@typescript-eslint/ban-ts-comment': 0,
      '@typescript-eslint/no-array-constructor': 0,
      '@typescript-eslint/no-array-delete': 0,
      '@typescript-eslint/no-base-to-string': 0,
      '@typescript-eslint/no-duplicate-type-constituents': 0,
      '@typescript-eslint/no-empty-object-type': 0,
      '@typescript-eslint/no-explicit-any': 0,
      '@typescript-eslint/no-for-in-array': 0,
      '@typescript-eslint/no-implied-eval': 0,
      '@typescript-eslint/no-namespace': 0,
      '@typescript-eslint/no-redundant-type-constituents': 0,
      '@typescript-eslint/no-require-imports': 0,
      '@typescript-eslint/no-unnecessary-type-assertion': 0,
      '@typescript-eslint/no-unnecessary-type-constraint': 0,
      '@typescript-eslint/no-unsafe-argument': 0,
      '@typescript-eslint/no-unsafe-assignment': 0,
      '@typescript-eslint/no-unsafe-call': 0,
      '@typescript-eslint/no-unsafe-enum-comparison': 0,
      '@typescript-eslint/no-unsafe-function-type': 0,
      '@typescript-eslint/no-unsafe-member-access': 0,
      '@typescript-eslint/no-unsafe-return': 0,
      '@typescript-eslint/no-unsafe-unary-minus': 0,
      '@typescript-eslint/no-unused-vars': 0,
      '@typescript-eslint/only-throw-error': 0,
      '@typescript-eslint/prefer-namespace-keyword': 0,
      '@typescript-eslint/prefer-promise-reject-errors': 0,
      '@typescript-eslint/require-await': 0,
      '@typescript-eslint/restrict-plus-operands': 0,
      '@typescript-eslint/restrict-template-expressions': 0,
      '@typescript-eslint/unbound-method': 0,
      '@typescript-eslint/explicit-function-return-type': 0,
      '@typescript-eslint/explicit-module-boundary-types': 0,
      '@typescript-eslint/no-shadow': 0,
      //
      'arrow-body-style': 0,
      'consistent-return': 0,
      'import/no-cycle': 'off',
      'import/extensions': 0,
      'import/prefer-default-export': 0,
      'import/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: [
            '**/*.stories.*',
            '**/*.spec.*',
            '**/*.test.*',
            '**/__tests__/*',
            '**/*.config.*',
            '**/vitest.setup.*',
          ],
          optionalDependencies: false,
        },
      ],
      'import/newline-after-import': 'error',
      'import/order': [
        'error',
        {
          'newlines-between': 'always',
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
          ],
        },
      ],
      'no-restricted-imports': [
        'error',
        {
          patterns: ['**/src/*', '**/index'],
        },
      ],
      'react/react-in-jsx-scope': 'off',
      'react/jsx-props-no-spreading': 'off',
      'react/forbid-component-props': 'off',
      'react/jsx-no-literals': 'off',
      'react/require-default-props': 'off',
      'react/prefer-read-only-props': 'off',
      'react/jsx-no-bind': 'off',
      'react/jsx-max-depth': 'off',
      'react/forbid-prop-types': 0,
      'react/jsx-closing-tag-location': 0,
      'react/jsx-curly-newline': 0,
      'react/jsx-filename-extension': 0,
      'react/jsx-one-expression-per-line': 0,
      'react/jsx-wrap-multilines': 0,
      'react/no-array-index-key': 1,
      'react/prop-types': 0,
      'react/state-in-constructor': 0,
      'react/static-property-placement': 0,
      'class-methods-use-this': ['error', { exceptMethods: ['render'] }],
      'react/button-has-type': 'error',
      'react/no-multi-comp': 'error',
      'react/no-unused-state': 'error',
      'react/no-unused-prop-types': 'error',
      'react-hooks/exhaustive-deps': 'error',
      'react-hooks/rules-of-hooks': 'error',
      'react/jsx-fragments': 'error',
      'react/jsx-no-leaked-render': 'off',
      'sort-destructure-keys/sort-destructure-keys': 2,
      'sort-imports': [
        'error',
        {
          allowSeparatedGroups: true,
          ignoreCase: true,
          ignoreDeclarationSort: false,
          ignoreMemberSort: false,
          memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
        },
      ],
      'sort-keys': [
        'error',
        'asc',
        { caseSensitive: true, minKeys: 2, natural: false },
      ],
      'sort-vars': ['error', { ignoreCase: true }],
      'jsdoc/check-tag-names': [
        'error',
        { definedTags: ['defaultValue', 'jest-environment'] },
      ],
      'jsdoc/require-description': 'error',
      'jsdoc/require-param': 'error',
      'jsdoc/check-param-names': 'error',
      'jsdoc/require-jsdoc': [
        'error',
        {
          contexts: [
            'ArrowFunctionExpression',
            'ClassDeclaration',
            'ClassExpression',
            'FunctionDeclaration',
            'FunctionExpression',
            'MethodDefinition',
          ],
        },
      ],
      'jsdoc/require-param-description': 'error',
      'jsdoc/tag-lines': ['error', 'any', { startLines: 1 }],
      'jsdoc/require-returns': 'off',
      'jsdoc/require-param-type': 'off',
      'jsdoc/require-returns-type': 'off',
      'no-param-reassign': [
        'error',
        {
          ignorePropertyModificationsFor: ['acc', 'req', 'draft', 'state'],
          props: true,
        },
      ],
      'no-console': 'error',
      'no-shadow': 0,
      'no-underscore-dangle': 0,
      'no-use-before-define': 0,
    },
  },
  {
    files: ['*.tsx', '**/*.tsx'],
    rules: {
      'react-hooks/exhaustive-deps': 'error',
      'react-hooks/rules-of-hooks': 'error',
    },
  },
  {
    files: [
      '**/*.spec.ts',
      '**/*.spec.tsx',
      '**/*.stories.*',
      '**/*.page.spec.tsx',
      '**/*.test.ts',
      '**/*.test.tsx',
      '**/__mocks__/**',
      '**/__tests__/**',
    ],
    plugins: { jest },
    rules: {
      'react/no-multi-comp': 'off',
      'react/jsx-no-undef': 'off',
      'jsdoc/require-jsdoc': 'off',
      'import/no-extraneous-dependencies': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/unbound-method': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
    },
  },
  // Next.js layer.
  {
    settings: {
      react: { version: 'detect' },
    },
  },
  {
    files: ['*.ts', '*.tsx', '**/*.ts', '**/*.tsx'],
    plugins: {
      '@next/next': nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
      '@next/next/no-html-link-for-pages': 'off',
      '@next/next/no-duplicate-head': 'off',
    },
  },
  {
    ignores: [
      '.next',
      '.agents/**',
      'coverage',
      '.open-next',
      'eslint.config.mjs',
      'postcss.config.js',
      'postcss.config.mjs',
      'next-env.d.ts',
      'next.config.js',
      'next.config.ts',
      'global.d.ts',
      '**/__generated__/**',
      'generated/**',
      'app/(payload)/**',
      'migrations/**',
      '**/payload-types.ts',
      '__mocks__/**',
      'scripts/**',
      'node_modules/**',
      '.claude/**',
    ],
  },
  eslintConfigPrettier
)
