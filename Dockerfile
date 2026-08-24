# Production-like image for the Next.js + Payload app.
# Multi-stage build using Bun (the project's package manager) and Next's
# standalone output. Used by the `app` profile in docker-compose.yml and as the
# basis for deploying to a VPS/host.

# ---- deps: install all dependencies ----
FROM oven/bun:1 AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

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

# Next standalone output bundles only the files needed to run.
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["bun", "server.js"]
