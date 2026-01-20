// Campaigns API - List and Create
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'

export async function GET(request) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const orgId = session.user.organizationId

    const campaigns = await prisma.campaign.findMany({
      where: { organizationId: orgId },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        organizationId: true,
        name: true,
        description: true,
        goal: true,
        startDate: true,
        endDate: true,
        type: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    const campaignIds = campaigns.map((c) => c.id)
    let donations = []
    if (campaignIds.length) {
      donations = await prisma.donation.findMany({
        where: {
          campaignId: { in: campaignIds },
          donor: { organizationId: orgId },
        },
        select: { campaignId: true, donorId: true, amount: true },
      })
    }

    const totalsByCampaign = new Map()
    const donorsByCampaign = new Map()
    const donationCountByCampaign = new Map()
    for (const d of donations) {
      totalsByCampaign.set(d.campaignId, (totalsByCampaign.get(d.campaignId) || 0) + (d.amount || 0))
      donationCountByCampaign.set(d.campaignId, (donationCountByCampaign.get(d.campaignId) || 0) + 1)
      if (!donorsByCampaign.has(d.campaignId)) donorsByCampaign.set(d.campaignId, new Set())
      donorsByCampaign.get(d.campaignId).add(d.donorId)
    }

    const enriched = campaigns.map((c) => {
      const totalAmount = totalsByCampaign.get(c.id) || 0
      const donationCount = donationCountByCampaign.get(c.id) || 0
      const totalDonors = donorsByCampaign.get(c.id)?.size || 0
      const averageGift = donationCount ? totalAmount / donationCount : 0
      return { ...c, totalAmount, donationCount, totalDonors, averageGift }
    })

    return NextResponse.json({ campaigns: enriched })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('GET /api/campaigns error', error)
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
    const { name, description, goal, startDate, endDate } = body || {}
    if (!name) return NextResponse.json({ error: 'name is required' }, { status: 400 })

    const campaign = await prisma.campaign.create({
      data: {
        organizationId: session.user.organizationId,
        name: String(name).slice(0, 191),
        description: description ? String(description).slice(0, 2000) : null,
        goal: goal ? Number(goal) : null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
    })

    return NextResponse.json({ campaign }, { status: 201 })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('POST /api/campaigns error', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}