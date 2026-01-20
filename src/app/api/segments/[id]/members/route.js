import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'

export async function POST(request, { params }) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (!['ADMIN', 'STAFF'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const resolvedParams = await Promise.resolve(params)
    const segmentId = resolvedParams?.id
    if (!segmentId) return NextResponse.json({ error: 'segment id is required' }, { status: 400 })

    const orgId = session.user.organizationId

    const segment = await prisma.segment.findFirst({
      where: { id: segmentId, organizationId: orgId },
      select: { id: true },
    })

    if (!segment) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const body = await request.json().catch(() => ({}))
    const donorIdsRaw = body?.donorIds

    if (!Array.isArray(donorIdsRaw) || donorIdsRaw.length === 0) {
      return NextResponse.json({ error: 'donorIds must be a non-empty array' }, { status: 400 })
    }

    const donorIds = donorIdsRaw
      .filter((id) => typeof id === 'string' && id.trim().length > 0)
      .slice(0, 200)

    if (donorIds.length === 0) {
      return NextResponse.json({ error: 'No valid donorIds provided' }, { status: 400 })
    }

    const donors = await prisma.donor.findMany({
      where: { id: { in: donorIds }, organizationId: orgId },
      select: { id: true },
    })

    const foundIds = new Set(donors.map((d) => d.id))
    const missing = donorIds.filter((id) => !foundIds.has(id))
    if (missing.length) {
      return NextResponse.json({ error: 'Some donors were not found', missing }, { status: 400 })
    }

    const result = await prisma.$transaction(async (tx) => {
      const created = await tx.segmentMember.createMany({
        data: donorIds.map((donorId) => ({ segmentId, donorId })),
        skipDuplicates: true,
      })

      const memberCount = await tx.segmentMember.count({ where: { segmentId } })
      await tx.segment.update({ where: { id: segmentId }, data: { memberCount } })

      return { added: created.count, memberCount }
    })

    return NextResponse.json({ success: true, ...result })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('POST /api/segments/[id]/members error', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
