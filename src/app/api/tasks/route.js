import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'

export async function GET(request) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const orgId = session.user.organizationId

    const tasks = await prisma.task.findMany({
      where: {
        OR: [
          { donor: { organizationId: orgId } },
          { assignedUser: { organizationId: orgId } },
        ],
      },
      orderBy: { updatedAt: 'desc' },
      take: 100,
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
        donor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        assignedUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    })
    return NextResponse.json({ tasks })
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('GET /api/tasks error', err)
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
    const { title, description, donorId, assignedTo, priority, dueDate } = body || {}
    if (!title) return NextResponse.json({ error: 'title is required' }, { status: 400 })

    const orgId = session.user.organizationId

    let donorIdToUse = donorId || null
    if (donorIdToUse) {
      const donor = await prisma.donor.findUnique({ where: { id: donorIdToUse }, select: { organizationId: true } })
      if (!donor || donor.organizationId !== orgId) {
        return NextResponse.json({ error: 'Donor not found' }, { status: 404 })
      }
    }

    let assignedToUse = assignedTo || null
    if (assignedToUse) {
      const user = await prisma.user.findUnique({ where: { id: assignedToUse }, select: { organizationId: true, role: true } })
      if (!user || user.organizationId !== orgId) {
        return NextResponse.json({ error: 'Assigned user not found' }, { status: 404 })
      }
      if (user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Assigned user must be an ADMIN' }, { status: 400 })
      }
    }

    // Ensure every task is tenant-scoped via either donor or assigned user.
    if (!donorIdToUse && !assignedToUse) {
      // Prefer assigning to an ADMIN user in the same org. Fall back to the current user.
      const adminUser = await prisma.user.findFirst({ where: { organizationId: orgId, role: 'ADMIN' }, select: { id: true } })
      assignedToUse = adminUser?.id || session.user.id
    }

    const data = {
      title: String(title).slice(0, 191),
      description: description ? String(description).slice(0, 2000) : null,
      donorId: donorIdToUse,
      assignedTo: assignedToUse,
      priority: priority || 'MEDIUM',
      dueDate: dueDate ? new Date(dueDate) : null,
    }

    const task = await prisma.task.create({ data })
    return NextResponse.json({ task }, { status: 201 })
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('POST /api/tasks error', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
