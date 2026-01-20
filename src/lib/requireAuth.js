import { NextResponse } from 'next/server'
import { getSession } from './session'

// Simple guard for API routes — returns session or a NextResponse(401)
export async function requireAuth(request) {
  // Prefer request.cookies (when available) else parse header
  let token
  try {
    token = request.cookies?.get?.('session')?.value
  } catch (e) {
    // ignore
  }

  if (!token) {
    const cookieHeader = request.headers?.get?.('cookie') || request.headers?.get?.('Cookie') || ''
    const match = cookieHeader.match(/(?:^|; )session=([^;]+)/)
    token = match ? match[1] : undefined
  }

  const session = await getSession(token)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return session
}

export default requireAuth
