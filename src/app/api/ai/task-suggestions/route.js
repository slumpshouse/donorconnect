import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/requireAuth'
import { suggestTasksForDonor } from '@/lib/ai/task-suggestions'

export async function GET(request) {
  try {
    const auth = await requireAuth(request)
    if (auth instanceof NextResponse) return auth
    const session = auth

    const url = new URL(request.url)
    const donorId = url.searchParams.get('donorId') || null

    const orgId = session.user.organizationId

    // If donorId is provided, return suggestions for just that donor.
    if (donorId) {
      const donor = await prisma.donor.findFirst({
        where: { id: donorId, organizationId: orgId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          totalGifts: true,
          totalAmount: true,
          lastGiftDate: true,
          firstGiftDate: true,
          status: true,
        },
      })

      if (!donor) return NextResponse.json({ error: 'Donor not found' }, { status: 404 })

      const [lastDonation, lastInteraction] = await Promise.all([
        prisma.donation.findFirst({
          where: { donorId: donor.id },
          orderBy: { date: 'desc' },
          select: { date: true },
        }),
        prisma.interaction.findFirst({
          where: { donorId: donor.id },
          orderBy: { date: 'desc' },
          select: { date: true },
        }),
      ])

      const suggestions = suggestTasksForDonor({
        donor,
        lastDonationDate: lastDonation?.date ?? null,
        lastInteractionDate: lastInteraction?.date ?? null,
      })

      return NextResponse.json({ suggestions })
    }

    // Otherwise, return org-wide suggestions (top N).
    const donors = await prisma.donor.findMany({
      where: { organizationId: orgId },
      take: 75,
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        totalGifts: true,
        totalAmount: true,
        lastGiftDate: true,
        firstGiftDate: true,
        status: true,
      },
    })

    const donorIds = donors.map((d) => d.id)

    const [donationMaxByDonor, interactionMaxByDonor] = await Promise.all([
      prisma.donation.groupBy({
        by: ['donorId'],
        where: { donorId: { in: donorIds } },
        _max: { date: true },
      }),
      prisma.interaction.groupBy({
        by: ['donorId'],
        where: { donorId: { in: donorIds } },
        _max: { date: true },
      }),
    ])

    const donationMap = new Map(donationMaxByDonor.map((r) => [r.donorId, r._max?.date ?? null]))
    const interactionMap = new Map(interactionMaxByDonor.map((r) => [r.donorId, r._max?.date ?? null]))

    const all = donors.flatMap((donor) => {
      const suggestions = suggestTasksForDonor({
        donor,
        lastDonationDate: donationMap.get(donor.id) ?? null,
        lastInteractionDate: interactionMap.get(donor.id) ?? null,
      })

      // Limit per donor to avoid noisy dashboards
      return suggestions.slice(0, 2)
    })

    all.sort((a, b) => (b.urgencyScore ?? 0) - (a.urgencyScore ?? 0))

    return NextResponse.json({ suggestions: all.slice(0, 12) })
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('GET /api/ai/task-suggestions error', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
