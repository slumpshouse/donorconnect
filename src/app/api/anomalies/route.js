import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import anomaly from '@/lib/anomaly-detection'

export async function GET(request) {
  try {
    const sessionToken = request.cookies?.get('session')?.value || (() => {
      const cookieHeader = request.headers.get('cookie')
      if (!cookieHeader) return null
      const m = cookieHeader.match(/(?:^|; )session=([^;]+)/)
      return m ? decodeURIComponent(m[1]) : null
    })()

    const session = await getSession(sessionToken)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Restrict access to admins only
    const role = session.user?.role
    if (role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const orgId = session.user.organizationId
    const results = await anomaly.scanAnomalies(orgId)
    return NextResponse.json({ ok: true, results })
  } catch (err) {
    console.error('anomalies error', err?.stack || err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
