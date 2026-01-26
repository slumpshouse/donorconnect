// Authentication API - Session Check
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'

export async function GET(request) {
  try {
    const token = request.cookies.get('session')?.value
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