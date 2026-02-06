import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'

function getSessionTokenFromRequest(request) {
  return request.cookies?.get('session')?.value || (() => {
    const cookieHeader = request.headers.get('cookie')
    if (!cookieHeader) return null
    const m = cookieHeader.match(/(?:^|; )session=([^;]+)/)
    return m ? decodeURIComponent(m[1]) : null
  })()
}

export async function POST(request) {
  try {
    const sessionToken = getSessionTokenFromRequest(request)
    const session = await getSession(sessionToken)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (session.user?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await request.json()
    const { entityType, id, decision, note } = body || {}
    if (!['donor', 'donation'].includes(entityType)) return NextResponse.json({ error: 'Invalid entityType' }, { status: 400 })
    if (!['confirmed', 'dismissed'].includes(decision)) return NextResponse.json({ error: 'Invalid decision' }, { status: 400 })

    // Log the review decision in ActivityLog for audit (non-destructive)
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: `anomaly.${decision}`,
        entity: entityType,
        entityId: id,
        changes: { decision, note },
      },
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('anomalies review error', err?.stack || err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
