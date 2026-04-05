// Authentication API - User Logout
import { NextResponse } from 'next/server'
import { deleteSession } from '@/lib/session'

function getCookieSecureFlag(request) {
  const forced = process.env.SESSION_COOKIE_SECURE
  if (typeof forced === 'string') {
    const normalized = forced.trim().toLowerCase()
    if (['1', 'true', 'yes', 'on'].includes(normalized)) return true
    if (['0', 'false', 'no', 'off'].includes(normalized)) return false
  }

  const forwardedProto = request.headers.get('x-forwarded-proto')
  const proto = (forwardedProto || request.nextUrl?.protocol || '').split(',')[0].trim().toLowerCase()
  return proto === 'https' || proto === 'https:'
}

export async function POST(request) {
  try {
    // Get session token from incoming request cookies
    const token = request.cookies.get('session')?.value
    if (token) {
      try {
        await deleteSession(token)
      } catch (e) {
        // ignore delete errors
      }
    }

    const res = NextResponse.json({ success: true })

    // Clear cookie via Set-Cookie header and runtime cookie API when available
    try {
      const expires = new Date(0).toUTCString()
      const useSecureCookie = getCookieSecureFlag(request)
      let cookieValue = `session=; Path=/; Expires=${expires}; Max-Age=0; HttpOnly; SameSite=Lax`
      if (useSecureCookie) cookieValue += '; Secure'
      res.headers.append('set-cookie', cookieValue)
      try {
        res.cookies.set('session', '', { httpOnly: true, path: '/', sameSite: 'lax', secure: useSecureCookie, maxAge: 0 })
      } catch (e) {
        // some runtimes may not support res.cookies
      }
    } catch (e) {
      // ignore cookie clearing errors
    }

    return res
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('logout error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}