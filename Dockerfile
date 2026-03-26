# syntax=docker/dockerfile:1

# Base image used by build stages (small + matches Next.js docs)
FROM node:20-alpine AS base

# All subsequent paths are relative to this working directory
WORKDIR /app

# Where corepack/pnpm will place its global store
ENV PNPM_HOME="/pnpm"
# Add pnpm to PATH so `pnpm` works in RUN steps
ENV PATH="$PNPM_HOME:$PATH"
# Disable Next telemetry in CI/builds
ENV NEXT_TELEMETRY_DISABLED=1

# Enable corepack and pin pnpm version for reproducible installs
RUN corepack enable && corepack prepare pnpm@10.18.1 --activate


# Dependency stage: installs node_modules once and reuses it for builds
FROM base AS deps

# Prisma generate runs during pnpm install (postinstall) and expects DATABASE_URL.
# A real database is not required just to generate the client.
ARG DATABASE_URL=postgresql://user:pass@localhost:5432/db?schema=public
# Make DATABASE_URL available to postinstall/prisma generate
ENV DATABASE_URL=$DATABASE_URL

# Copy dependency manifests (minimizes cache invalidation)
COPY package.json pnpm-lock.yaml .npmrc ./
# Copy Prisma schema/config needed for `prisma generate`
COPY prisma ./prisma
COPY prisma.config.js ./

# Install dependencies using the lockfile for deterministic builds
RUN pnpm install --frozen-lockfile


# Builder stage: compiles the Next.js app (standalone output)
FROM base AS builder

# Provide DATABASE_URL at build time for Prisma generation (safe placeholder)
ARG DATABASE_URL=postgresql://user:pass@localhost:5432/db?schema=public
# Make DATABASE_URL available during build
ENV DATABASE_URL=$DATABASE_URL

# Reuse installed dependencies from the deps stage
COPY --from=deps /app/node_modules ./node_modules
# Copy the rest of the app source code
COPY . .

# Build the Next.js app (creates .next/standalone)
RUN pnpm build


# Runtime image: contains only the built server bundle + assets
FROM node:20-alpine AS runner

# Runtime working directory
WORKDIR /app

# Production runtime settings
ENV NODE_ENV=production
# Next.js server listens on this port
ENV PORT=3000
# Bind on all interfaces (required for containers)
ENV HOSTNAME=0.0.0.0
# Keep telemetry disabled at runtime too
ENV NEXT_TELEMETRY_DISABLED=1

# Run as a non-root user for better security
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

# Next.js standalone output (self-contained server.js + traced deps)
COPY --from=builder /app/.next/standalone ./
# Static assets required by Next.js
COPY --from=builder /app/.next/static ./.next/static

# Prisma schema + generated client (custom output path under prisma/)
COPY --from=builder /app/prisma ./prisma
# Prisma 7 migrate commands require this config file at runtime
COPY --from=builder /app/prisma.config.js ./prisma.config.js
# Include Prisma CLI + engines so migrations can run in deploy container
COPY --from=deps /app/node_modules/prisma ./node_modules/prisma
COPY --from=deps /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=deps /app/node_modules/.bin ./node_modules/.bin

# Drop privileges for runtime
USER nextjs

# Document the port the container listens on
EXPOSE 3000

# Start the Next.js standalone server
CMD ["node", "server.js"]
