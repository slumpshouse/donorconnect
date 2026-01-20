// Authentication utilities
import { prisma } from './db'
import { hashPassword, verifyPassword } from './password'

/**
 * TODO: Register a new user
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} Created user object
 */
export async function register(userData) {
  const { firstName, lastName, email, password, organization } = userData || {}

  if (!firstName || !lastName || !email || !password) {
    const err = new Error('Missing required fields')
    err.status = 400
    throw err
  }

  // normalize email
  const normalizedEmail = String(email).trim().toLowerCase()

  // check existing
  const existing = await prisma.user.findFirst({ where: { email: normalizedEmail } })
  if (existing) {
    const err = new Error('Email already in use')
    err.status = 409
    throw err
  }

  // determine organizationId
  let organizationId = null
  if (organization) {
    // try by id
    const byId = await prisma.organization.findFirst({ where: { id: organization } }).catch(() => null)
    if (byId) organizationId = byId.id
    else {
      // try by name
      const byName = await prisma.organization.findFirst({ where: { name: organization } }).catch(() => null)
      if (byName) organizationId = byName.id
      else {
        const created = await prisma.organization.create({ data: { name: organization } })
        organizationId = created.id
      }
    }
  } else {
    // use an existing organization if present, or create a default one
    const firstOrg = await prisma.organization.findFirst()
    if (firstOrg) organizationId = firstOrg.id
    else {
      const created = await prisma.organization.create({ data: { name: 'Default Organization' } })
      organizationId = created.id
    }
  }

  const hashed = await hashPassword(password)

  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email: normalizedEmail,
      password: hashed,
      organizationId,
    },
  })

  const { password: _p, ...safe } = user
  return safe
}

/**
 * TODO: Authenticate user login
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object|null>} User object or null if invalid
 */
export async function login(email, password) {
  if (!email || !password) return null

  const normalizedEmail = String(email).trim().toLowerCase()

  const user = await prisma.user.findFirst({
    where: { email: normalizedEmail },
    include: { organization: true },
  })

  if (!user) return null

  const valid = await verifyPassword(password, user.password)
  if (!valid) return null

  const { password: _p, ...safe } = user
  return safe
}

/**
 * TODO: Get user by ID
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} User object or null
 */
export async function getUserById(userId) {
  if (!userId) return null

  const user = await prisma.user.findFirst({
    where: { id: userId },
    include: { organization: true },
  })

  if (!user) return null

  const { password: _p, ...safe } = user
  return safe
}