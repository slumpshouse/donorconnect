// Authentication API - User Logout
import { NextResponse } from 'next/server'
import { deleteSession } from '@/lib/session'

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
      const isProd = process.env.NODE_ENV === 'production'
      let cookieValue = `session=; Path=/; Expires=${expires}; Max-Age=0; HttpOnly; SameSite=Lax`
      if (isProd) cookieValue += '; Secure'
      res.headers.append('set-cookie', cookieValue)
      try {
        res.cookies.set('session', '', { httpOnly: true, path: '/', sameSite: 'lax', secure: isProd, maxAge: 0 })
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