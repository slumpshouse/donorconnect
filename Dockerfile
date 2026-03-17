# ---- Builder stage ----
FROM node:20-alpine AS builder

WORKDIR /app

# Prisma (via prisma.config.js) requires DATABASE_URL to be defined, even for
# client generation during build. This is a build-time placeholder; the real
# value is provided at runtime via Docker Compose / environment.
ARG DATABASE_URL="postgresql://user:pass@localhost:5432/db?schema=public"
ENV DATABASE_URL=$DATABASE_URL

# Use pnpm for installs (repo is pnpm-managed), but run the build via `npm run build`
# to match the assignment requirement.
RUN corepack enable && corepack prepare pnpm@10.18.1 --activate

COPY package.json ./
COPY .npmrc ./
COPY pnpm-lock.yaml ./

# Prisma generate runs during npm install (postinstall).
COPY prisma ./prisma
COPY prisma.config.js ./

RUN pnpm install --frozen-lockfile

# Copy only what Next needs to build.
COPY src ./src
COPY jsconfig.json ./
COPY next.config.* ./
COPY postcss.config.mjs ./
COPY tailwind.config.js ./
COPY components.json ./

RUN npm run build


# ---- Production stage ----
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1

EXPOSE 3000

# Copy only the standalone server and static assets.
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

CMD ["node", "server.js"]
