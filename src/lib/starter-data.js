import { prisma } from './db'

function titleCase(input) {
  return String(input)
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

function buildDefaultOrgName({ firstName, lastName, email }) {
  const normalizedEmail = String(email || '').trim().toLowerCase()
  const domain = normalizedEmail.includes('@') ? normalizedEmail.split('@')[1] : ''
  const domainPrefix = domain ? domain.split('.')[0] : ''
  const base = domainPrefix || `${firstName || ''} ${lastName || ''}`.trim()
  const pretty = titleCase(String(base).replace(/[^a-z0-9]+/gi, ' ').trim())
  return pretty ? `${pretty} Organization` : 'New Organization'
}

export async function ensureStarterDataForOrganization(organizationId) {
  if (!organizationId) return { seeded: false }

  const [donorCount, campaignCount, segmentCount] = await Promise.all([
    prisma.donor.count({ where: { organizationId } }),
    prisma.campaign.count({ where: { organizationId } }),
    prisma.segment.count({ where: { organizationId } }),
  ])

  // If the org has *any* data, we avoid seeding donors/campaigns again.
  // However, segments are safe/helpful to seed independently when missing.
  const shouldSeedCore = donorCount === 0 && campaignCount === 0
  const shouldSeedSegments = segmentCount === 0

  if (!shouldSeedCore && !shouldSeedSegments) return { seeded: false }

  const now = new Date()
  const thirtyDaysAgo = new Date(now)
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  await prisma.$transaction(async (tx) => {
    if (shouldSeedCore) {
      const campaign = await tx.campaign.create({
        data: {
          organizationId,
          name: 'Welcome Campaign',
          description: 'Starter data to help you explore DonorConnect.',
          type: 'Annual Fund',
          status: 'ACTIVE',
          startDate: thirtyDaysAgo,
          endDate: null,
          goal: 5000,
        },
      })

      const donors = await Promise.all([
        tx.donor.create({
          data: {
            organizationId,
            firstName: 'Alex',
            lastName: 'Taylor',
            email: 'alex.taylor@example.com',
            status: 'ACTIVE',
            retentionRisk: 'LOW',
          },
        }),
        tx.donor.create({
          data: {
            organizationId,
            firstName: 'Jordan',
            lastName: 'Lee',
            email: 'jordan.lee@example.com',
            status: 'ACTIVE',
            retentionRisk: 'MEDIUM',
          },
        }),
        tx.donor.create({
          data: {
            organizationId,
            firstName: 'Sam',
            lastName: 'Patel',
            email: 'sam.patel@example.com',
            status: 'ACTIVE',
            retentionRisk: 'HIGH',
          },
        }),
      ])

      const donationInputs = [
        {
          donorId: donors[0].id,
          campaignId: campaign.id,
          amount: 50,
          date: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 7),
          method: 'Credit Card',
          type: 'ONE_TIME',
          notes: 'Starter donation',
        },
        {
          donorId: donors[1].id,
          campaignId: campaign.id,
          amount: 120,
          date: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 14),
          method: 'Check',
          type: 'ONE_TIME',
          notes: 'Starter donation',
        },
        {
          donorId: donors[2].id,
          campaignId: campaign.id,
          amount: 25,
          date: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 3),
          method: 'Card',
          type: 'ONE_TIME',
          notes: 'Starter donation',
        },
      ]

      await Promise.all(donationInputs.map((data) => tx.donation.create({ data })))

      // Keep donor metrics consistent with the starter donations.
      const donationsByDonor = donationInputs.reduce((acc, donation) => {
        acc[donation.donorId] = acc[donation.donorId] || []
        acc[donation.donorId].push(donation)
        return acc
      }, {})

      await Promise.all(
        Object.entries(donationsByDonor).map(([donorId, list]) => {
          const totalGifts = list.length
          const totalAmount = list.reduce((sum, d) => sum + (Number(d.amount) || 0), 0)
          const dates = list.map((d) => new Date(d.date))
          const firstGiftDate = new Date(Math.min(...dates.map((d) => d.getTime())))
          const lastGiftDate = new Date(Math.max(...dates.map((d) => d.getTime())))
          return tx.donor.update({
            where: { id: donorId },
            data: { totalGifts, totalAmount, firstGiftDate, lastGiftDate },
          })
        })
      )
    }

    if (shouldSeedSegments) {
      await ensureDefaultSegmentsForOrganization(organizationId, tx)
    }
  })

  return { seeded: true }
}

export async function ensureDefaultSegmentsForOrganization(organizationId, txOverride) {
  if (!organizationId) return { seeded: false }

  const segmentCount = await (txOverride || prisma).segment.count({ where: { organizationId } })
  if (segmentCount > 0) return { seeded: false }

  const tx = txOverride || prisma
  await Promise.all([
    tx.segment.create({
      data: {
        organizationId,
        name: 'First-Time Donors',
        description: 'Donors who have given exactly once',
        rules: { field: 'totalGifts', operator: 'equals', value: 1 },
        memberCount: 0,
      },
    }),
    tx.segment.create({
      data: {
        organizationId,
        name: 'High-Risk Retention',
        description: 'Donors at high or critical retention risk',
        rules: { field: 'retentionRisk', operator: 'in', value: ['HIGH', 'CRITICAL'] },
        memberCount: 0,
      },
    }),
    tx.segment.create({
      data: {
        organizationId,
        name: 'Major Donors',
        description: 'Donors who have given $1000 or more total',
        rules: { field: 'totalAmount', operator: 'greaterThan', value: 1000 },
        memberCount: 0,
      },
    }),
    tx.segment.create({
      data: {
        organizationId,
        name: 'Lapsed Donors',
        description: 'Donors who have not given in 12+ months',
        rules: { field: 'status', operator: 'equals', value: 'LAPSED' },
        memberCount: 0,
      },
    }),
  ])

  return { seeded: true }
}

export async function createOrganizationForNewUser({ firstName, lastName, email, organizationName }) {
  const name = organizationName ? String(organizationName).trim() : buildDefaultOrgName({ firstName, lastName, email })
  const created = await prisma.organization.create({ data: { name } })
  await ensureStarterDataForOrganization(created.id)
  return created
}
