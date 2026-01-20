import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'

export async function GET(request, { params }) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const resolvedParams = await Promise.resolve(params)
    const donorId = resolvedParams?.id
    if (!donorId) return NextResponse.json({ error: 'Missing donor id' }, { status: 400 })

    const orgId = session.user.organizationId

    const donor = await prisma.donor.findFirst({
      where: { id: donorId, organizationId: orgId },
      select: { id: true },
    })

    if (!donor) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const donations = await prisma.donation.findMany({
      where: { donorId },
      orderBy: { date: 'desc' },
      take: 250,
      select: {
        id: true,
        amount: true,
        date: true,
        type: true,
        method: true,
        notes: true,
        campaign: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json(donations)
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('GET /api/donors/[id]/donations error', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
