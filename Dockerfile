# Production-like image for the Next.js + Payload app.
# Multi-stage build using Bun (the project's package manager) and Next's
# standalone output. Used by the `app` profile in docker-compose.yml and as the
# basis for deploying to a VPS/host.

# ---- deps: install all dependencies ----
FROM oven/bun:1 AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# ---- migrator: schema migrations only, no Next build ----
# The postgres adapter never pushes the schema when NODE_ENV is production, so a
# fresh deploy has no tables until `payload migrate` runs. That needs the Payload
# CLI, the config source and ./migrations — none of which exist in the standalone
# runner image. This stage carries them and nothing else: no `next build`, so it
# needs no NEXT_PUBLIC_* build args and adds no time to the app image.
#
# Node base, not Bun: the Payload CLI loads the TypeScript config through tsx,
# which needs a real `node` on PATH. The oven/bun image has none, so Bun runs
# bin.js itself and tsx fails to resolve its own loader. Dependencies are still
# the ones bun installed in `deps` — only the runtime executing the CLI differs.
FROM node:22-slim AS migrator
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
CMD ["node", "node_modules/payload/bin.js", "migrate"]

# ---- builder: compile the Next standalone bundle ----
FROM oven/bun:1 AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1

# Public, per-client values that Next resolves at build time: next.config.ts
# derives the next/image remotePatterns host from NEXT_PUBLIC_R2_PUBLIC_URL, and
# the client bundle inlines both. Passing them at run time only is not enough.
# Only NEXT_PUBLIC_* belongs here — R2 credentials stay run-time env so they are
# never baked into an image layer.
ARG NEXT_PUBLIC_R2_PUBLIC_URL
ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_R2_PUBLIC_URL=$NEXT_PUBLIC_R2_PUBLIC_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL

RUN bun run build

# ---- runner: minimal runtime image ----
FROM oven/bun:1 AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# Production dependencies, installed before the standalone overlay.
#
# Payload is listed in `serverExternalPackages`, so Next never bundles it and
# instead relies on file tracing to copy what it needs into the standalone
# output. That tracing misses transitive dependencies loaded dynamically — `jose`
# from payload/dist/auth/strategies/jwt.js is one, and every page 500s with
# "Cannot find package 'jose'" without it. A real production install guarantees
# the whole tree resolves; the standalone copy below then overlays its own
# server files on top.
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

# Next standalone output bundles only the files needed to run.
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["bun", "server.js"]
