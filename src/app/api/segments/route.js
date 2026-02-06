// Segments API - List and Create
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'
import { buildDonorWhereFromSegmentRules } from '@/lib/segment-rules'
import { ensureDefaultSegmentsForOrganization } from '@/lib/starter-data'

export async function GET(request) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // In production (e.g., Vercel), orgs created via registration may not have seeded demo segments.
    // Ensure a small set of default segments exists so the Segments page isn't empty by default.
    await ensureDefaultSegmentsForOrganization(session.user.organizationId).catch(() => null)

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
      select: { id: true, name: true, description: true, rules: true, memberCount: true, lastCalculated: true, createdAt: true },
    })

    // Keep memberCount fresh so segments are truly "automatic".
    const now = new Date()
    const settled = await Promise.allSettled(
      (segments || []).map(async (segment) => {
        const donorWhere = buildDonorWhereFromSegmentRules(segment.rules)
        const count = await prisma.donor.count({
          where: {
            organizationId: session.user.organizationId,
            ...donorWhere,
          },
        })

        const updated = await prisma.segment.update({
          where: { id: segment.id },
          data: { memberCount: count, lastCalculated: now },
          select: { id: true, name: true, description: true, memberCount: true, lastCalculated: true, createdAt: true },
        })

        return updated
      })
    )

    const updatedSegments = settled
      .map((result, idx) => {
        if (result.status === 'fulfilled') return result.value
        // eslint-disable-next-line no-console
        console.warn('Segment recalculation failed', {
          segmentId: segments?.[idx]?.id,
          error: String(result.reason?.message || result.reason),
        })

        const fallback = segments?.[idx]
        if (!fallback) return null
        return {
          id: fallback.id,
          name: fallback.name,
          description: fallback.description,
          memberCount: fallback.memberCount,
          lastCalculated: fallback.lastCalculated,
          createdAt: fallback.createdAt,
        }
      })
      .filter(Boolean)

    return NextResponse.json({ segments: updatedSegments, pagination: { page, limit, total } })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('GET /api/segments error', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const sessionToken = request.cookies.get('session')?.value
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