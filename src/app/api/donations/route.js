// Donations API - List and Create
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'

export async function GET(request) {
  try {
    const cookieHeader = request.headers.get('cookie') || ''
    const match = cookieHeader.match(/(?:^|; )session=([^;]+)/)
    const sessionToken = match ? match[1] : undefined
    const session = await getSession(sessionToken)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // minimal list: latest 50 for org
    const donations = await prisma.donation.findMany({
      where: { donor: { organizationId: session.user.organizationId } },
      include: { donor: true, campaign: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return NextResponse.json({ donations })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('GET /api/donations error', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const cookieHeader = request.headers.get('cookie') || ''
    const match = cookieHeader.match(/(?:^|; )session=([^;]+)/)
    const sessionToken = match ? match[1] : undefined
    const session = await getSession(sessionToken)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // only ADMIN or STAFF can create donations
    if (!['ADMIN', 'STAFF'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json().catch(() => ({}))
    const { donorId, amount, date, method, campaign, recurring, notes } = body || {}

    if (!donorId || !amount) {
      return NextResponse.json({ error: 'donorId and amount are required' }, { status: 400 })
    }

    const parsedAmount = Number(amount)
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    const donor = await prisma.donor.findUnique({ where: { id: donorId } })
    if (!donor || donor.organizationId !== session.user.organizationId) {
      return NextResponse.json({ error: 'Donor not found' }, { status: 404 })
    }

    const donationData = {
      donorId: donor.id,
      campaignId: campaign || null,
      amount: parsedAmount,
      date: date ? new Date(date) : new Date(),
      type: 'ONE_TIME',
      method: method ? String(method).slice(0, 100) : null,
      notes: notes ? String(notes).slice(0, 2000) : null,
    }

    const donation = await prisma.donation.create({ data: donationData })

    // create follow-up tasks based on the donation
    try {
      const donationDate = donation.date
      const donationDateText = donationDate?.toLocaleDateString?.() || ''

      await prisma.task.create({
        data: {
          donorId: donor.id,
          assignedTo: session.user.id,
          title: 'Send thank-you after donation',
          description: `Donation recorded${donationDateText ? ` on ${donationDateText}` : ''} for $${parsedAmount.toFixed(2)}. Send a thank-you to reinforce stewardship.`,
          priority: 'HIGH',
          dueDate: (() => {
            const d = new Date()
            d.setDate(d.getDate() + 1)
            return d
          })(),
        },
      })

      // First gift: schedule a second-gift follow-up
      const wasFirstGift = Number(donor.totalGifts || 0) === 0
      if (wasFirstGift) {
        await prisma.task.create({
          data: {
            donorId: donor.id,
            assignedTo: session.user.id,
            title: 'Plan a second-gift follow-up',
            description: 'This is the donor’s first recorded gift. Plan a timely follow-up to encourage a second gift.',
            priority: 'MEDIUM',
            dueDate: (() => {
              const d = new Date()
              d.setDate(d.getDate() + 30)
              return d
            })(),
          },
        })
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Failed to create donation follow-up tasks', e)
    }

    // update donor metrics
    try {
      const totalAmount = (donor.totalAmount || 0) + parsedAmount
      const totalGifts = (donor.totalGifts || 0) + 1
      const lastGiftDate = donation.date
      const firstGiftDate = donor.firstGiftDate || donation.date

      await prisma.donor.update({ where: { id: donor.id }, data: { totalAmount, totalGifts, lastGiftDate, firstGiftDate } })
    } catch (e) {
      // log and continue
      // eslint-disable-next-line no-console
      console.error('Failed to update donor metrics', e)
    }

    const created = await prisma.donation.findUnique({ where: { id: donation.id }, include: { donor: true, campaign: true } })

    return NextResponse.json({ donation: created }, { status: 201 })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('POST /api/donations error', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
