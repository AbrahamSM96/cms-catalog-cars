---
name: code-style
description: Read BEFORE writing or editing any TypeScript/TSX/JS code in this repo (components, functions, hooks, utils, Payload collections). Encodes the project's oxlint + oxfmt + ESLint rules so generated code passes `bun run lint` on the first try — alphabetical ordering everywhere, explicit return types, no `any`, JSDoc with `props` (never `props`), single quotes / no semicolons, sorted imports and JSX props.
---

# Code style — write it right the first time

This repo runs a strict 3-tool pipeline: **oxlint** (type-aware TS rules, all `error`), **oxfmt** (formatter), **ESLint** (React/imports/JSDoc/sorting). Every rule below is enforced. Follow them while writing so `bun run lint` passes without a fixup pass.

If you touched code, the definition of done is: `bun run lint` (oxlint → eslint → `tsc --noEmit`) is clean. Autofixable bits: `bun run check`.

---

## 1. Formatting (oxfmt) — non-negotiable

- **Single quotes**, **no semicolons**, **80-column** width.
- **ES5 trailing commas** (multiline arrays/objects/params get a trailing comma; function args on one line do not).
- Tailwind classes are auto-sorted — don't hand-order them, but do keep them in `className`, `clsx`, `cn`, or `cva`.

```ts
const label = 'Disponible'
const sizes = ['sm', 'md', 'lg']
```

Don't fight it — write it this way and run `oxfmt --write .` (`bun run format`) if unsure.

---

## 2. Alphabetical order — EVERYWHERE

### Object keys — ascending, case-sensitive (rule: `sort-keys`, applies at ≥2 keys)

```ts
// ✅
const meta = {
  description: 'Catálogo de autos',
  title: 'AutoCatálogo',
}

// ❌ title before description
const meta = { title: 'AutoCatálogo', description: 'Catálogo de autos' }
```

> Case-sensitive means UPPERCASE sorts before lowercase. When a key order is
> semantically required (e.g. a fixed API payload), extract it or add a scoped
> `// eslint-disable-next-line sort-keys` — but prefer sorting.

### Destructuring — sorted (`sort-destructure-keys`)

```ts
const { brand, name, price } = car
```

### Imports — sorted + grouped (`sort-imports` + `import/order`)

- Members within a `{ ... }` sorted alphabetically (case-insensitive).
- Groups in this order with a blank line between each: **builtin → external → internal (`@/`) → parent → sibling → index**.

```ts
import { readFile } from 'node:fs/promises'

import clsx from 'clsx'
import { notFound } from 'next/navigation'

import { getCarBySlug } from '@/lib/payload-client'
import { buildCarImageAlt } from '@/lib/seo'

import { CarCard } from './car-card'
```

### JSX props — alphabetical (`react/jsx-sort-props`)

```tsx
<CarCard brand={car.brand} name={car.name} price={car.price} />
```

---

## 3. Typing — explicit and correct

- **Every function needs an explicit return type** (`explicit-function-return-type` + `explicit-module-boundary-types`). This includes arrow functions, callbacks, and class methods.
- **No `any`** (`no-explicit-any`) and no unsafe access/call/return/assignment. Type the data; if a shape is unknown use `unknown` and narrow.
- Components return `React.JSX.Element` (or `Promise<React.JSX.Element>` for async Server Components), or `null`/`React.ReactNode` when appropriate.

```tsx
// ✅
export async function CarDetailPage(props: {
  params: Promise<{ slug: string }>
}): Promise<React.JSX.Element> {
  const { slug } = await props.params
  const car = await getCarBySlug(slug)
  if (!car) notFound()
  return <CarDetail car={car} />
}

// ✅ typed callback with explicit return type
const formatPrice = (value: number): string =>
  new Intl.NumberFormat('es-MX').format(value)
```

```tsx
// ❌ missing return type, untyped/any props
export async function CarDetailPage({ params }) {
  const car: any = await getCarBySlug(params.slug)
  return <CarDetail car={car} />
}
```

---

## 4. Component & function JSDoc — use `props`, never `props`

JSDoc is **required** on every function, component, class, and method
(`require-jsdoc` + `require-description` + `require-param` + `check-param-names`).

The key rule you asked for: **name the parameter `props`** so docs read
`@param props`, not the auto-generated `props`. To do that, **take a single
named `props` parameter and destructure in the body** — do not destructure in
the signature.

```tsx
interface CarCardProps {
  brand: string
  name: string
  price: number
}

/**
 * Renders a single car card for the catalogue grid.
 * @param props - Component props.
 */
export function CarCard(props: CarCardProps): React.JSX.Element {
  const { brand, name, price } = props
  return (
    <article>
      <h3>
        {brand} {name}
      </h3>
    </article>
  )
}
```

```tsx
// ❌ destructured in signature → JSDoc must reference `props`, and often ends
//    up undocumented. Don't do this when the component is documented.
export function CarCard({ brand, name, price }: CarCardProps) { ... }
```

For plain functions, document each param with a description (types come from
TS, so `@param` type/`@returns` type are off):

```ts
/**
 * Builds the alt text for a car image.
 * @param car - The car to describe.
 */
export function buildCarImageAlt(car: Car): string {
  return `${car.brand} ${car.name}`
}
```

---

## 5. React specifics

- **One component per file** (`no-multi-comp`) — split extra components out.
- Use **fragment shorthand `<>...</>`** (`jsx-fragments`).
- Every `<button>` needs an explicit `type` (`button-has-type`).
- Hooks rules are errors: complete `exhaustive-deps`, obey `rules-of-hooks`.
- `React.` global is fine (no `import React` needed): `react-in-jsx-scope` off.

---

## 6. Misc rules that bite

- **`no-console`** is an error — remove `console.log`; use a real logger if needed.
- **`no-param-reassign`** — don't mutate params (except `acc`, `req`, `draft`, `state`).
- **`clsx` directly** — `import clsx from 'clsx'`. Do **not** use `clsx/lite`, a
  `cn()` helper, `@/lib/utils`, or `tailwind-merge`.
- No importing from `**/index` or `**/src/*` paths (`no-restricted-imports`) —
  use the `@/` alias.

---

## Quick pre-write checklist

- [ ] Single quotes, no semicolons, trailing commas on multiline.
- [ ] Imports sorted + grouped with blank lines between groups.
- [ ] Object keys, destructures, and JSX props alphabetical.
- [ ] Explicit return type on every function; no `any`.
- [ ] JSDoc on every function/component with a description; component param is a
      single named `props` (documented as `@param props`), destructured in body.
- [ ] One component per file; `<button type=...>`; fragment shorthand.
- [ ] No `console.*`; `clsx` imported directly.
