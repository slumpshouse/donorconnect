// Workflows API - Individual Operations
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
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

    const orgId = session.user.organizationId
    const workflow = await prisma.workflow.findFirst({
      where: { id, organizationId: orgId },
    })

    if (!workflow) return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })

    return NextResponse.json({ workflow })
  } catch (error) {
    console.error('GET /api/workflows/[id] error', error)
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
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

    const orgId = session.user.organizationId
    const existing = await prisma.workflow.findFirst({
      where: { id, organizationId: orgId },
    })

    if (!existing) return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })

    const body = await request.json().catch(() => ({}))
    const { name, description, trigger, conditions, actions, isActive, steps } = body || {}

    const updateData = {}
    if (name !== undefined) updateData.name = String(name).slice(0, 191)
    if (description !== undefined) updateData.description = description ? String(description).slice(0, 1000) : null
    if (trigger !== undefined) updateData.trigger = trigger
    if (isActive !== undefined) updateData.isActive = !!isActive
    
    // Handle steps field - if conditions/actions are provided, store them in steps
    if (conditions !== undefined || actions !== undefined) {
      const conditionsArray = conditions ? conditions.split('\n').filter(c => c.trim()) : []
      const actionsArray = actions ? actions.split('\n').filter(a => a.trim()) : []
      updateData.steps = { conditions: conditionsArray, actions: actionsArray }
    } else if (steps !== undefined) {
      updateData.steps = steps
    }

    const workflow = await prisma.workflow.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ workflow })
  } catch (error) {
    console.error('PATCH /api/workflows/[id] error', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (!['ADMIN', 'STAFF', 'MARKETING'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const resolvedParams = await Promise.resolve(params)
    const id = resolvedParams?.id
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

    const orgId = session.user.organizationId
    const existing = await prisma.workflow.findFirst({
      where: { id, organizationId: orgId },
    })

    if (!existing) return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })

    await prisma.workflow.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/workflows/[id] error', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
