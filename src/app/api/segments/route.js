// Segments API - List and Create
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'

export async function GET(request) {
  try {
    const cookieHeader = request.headers.get('cookie') || ''
    const match = cookieHeader.match(/(?:^|; )session=([^;]+)/)
    const sessionToken = match ? match[1] : undefined
    const session = await getSession(sessionToken)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const url = new URL(request.url)
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10))
    const limitRaw = parseInt(url.searchParams.get('limit') || '20', 10)
    const limit = Math.min(isNaN(limitRaw) ? 20 : limitRaw, 100)
    const search = url.searchParams.get('search') || null

    const where = { organizationId: session.user.organizationId }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    const total = await prisma.segment.count({ where })

    const segments = await prisma.segment.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { updatedAt: 'desc' },
      select: { id: true, name: true, description: true, memberCount: true, lastCalculated: true, createdAt: true },
    })

    return NextResponse.json({ segments, pagination: { page, limit, total } })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('GET /api/segments error', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const cookieHeader = request.headers.get('cookie') || ''
    const match = cookieHeader.match(/(?:^|; )session=([^;]+)/)
    const sessionToken = match ? match[1] : undefined
    const session = await getSession(sessionToken)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (!['ADMIN', 'STAFF'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json().catch(() => ({}))
    const { name, description, rules } = body || {}
    if (!name) return NextResponse.json({ error: 'name is required' }, { status: 400 })

    const segment = await prisma.segment.create({
      data: {
        organizationId: session.user.organizationId,
        name: String(name).slice(0, 191),
        description: description ? String(description).slice(0, 1000) : null,
        rules: rules || {},
      },
      select: { id: true, name: true, description: true, memberCount: true, lastCalculated: true, createdAt: true },
    })

    return NextResponse.json({ segment }, { status: 201 })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('POST /api/segments error', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}