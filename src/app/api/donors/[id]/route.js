// Donors API - Individual Donor Operations
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'

export async function GET(request, { params }) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const resolvedParams = await Promise.resolve(params)
    const id = resolvedParams?.id
    if (!id) return NextResponse.json({ error: 'Missing donor id' }, { status: 400 })

    const donor = await prisma.donor.findFirst({
      where: { id, organizationId: session.user.organizationId },
    })

    if (!donor) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json(donor)
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('GET /api/donors/[id] error', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PATCH(request, { params }) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (!['ADMIN', 'STAFF'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const resolvedParams = await Promise.resolve(params)
    const id = resolvedParams?.id
    if (!id) return NextResponse.json({ error: 'Missing donor id' }, { status: 400 })

    const body = await request.json().catch(() => ({}))
    const allowed = ['firstName', 'lastName', 'email', 'phone', 'status', 'retentionRisk', 'address', 'city', 'state', 'zipCode']
    const data = {}
    for (const key of allowed) {
      if (Object.prototype.hasOwnProperty.call(body, key) && body[key] !== undefined) {
        data[key] = body[key]
      }
    }

    if (data.email) {
      const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/
      if (typeof data.email !== 'string' || !emailRegex.test(data.email)) {
        return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
      }
    }

    // sanitize phone if provided: digits-only, max length 10
    if (Object.prototype.hasOwnProperty.call(data, 'phone') && data.phone !== undefined && data.phone !== null) {
      if (typeof data.phone !== 'string') {
        return NextResponse.json({ error: 'Invalid phone' }, { status: 400 })
      }
      const cleaned = String(data.phone).replace(/\D/g, '')
      if (cleaned.length > 10) return NextResponse.json({ error: 'Phone must be at most 10 digits' }, { status: 400 })
      data.phone = cleaned || null
    }

    // no-op: additional fields like tags/notes/preferredContact are not in DB schema

    const result = await prisma.donor.updateMany({ where: { id, organizationId: session.user.organizationId }, data })
    if (result.count === 0) return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 })

    const updated = await prisma.donor.findUnique({ where: { id } })
    return NextResponse.json(updated)
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('PATCH /api/donors/[id] error', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })

    const resolvedParams = await Promise.resolve(params)
    const id = resolvedParams?.id
    if (!id) return NextResponse.json({ error: 'Missing donor id' }, { status: 400 })

    const res = await prisma.donor.deleteMany({ where: { id, organizationId: session.user.organizationId } })
    if (res.count === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json({ success: true })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('DELETE /api/donors/[id] error', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
