// Authentication utilities
import { prisma } from './db'
import { hashPassword, verifyPassword } from './password'
import { createOrganizationForNewUser, ensureStarterDataForOrganization } from './starter-data'

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
  let createdNewOrganization = false
  if (organization) {
    // try by id
    const byId = await prisma.organization.findFirst({ where: { id: organization } }).catch(() => null)
    if (byId) organizationId = byId.id
    else {
      // Treat provided organization as a *new organization name*.
      // This avoids accidentally joining seeded/demo orgs that happen to share the same name.
      const created = await createOrganizationForNewUser({ firstName, lastName, email: normalizedEmail, organizationName: organization })
      organizationId = created.id
      createdNewOrganization = true
    }
  } else {
    // Default behavior: each newly registered user gets their own organization
    const created = await createOrganizationForNewUser({ firstName, lastName, email: normalizedEmail })
    organizationId = created.id
    createdNewOrganization = true
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

  // If joining an existing org (by id/name), ensure it has starter data only when empty.
  // If this registration created a new org, starter data is already seeded.
  if (!createdNewOrganization) {
    try {
      await ensureStarterDataForOrganization(organizationId)
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('starter data seed failed:', e?.message || e)
    }
  }

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