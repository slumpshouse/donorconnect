import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/requireAuth'
import { prisma } from '@/lib/db'

export async function GET(request) {
  try {
    const auth = await requireAuth(request)
    if (auth instanceof NextResponse) return auth
    const session = auth

    const users = await prisma.user.findMany({
      where: { organizationId: session.user.organizationId, role: 'ADMIN' },
      orderBy: { firstName: 'asc' },
      select: { id: true, firstName: true, lastName: true, email: true },
    })

    return NextResponse.json({ users })
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('GET /api/users/admins error', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
