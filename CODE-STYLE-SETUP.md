# Code Style & Linting Setup — Portable Guide

A complete, copy-paste guide to replicate this project's linting, formatting, and
code-style configuration in another project.

This project deliberately **does not use Prettier or Biome**. It uses a 3-tool
pipeline built around the [Oxc](https://oxc.rs) toolchain (Rust-based, very fast):

| Tool                     | Role                                                             | Config file                          |
| ------------------------ | ---------------------------------------------------------------- | ------------------------------------ |
| **oxlint**               | Fast **type-aware** TypeScript lint rules (the strict ones)      | `.oxlintrc.json`                     |
| **oxfmt**                | Formatter (Prettier replacement) + Tailwind class sorting        | `.oxfmtrc.json`                      |
| **ESLint** (flat config) | Non-type-aware rules: React, JSX-a11y, imports, JSDoc, sort-keys | `eslint.config.mjs` + `rigs/eslint/` |
| **tsc**                  | Type checking (`--noEmit`)                                       | `tsconfig.json`                      |

### Division of labor (important)

- **Type-aware rules live in oxlint** (fast, Rust). These are the strict rules
  (`no-explicit-any`, `no-floating-promises`, `no-unsafe-*`, etc.).
- **ESLint runs those same `@typescript-eslint` rules turned OFF (`0`)** to avoid
  double-reporting. ESLint owns React, imports, JSDoc, and key-sorting.
- **oxfmt handles ALL formatting.** `eslint-config-prettier` disables ESLint's
  stylistic rules so nothing fights the formatter.

---

## Step 1 — Install dependencies

```bash
# Formatter + fast linter
bun add -D oxlint@^1.56.0 oxfmt@^0.41.0

# ESLint core + TypeScript
bun add -D eslint@9.39.2 @eslint/js@9.39.1 @eslint/compat@1.3.2 \
  typescript-eslint@8.53.0 @typescript-eslint/eslint-plugin@8.53.0 \
  @typescript-eslint/parser@8.53.0 @typescript-eslint/typescript-estree@8.53.0

# ESLint plugins
bun add -D eslint-config-prettier@10.1.8 eslint-plugin-oxlint@1.41.0 \
  eslint-plugin-react@7.37.5 eslint-plugin-react-hooks@7.0.0 \
  eslint-plugin-jsx-a11y@6.10.2 eslint-plugin-import@2.32.0 \
  eslint-plugin-jsdoc@50.6.17 eslint-plugin-sort-destructure-keys@2.0.0 \
  eslint-plugin-jest@29.12.1

# Next.js (skip if not a Next project)
bun add -D @next/eslint-plugin-next@16.1.1 eslint-config-next@16.1.6
```

> Swap `bun add -D` for `npm i -D` / `pnpm add -D` if not using Bun.

**Optional — Stylelint for CSS** (config included below, not required):

```bash
bun add -D stylelint stylelint-config-recommended stylelint-order
```

---

## Step 2 — package.json scripts

```jsonc
{
  "scripts": {
    "lint": "oxlint . && bunx eslint . && bunx tsc --noEmit",
    "lint:fix": "oxlint --fix . && bunx eslint . --fix",
    "format": "oxfmt --write .",
    "check": "bun run lint:fix && bun run format",
  },
}
```

- `bun run check` — fix everything, then format (the everyday command).
- `bun run lint` — CI-style check (lint + typecheck, no writes).

---

## Step 3 — `.oxfmtrc.json` (formatting style)

These are the actual "pretty code" rules: **80 cols, single quotes, no
semicolons, ES5 trailing commas**, plus automatic Tailwind class sorting.

```json
{
  "$schema": "./node_modules/oxfmt/configuration_schema.json",
  "printWidth": 80,
  "singleQuote": true,
  "trailingComma": "es5",
  "semi": false,
  "experimentalTailwindcss": {
    "stylesheet": "./app/globals.css",
    "attributes": ["className", "class"],
    "functions": ["clsx", "cn", "cva"],
    "preserveDuplicates": false,
    "preserveWhitespace": false
  },
  "ignorePatterns": [
    "**/node_modules/**",
    "**/.next/**",
    "**/dist/**",
    "**/build/**",
    "**/coverage/**",
    "**/.git/**",
    "**/.agents/**",
    "**/.claude/**",
    "**/.vscode/**",
    "**/generated/**",
    "**/prisma/migrations/**",
    "**/next-env.d.ts",
    "**/*.min.js"
  ]
}
```

> **Adjust** `experimentalTailwindcss.stylesheet` to point at your global CSS
> file. Remove the whole `experimentalTailwindcss` block if you don't use Tailwind.

---

## Step 4 — `.oxlintrc.json` (type-aware TS rules)

The strict core of the setup. All type-aware rules are `error`.

```json
{
  "rules": {
    "typescript/await-thenable": "error",
    "typescript/no-explicit-any": "error",
    "typescript/no-misused-promises": "error",
    "typescript/no-floating-promises": "error",
    "typescript/no-array-delete": "error",
    "typescript/no-base-to-string": "error",
    "typescript/no-base-duplicate-type-constituents": "error",
    "typescript/no-duplicate-type-constituents": "error",
    "typescript/no-empty-object-type": "error",
    "typescript/no-for-in-array": "error",
    "typescript/no-implied-eval": "error",
    "typescript/no-namespace": "error",
    "typescript/no-redundant-type-constituents": "error",
    "typescript/no-require-imports": "error",
    "typescript/no-unnecessary-type-assertion": "error",
    "typescript/no-unnecessary-type-constraint": "error",
    "typescript/no-unsafe-argument": "error",
    "typescript/no-unsafe-call": "error",
    "typescript/no-unsafe-enum-comparison": "error",
    "typescript/no-unsafe-function-type": "error",
    "typescript/no-unsafe-member-access": "error",
    "typescript/no-unsafe-return": "error",
    "typescript/no-unsafe-unary-minus": "error",
    "typescript/no-unused-vars": "error",
    "typescript/only-throw-error": "error",
    "typescript/prefer-namespace-keyword": "error",
    "typescript/prefer-promise-reject-errors": "error",
    "typescript/require-await": "error",
    "typescript/restrict-plus-operands": "error",
    "typescript/restrict-template-expressions": "error",
    "typescript/unbound-method": "error",
    "typescript/explicit-function-return-type": "error",
    "typescript/explicit-module-boundary-types": "error",
    "typescript/no-shadow": "error",
    "typescript/no-unsafe-assignment": "error"
  },
  "plugins": ["react", "unicorn", "typescript", "oxc"],
  "ignorePatterns": [
    "**/generated/**",
    "**/public/**",
    "**/prisma/migrations/**",
    "**/.agents/**",
    "**/.claude/**",
    "next.config.js",
    "sst.config.ts",
    "jest.config.js",
    "jest.setup.ts",
    "tailwind.config.ts"
  ],
  "overrides": [
    {
      "files": ["**/*.d.{ts,tsx}", "**/graphqlTypes.ts"],
      "rules": {
        "typescript/no-explicit-any": "off"
      }
    },
    {
      "files": ["**/*.spec.{ts,tsx}", "**/*.test.{ts,tsx}"],
      "plugins": ["react", "unicorn", "typescript", "oxc", "jest"],
      "env": { "jest": true },
      "rules": {
        "typescript/no-explicit-any": "off",
        "typescript/no-unsafe-assignment": "off",
        "typescript/no-floating-promises": "off",
        "typescript/explicit-function-return-type": "off",
        "typescript/no-unsafe-member-access": "off",
        "typescript/no-unsafe-call": "off",
        "typescript/no-unsafe-return": "off",
        "typescript/no-unsafe-argument": "off",
        "typescript/no-unsafe-function-type": "off",
        "typescript/no-unnecessary-type-assertion": "off",
        "typescript/prefer-promise-reject-errors": "off",
        "typescript/unbound-method": "off",
        "jest/no-conditional-expect": "off",
        "jest/no-standalone-expect": "off",
        "jest/expect-expect": "off"
      }
    },
    {
      "files": ["**/*.stories.{ts,tsx}"],
      "rules": {
        "typescript/no-explicit-any": "off",
        "typescript/explicit-function-return-type": "off",
        "typescript/no-unsafe-argument": "off",
        "typescript/no-unsafe-assignment": "off"
      }
    }
  ]
}
```

**Override logic:** `.d.ts` files allow `any`; test files (`*.spec`/`*.test`)
relax most `no-unsafe-*` + return-type rules and enable the `jest` plugin;
`*.stories` files relax `any` and return types.

---

## Step 5 — Shared ESLint config package (`rigs/eslint/`)

The ESLint rules live in a local workspace package so they're reusable across
repos. You can either copy the folder or inline `index.mjs` into
`eslint.config.mjs`.

### 5a. Register the workspace in root `package.json`

```jsonc
{
  "workspaces": { "packages": ["rigs/eslint"] },
  "devDependencies": {
    "eslint-config-auto-quote-generator": "workspace:*",
  },
}
```

### 5b. `rigs/eslint/package.json`

```json
{
  "name": "eslint-config-auto-quote-generator",
  "version": "1.0.0",
  "description": "Custom eslint rules for all packages",
  "license": "MIT",
  "type": "module",
  "main": "index.mjs",
  "dependencies": {
    "@eslint/compat": "1.3.2",
    "@next/eslint-plugin-next": "16.1.1",
    "@typescript-eslint/eslint-plugin": "8.53.0",
    "@typescript-eslint/parser": "8.53.0",
    "@typescript-eslint/typescript-estree": "8.53.0",
    "eslint": "9.39.2",
    "eslint-config-prettier": "10.1.8",
    "eslint-plugin-jest": "29.12.1",
    "eslint-plugin-jsdoc": "50.6.17",
    "eslint-plugin-jsx-a11y": "6.10.2",
    "eslint-plugin-oxlint": "1.41.0",
    "eslint-plugin-react-hooks": "7.0.0",
    "eslint-plugin-sort-destructure-keys": "2.0.0",
    "typescript": "^5.9.3",
    "typescript-eslint": "8.53.0"
  }
}
```

> Rename the package (`eslint-config-<your-project>`) and update the
> `workspace:*` reference to match.

### 5c. `rigs/eslint/index.mjs`

```js
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

export default tseslint.config(
  eslint.configs.recommended,
  jsdoc.configs['flat/recommended'],

  // TS rules, but NOT type-aware (type-awareness is done via oxlint + tsc).
  ...tseslint.configs.recommended,
  reactPlugin.configs.flat.all,
  oxlint.configs['flat/recommended'],
  {
    files: ['*.ts', '*.tsx', '*.mjs', '**/*.ts', '**/*.tsx'],
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
      'import/internal-regex': '^@tu/',
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
          devDependencies: ['**/*.stories.*', '**/*.spec.*', '**/__tests__/*'],
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
          paths: [
            {
              name: 'clsx',
              message: 'Use "clsx/lite" instead of "clsx"',
            },
          ],
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
  eslintConfigPrettier
)
```

**What ESLint owns (highlights):**

- **Import hygiene** — `import/order` (grouped builtin→external→internal→parent→sibling→index, newline between groups), `import/newline-after-import`, `import/no-extraneous-dependencies`.
- **Sorting** — `sort-destructure-keys`, `sort-imports`, `sort-keys` (asc, min 2 keys), `sort-vars`.
- **React** — hooks rules as errors, `button-has-type`, `no-multi-comp`, `jsx-fragments`, `no-unused-state/prop-types`.
- **JSDoc required** on functions/classes/methods (`require-jsdoc` + description + params; types off since TS covers them).
- **`no-console: error`**, `no-param-reassign` (allows `acc/req/draft/state`), and a rule forcing `clsx/lite` over `clsx`.

---

## Step 6 — Root `eslint.config.mjs`

Consumes the shared package and layers Next.js on top.

```js
import nextPlugin from '@next/eslint-plugin-next'
import tuLint from 'eslint-config-auto-quote-generator'

export default [
  ...tuLint,
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
      'tailwind.config.ts',
      'postcss.config.js',
      'next-env.d.ts',
      'next.config.js',
      'global.d.ts',
      '**/__generated__/**',
      'prisma/**',
      'generated/**',
      '__mocks__/**',
      'scripts/**',
      'node_modules/**',
      '.claude/**',
    ],
  },
]
```

> If not a Next.js project, drop the `@next/next` block and the Next deps.

---

## Step 7 — `tsconfig.json` (type-check strictness)

```json
{
  "compilerOptions": {
    "target": "ES2023",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] },
    "types": ["vitest/globals"]
  },
  "include": [
    "next-env.d.ts",
    "global.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    "**/*.mts"
  ],
  "exclude": ["node_modules", "__mocks__"]
}
```

Key: `strict: true`, `noEmit: true`, `moduleResolution: bundler`,
`isolatedModules`, and the `@/*` path alias.

---

## Step 8 — VS Code integration

### `.vscode/extensions.json`

```json
{
  "recommendations": ["oxc.oxc-vscode"]
}
```

### `.vscode/settings.json`

```json
{
  "editor.formatOnSave": true,
  "editor.formatOnSaveMode": "file",
  "editor.defaultFormatter": "oxc.oxc-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.oxc": "explicit"
  },
  "oxc.enable": true,
  "oxc.typeAware": true,
  "oxc.disableNestedConfig": false,
  "oxc.fmt.configPath": ".oxfmtrc.json",
  "oxc.path.oxlint": "./node_modules/.bin/oxlint",
  "oxc.path.oxfmt": "./node_modules/.bin/oxfmt",
  "[typescript]": {
    "editor.defaultFormatter": "vscode.typescript-language-features",
    "editor.formatOnSave": true
  },
  "[javascript]": {
    "editor.defaultFormatter": "oxc.oxc-vscode",
    "editor.formatOnSave": true
  },
  "[javascriptreact]": {
    "editor.defaultFormatter": "oxc.oxc-vscode",
    "editor.formatOnSave": true
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "vscode.typescript-language-features",
    "editor.formatOnSave": true
  },
  "[json]": { "editor.defaultFormatter": "oxc.oxc-vscode" },
  "[jsonc]": { "editor.defaultFormatter": "oxc.oxc-vscode" },
  "prettier.enable": false,
  "biome.enabled": false,
  "eslint.format.enable": false
}
```

Everything routes through the **oxc** extension; Prettier, Biome, and
ESLint-formatting are explicitly disabled so they never fight oxfmt.

---

## Step 9 (optional) — Stylelint for CSS

`stylelint.json`:

```json
{
  "processors": [],
  "extends": ["stylelint-config-recommended"],
  "plugins": ["stylelint-order"],
  "rules": {
    "declaration-no-important": true,
    "indentation": [2, { "baseIndentLevel": 2 }],
    "order/order": ["custom-properties", "declarations", "rules", "at-rules"],
    "property-no-vendor-prefix": [
      true,
      { "ignoreProperties": ["box-orient", "line-clamp"] }
    ],
    "value-no-vendor-prefix": [true, { "ignoreValues": ["box"] }]
  }
}
```

---

## Quick replication checklist

- [ ] Install deps (Step 1).
- [ ] Add scripts (Step 2).
- [ ] Copy `.oxfmtrc.json` — repoint the Tailwind `stylesheet` (Step 3).
- [ ] Copy `.oxlintrc.json` — adjust `ignorePatterns` (Step 4).
- [ ] Copy `rigs/eslint/` — rename the package, register the workspace (Step 5).
- [ ] Copy `eslint.config.mjs` — trim Next.js block if unused (Step 6).
- [ ] Copy `tsconfig.json` (Step 7).
- [ ] Copy `.vscode/` files (Step 8).
- [ ] Run `bun install`, then `bun run check`.

**Formatting rules at a glance:** 80 columns · single quotes · no semicolons ·
ES5 trailing commas · sorted imports/keys/destructures · required JSDoc ·
no `console` · strict type-aware TS via oxlint.
