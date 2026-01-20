import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'

export async function DELETE(request, { params }) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (!['ADMIN', 'STAFF'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const resolvedParams = await Promise.resolve(params)
    const segmentId = resolvedParams?.id
    const donorId = resolvedParams?.donorId

    if (!segmentId) return NextResponse.json({ error: 'segment id is required' }, { status: 400 })
    if (!donorId) return NextResponse.json({ error: 'donor id is required' }, { status: 400 })

    const orgId = session.user.organizationId

    const result = await prisma.$transaction(async (tx) => {
      const deleted = await tx.segmentMember.deleteMany({
        where: {
          segmentId,
          donorId,
          segment: { organizationId: orgId },
          donor: { organizationId: orgId },
        },
      })

      if (deleted.count === 0) return { removed: 0, memberCount: null }

      const memberCount = await tx.segmentMember.count({ where: { segmentId } })
      await tx.segment.update({ where: { id: segmentId }, data: { memberCount } })

      return { removed: deleted.count, memberCount }
    })

    if (result.removed === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json({ success: true, ...result })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('DELETE /api/segments/[id]/members/[donorId] error', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
