import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/session'

export async function GET(request) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const orgId = session.user.organizationId

    const [totalDonations, agg, onlineCount] = await Promise.all([
      prisma.donation.count({ where: { donor: { organizationId: orgId } } }),
      prisma.donation.aggregate({ where: { donor: { organizationId: orgId } }, _sum: { amount: true } }),
      prisma.donation.count({ where: { donor: { organizationId: orgId }, OR: [{ method: 'Card' }, { method: 'Credit Card' }] } }),
    ])

    const totalAmount = agg._sum?.amount ?? 0

    // Tasks stats (scoped to org via donor org OR assigned user org)
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const tomorrowStart = new Date(todayStart)
    tomorrowStart.setDate(tomorrowStart.getDate() + 1)

    const monthStart = new Date()
    monthStart.setDate(1)
    monthStart.setHours(0, 0, 0, 0)

    const taskScope = {
      OR: [{ donor: { organizationId: orgId } }, { assignedUser: { organizationId: orgId } }],
    }

    const [open, dueToday, overdue, completedThisMonth] = await Promise.all([
      prisma.task.count({
        where: {
          ...taskScope,
          status: { in: ['TODO', 'IN_PROGRESS'] },
        },
      }),
      prisma.task.count({
        where: {
          ...taskScope,
          status: { in: ['TODO', 'IN_PROGRESS'] },
          dueDate: { gte: todayStart, lt: tomorrowStart },
        },
      }),
      prisma.task.count({
        where: {
          ...taskScope,
          status: { in: ['TODO', 'IN_PROGRESS'] },
          dueDate: { lt: todayStart },
        },
      }),
      prisma.task.count({
        where: {
          ...taskScope,
          status: 'COMPLETED',
          completedAt: { gte: monthStart },
        },
      }),
    ])

    const taskStats = { open, dueToday, overdue, completedThisMonth }

    return NextResponse.json({ donations: { totalDonations, totalAmount, onlineCount }, tasks: taskStats })
  } catch (err) {
    console.error('dashboard stats error', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
