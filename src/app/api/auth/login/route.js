// Authentication API - User Login
import { NextResponse } from 'next/server'
import { login } from '@/lib/auth'
import { createSession } from '@/lib/session'

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
    const body = await request.json()
    const { email, password } = body || {}
    const trimmedEmail = typeof email === 'string' ? email.trim() : ''

    if (!trimmedEmail) {
      return NextResponse.json({ error: 'Missing email' }, { status: 400 })
    }
    if (!password) {
      return NextResponse.json({ error: 'Missing password' }, { status: 400 })
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(trimmedEmail)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    let user
    try {
      user = await login(trimmedEmail, password)
    } catch (e) {
      // log and return generic error for unexpected failures during login
      // eslint-disable-next-line no-console
      console.error('login() error:', e?.message || e)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    let token
    try {
      token = await createSession(user.id)
    } catch (e) {
      // session creation failed
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }

    const res = NextResponse.json({ user })

    // Explicitly set Set-Cookie header so tests can inspect it
    try {
      const maxAge = 60 * 60 * 24 * 7
      const expires = new Date(Date.now() + maxAge * 1000).toUTCString()
      const useSecureCookie = getCookieSecureFlag(request)
      let cookieValue = `session=${token}; Path=/; Expires=${expires}; Max-Age=${maxAge}; HttpOnly; SameSite=Lax`
      if (useSecureCookie) cookieValue += '; Secure'
      // set via headers (also keep NextResponse cookies for runtime)
      res.headers.append('set-cookie', cookieValue)
      try {
        res.cookies.set('session', token, {
          httpOnly: true,
          path: '/',
          sameSite: 'lax',
          secure: useSecureCookie,
          maxAge,
        })
      } catch (e) {
        // ignore if runtime doesn't support res.cookies
      }
    } catch (e) {
      // ignore cookie header errors
    }

    return res
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}