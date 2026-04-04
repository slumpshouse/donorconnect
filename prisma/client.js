import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { PrismaClient } from './generated/client.js'

// Parse connection string and create pool with SSL configuration
const connectionString = process.env.DATABASE_URL

function getSslConfig(databaseUrl) {
  if (!databaseUrl) return { rejectUnauthorized: false }

  try {
    const parsed = new URL(databaseUrl)
    const host = String(parsed.hostname || '').toLowerCase()
    const sslMode = String(parsed.searchParams.get('sslmode') || '').toLowerCase()
    const isLocalHost = host === 'localhost' || host === '127.0.0.1' || host === 'db'

    // Local Docker/Postgres deployments typically do not run TLS.
    if (isLocalHost || sslMode === 'disable') return false

    // Cloud Postgres providers (Neon, managed PG, etc.) usually require TLS.
    return { rejectUnauthorized: false }
  } catch {
    return { rejectUnauthorized: false }
  }
}

// Create pg Pool with SSL enabled for Neon and other cloud providers
const pool = new Pool({
  connectionString,
  ssl: getSslConfig(connectionString),
})

// Create adapter with the pool
const adapter = new PrismaPg(pool)

// Singleton pattern for Next.js to prevent multiple instances during hot-reload
const globalForPrisma = globalThis

const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export { prisma }
export default prisma