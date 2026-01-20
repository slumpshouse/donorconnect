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
    const id = resolvedParams?.id
    const orgId = session.user.organizationId

    const existing = await prisma.task.findUnique({
      where: { id },
      include: {
        donor: { select: { organizationId: true } },
        assignedUser: { select: { organizationId: true } },
      },
    })

    const donorOrgId = existing?.donor?.organizationId
    const assignedOrgId = existing?.assignedUser?.organizationId

    if (!existing || (donorOrgId !== orgId && assignedOrgId !== orgId)) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    await prisma.task.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('DELETE /api/tasks/[id] error', err)
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
    if (!id) return NextResponse.json({ error: 'Missing task id' }, { status: 400 })

    const orgId = session.user.organizationId

    const existing = await prisma.task.findUnique({
      where: { id },
      include: {
        donor: { select: { organizationId: true } },
        assignedUser: { select: { organizationId: true } },
      },
    })

    const donorOrgId = existing?.donor?.organizationId
    const assignedOrgId = existing?.assignedUser?.organizationId

    if (!existing || (donorOrgId !== orgId && assignedOrgId !== orgId)) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const body = await request.json().catch(() => ({}))

    const data = {}

    if (Object.prototype.hasOwnProperty.call(body, 'title') && body.title !== undefined) {
      if (!body.title) return NextResponse.json({ error: 'title is required' }, { status: 400 })
      data.title = String(body.title).slice(0, 191)
    }

    if (Object.prototype.hasOwnProperty.call(body, 'description')) {
      data.description = body.description ? String(body.description).slice(0, 2000) : null
    }

    if (Object.prototype.hasOwnProperty.call(body, 'priority') && body.priority !== undefined) {
      const allowedPriority = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']
      if (!allowedPriority.includes(body.priority)) {
        return NextResponse.json({ error: 'Invalid priority' }, { status: 400 })
      }
      data.priority = body.priority
    }

    if (Object.prototype.hasOwnProperty.call(body, 'dueDate')) {
      data.dueDate = body.dueDate ? new Date(body.dueDate) : null
    }

    let donorIdToUse = existing.donorId
    if (Object.prototype.hasOwnProperty.call(body, 'donorId')) {
      donorIdToUse = body.donorId || null
      if (donorIdToUse) {
        const donor = await prisma.donor.findUnique({ where: { id: donorIdToUse }, select: { organizationId: true } })
        if (!donor || donor.organizationId !== orgId) {
          return NextResponse.json({ error: 'Donor not found' }, { status: 404 })
        }
      }
      data.donorId = donorIdToUse
    }

    let assignedToUse = existing.assignedTo
    if (Object.prototype.hasOwnProperty.call(body, 'assignedTo')) {
      assignedToUse = body.assignedTo || null
      if (assignedToUse) {
        const user = await prisma.user.findUnique({ where: { id: assignedToUse }, select: { organizationId: true } })
        if (!user || user.organizationId !== orgId) {
          return NextResponse.json({ error: 'Assigned user not found' }, { status: 404 })
        }
      }
      data.assignedTo = assignedToUse
    }

    if (Object.prototype.hasOwnProperty.call(body, 'status') && body.status !== undefined) {
      const allowedStatus = ['TODO', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']
      if (!allowedStatus.includes(body.status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
      }
      data.status = body.status
      data.completedAt = body.status === 'COMPLETED' ? new Date() : null
    }

    // Ensure task remains tenant-scoped.
    const finalDonorId = Object.prototype.hasOwnProperty.call(data, 'donorId') ? data.donorId : existing.donorId
    const finalAssignedTo = Object.prototype.hasOwnProperty.call(data, 'assignedTo') ? data.assignedTo : existing.assignedTo
    if (!finalDonorId && !finalAssignedTo) {
      data.assignedTo = session.user.id
    }

    const updated = await prisma.task.update({
      where: { id },
      data,
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        priority: true,
        dueDate: true,
        completedAt: true,
        createdAt: true,
        updatedAt: true,
        donorId: true,
        assignedTo: true,
        donor: { select: { id: true, firstName: true, lastName: true } },
        assignedUser: { select: { id: true, firstName: true, lastName: true } },
      },
    })

    return NextResponse.json({ task: updated })
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('PATCH /api/tasks/[id] error', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
