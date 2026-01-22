import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'
import { buildDonorWhereFromSegmentRules } from '@/lib/segment-rules'

export async function GET(request, { params }) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const resolvedParams = await Promise.resolve(params)
    const id = resolvedParams?.id
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

    const orgId = session.user.organizationId

    const segment = await prisma.segment.findFirst({
      where: { id, organizationId: orgId },
      select: {
        id: true,
        name: true,
        description: true,
        rules: true,
        memberCount: true,
        lastCalculated: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!segment) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const donorWhere = buildDonorWhereFromSegmentRules(segment.rules)

    // Compute full membership and keep SegmentMember join table in sync.
    const now = new Date()
    const [matchingIds, matchingCount, donors] = await prisma.$transaction([
      prisma.donor.findMany({
        where: { organizationId: orgId, ...donorWhere },
        select: { id: true },
      }),
      prisma.donor.count({ where: { organizationId: orgId, ...donorWhere } }),
      prisma.donor.findMany({
        where: { organizationId: orgId, ...donorWhere },
        orderBy: [{ totalAmount: 'desc' }, { lastGiftDate: 'desc' }],
        take: 1000,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          status: true,
          retentionRisk: true,
          totalGifts: true,
          totalAmount: true,
          lastGiftDate: true,
        },
      }),
    ])

    const donorIds = (matchingIds || []).map((d) => d.id)

    await prisma.$transaction(async (tx) => {
      if (donorIds.length === 0) {
        await tx.segmentMember.deleteMany({ where: { segmentId: segment.id } })
      } else {
        await tx.segmentMember.deleteMany({
          where: {
            segmentId: segment.id,
            donorId: { notIn: donorIds },
          },
        })

        await tx.segmentMember.createMany({
          data: donorIds.map((donorId) => ({ segmentId: segment.id, donorId })),
          skipDuplicates: true,
        })
      }

      await tx.segment.update({
        where: { id: segment.id },
        data: { memberCount: matchingCount, lastCalculated: now },
      })
    })

    return NextResponse.json({
      segment: {
        ...segment,
        memberCount: matchingCount,
        lastCalculated: now,
        donors,
      },
    })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('GET /api/segments/[id] error', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PATCH(request, { params }) {
  try {
    // TODO: Update segment
  } catch (error) {
    // TODO: Handle errors
  }
}

export async function DELETE(request, { params }) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (!['ADMIN', 'STAFF'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const resolvedParams = await Promise.resolve(params)
    const id = resolvedParams?.id
    const orgId = session.user.organizationId

    const existing = await prisma.segment.findUnique({ where: { id } })
    if (!existing || existing.organizationId !== orgId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    await prisma.segment.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('DELETE /api/segments/[id] error', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}