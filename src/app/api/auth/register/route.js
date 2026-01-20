// Authentication API - User Registration
import { NextResponse } from 'next/server'
import { register } from '@/lib/auth'

export async function POST(request) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, password, organization } = body || {}
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    try {
      const user = await register({ firstName, lastName, email, password, organization })
      return NextResponse.json({ user }, { status: 201 })
    } catch (err) {
      return NextResponse.json({ error: err.message || 'Registration failed' }, { status: err.status || 500 })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}