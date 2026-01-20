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
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

    const orgId = session.user.organizationId

    const segment = await prisma.segment.findFirst({
      where: { id, organizationId: orgId },
      select: {
        id: true,
        name: true,
        description: true,
        memberCount: true,
        lastCalculated: true,
        createdAt: true,
        updatedAt: true,
        members: {
          take: 250,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            createdAt: true,
            donor: {
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
            },
          },
        },
      },
    })

    if (!segment) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const donors = (segment.members || []).map((m) => m.donor).filter(Boolean)

    return NextResponse.json({ segment: { ...segment, donors } })
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