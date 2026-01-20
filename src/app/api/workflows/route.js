// Workflows API - List and Create
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'

export async function GET(request) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const orgId = session.user.organizationId
    const workflows = await prisma.workflow.findMany({ where: { organizationId: orgId }, orderBy: { updatedAt: 'desc' } })
    return NextResponse.json({ workflows })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('GET /api/workflows error', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (!['ADMIN', 'STAFF', 'MARKETING'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json().catch(() => ({}))
    const { name, description, trigger, steps, segmentId, isActive } = body || {}
    if (!name) return NextResponse.json({ error: 'name is required' }, { status: 400 })
    if (!trigger) return NextResponse.json({ error: 'trigger is required' }, { status: 400 })

    const workflow = await prisma.workflow.create({
      data: {
        organizationId: session.user.organizationId,
        name: String(name).slice(0, 191),
        description: description ? String(description).slice(0, 1000) : null,
        trigger: trigger,
        steps: steps || [],
        segmentId: segmentId || null,
        isActive: !!isActive,
      },
    })

    return NextResponse.json({ workflow }, { status: 201 })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('POST /api/workflows error', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
