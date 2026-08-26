/**
 * `@payloadcms/next/css` resolves to a plain stylesheet (`dist/prod/styles.css`)
 * and the package ships no `types` condition for that export, so the
 * side-effect import in the generated `app/(payload)/layout.tsx` fails type
 * checking with TS2882. The wildcard `*.css` module declared by `next-env.d.ts`
 * does not match the specifier because it ends in `/css`, not `.css`.
 *
 * Declaring it here keeps the generated layout untouched.
 */
declare module '@payloadcms/next/css'
