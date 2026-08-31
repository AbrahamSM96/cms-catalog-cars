import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'

// Public R2 bucket host (per client). Derived from NEXT_PUBLIC_R2_PUBLIC_URL so
// next/image is allowed to optimise images served from R2. If the env var is
// missing at build time the pattern is simply omitted.
const r2PublicBase = process.env.NEXT_PUBLIC_R2_PUBLIC_URL
const r2Hostname = r2PublicBase ? new URL(r2PublicBase).hostname : undefined

const nextConfig: NextConfig = {
  // Cache Components: pages are dynamic by default and each CMS read opts into
  // caching with `use cache` (see lib/payload-client.ts). Next prerenders a
  // static shell per route at build time — with no database access, since every
  // read sits behind a <Suspense> boundary — and the cached content streams in
  // at request time, from memory after the first hit.
  cacheComponents: true,
  // Partial Prefetching: cada <Link> baja el App Shell compartido de la ruta
  // (contenido estático + cacheado) en vez de un prefetch completo por enlace.
  // Solo los <Link prefetch> a rutas que leen params/searchParams piden además
  // los datos por-URL (runtime prefetching).
  partialPrefetching: true,
  output: 'standalone',
  serverExternalPackages: ['payload', '@payloadcms/db-postgres'],
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/media/**',
      },
      ...(r2Hostname
        ? [
          {
            protocol: 'https' as const,
            hostname: r2Hostname,
            pathname: '/**',
          },
        ]
        : []),
    ],
  },
}

export default withPayload(nextConfig)
