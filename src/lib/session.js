// Session management for authentication
import { cookies } from 'next/headers'
import { prisma } from './db'
import crypto from 'crypto'

/**
 * TODO: Create a new session for a user
 * @param {string} userId - User ID to create session for
 * @returns {Promise<string>} Session token
 */
export async function createSession(userId) {
  const token = crypto.randomBytes(48).toString('hex')
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

  await prisma.session.create({
    data: {
      token,
      userId,
      expiresAt,
    },
  })

  return token
}

/**
 * TODO: Get session and user data from session token
 * @param {string} sessionToken - Session token to validate
 * @returns {Promise<Object|null>} Session with user data or null
 */
export async function getSession(sessionToken) {
  if (!sessionToken) return null

  const session = await prisma.session.findUnique({
    where: { token: sessionToken },
    include: { user: { include: { organization: true } } },
  })

  if (!session) return null

  if (session.expiresAt && session.expiresAt < new Date()) {
    return null
  }

  return session
}

/**
 * TODO: Get current user from session (for server components)
 * @returns {Promise<Object|null>} User object or null
 */
export async function getSessionUser() {
  try {
    const cookieStore = await cookies()
    if (!cookieStore || typeof cookieStore.get !== 'function') {
      // eslint-disable-next-line no-console
      console.warn('cookie store not available in this runtime')
      return null
    }

    const cookie = cookieStore.get('session')
    if (!cookie) return null

    const token = cookie.value
    if (!token) return null

    // avoid logging token value directly; log masked length for debugging
    // eslint-disable-next-line no-console
    console.debug('getSessionUser: session cookie present, tokenLength=', token?.length || 0)

    const session = await getSession(token)
    if (!session) return null

    return session.user
  } catch (e) {
    // If Next.js is attempting to statically render a route that uses cookies(),
    // it throws a Dynamic Server Usage error to signal that the route must be dynamic.
    // Do not swallow that error, otherwise the route may incorrectly remain static.
    if (e?.digest === 'DYNAMIC_SERVER_USAGE' || String(e?.message || '').includes('Dynamic server usage')) {
      throw e
    }

    // eslint-disable-next-line no-console
    console.error('getSessionUser error:', e)
    return null
  }
}

/**
 * TODO: Delete a session (logout)
 * @param {string} sessionToken - Session token to delete
 */
export async function deleteSession(sessionToken) {
  if (!sessionToken) return
  try {
    await prisma.session.deleteMany({ where: { token: sessionToken } })
  } catch (e) {
    // ignore
  }
}
