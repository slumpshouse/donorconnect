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
    const orgId = session.user.organizationId

    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        donations: {
          where: { donor: { organizationId: orgId } },
          include: { donor: true },
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
      },
    })

    if (!campaign || campaign.organizationId !== orgId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json({ campaign })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('GET /api/campaigns/[id] error', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PATCH(request, { params }) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (!['ADMIN', 'STAFF', 'MARKETING'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const resolvedParams = await Promise.resolve(params)
    const id = resolvedParams?.id
    const orgId = session.user.organizationId

    const existing = await prisma.campaign.findUnique({ where: { id } })
    if (!existing || existing.organizationId !== orgId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const body = await request.json().catch(() => ({}))
    const updates = {}
    if (body.name !== undefined) updates.name = String(body.name).slice(0, 191)
    if (body.description !== undefined) updates.description = body.description ? String(body.description).slice(0, 2000) : null
    if (body.goal !== undefined) updates.goal = body.goal === null ? null : Number(body.goal)
    if (body.startDate !== undefined) updates.startDate = body.startDate ? new Date(body.startDate) : null
    if (body.endDate !== undefined) updates.endDate = body.endDate ? new Date(body.endDate) : null
    if (body.type !== undefined) updates.type = body.type ? String(body.type).slice(0, 191) : null
    if (body.status !== undefined) updates.status = body.status

    const campaign = await prisma.campaign.update({ where: { id }, data: updates })
    return NextResponse.json({ campaign })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('PATCH /api/campaigns/[id] error', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Only ADMIN can delete campaigns
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const resolvedParams = await Promise.resolve(params)
    const id = resolvedParams?.id
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })
    const orgId = session.user.organizationId

    const existing = await prisma.campaign.findUnique({ where: { id } })
    if (!existing || existing.organizationId !== orgId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // Some environments can have FK constraints that prevent deleting a campaign
    // while donations still reference it. Unlink donations first.
    await prisma.$transaction([
      prisma.donation.updateMany({
        where: { campaignId: id },
        data: { campaignId: null },
      }),
      prisma.campaign.delete({ where: { id } }),
    ])
    return NextResponse.json({ success: true })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('DELETE /api/campaigns/[id] error', error)
    return NextResponse.json({ error: 'Unable to delete campaign' }, { status: 500 })
  }
}
