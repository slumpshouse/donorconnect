// Authentication API - Session Check
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'

function getSessionTokenFromRequest(request) {
  // 1) Prefer cookie token from the built-in API
  const cookieToken = request.cookies.get('session')?.value
  if (cookieToken) return cookieToken

  // 2) Fallback to raw Cookie header (some environments vary)
  const cookieHeader = request.headers.get('cookie')
  if (typeof cookieHeader === 'string' && cookieHeader.length) {
    const tokens = cookieHeader.split(';').reduce((acc, pair) => {
      const [name, ...rest] = pair.trim().split('=')
      if (!name) return acc
      acc[name] = rest.join('=').trim()
      return acc
    }, {})
    if (tokens.session) return tokens.session
  }

  // 3) Support Authorization header bearer tokens (for debug/test convenience)
  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization')
  if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    return authHeader.slice('Bearer '.length).trim()
  }

  return null
}

export async function GET(request) {
  try {
    const token = getSessionTokenFromRequest(request)
    const session = await getSession(token)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const user = session.user
    return NextResponse.json({ user })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('session check error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}