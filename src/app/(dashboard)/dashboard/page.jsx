// Dashboard home page with sidebar
import Link from 'next/link'
import { getSessionUser } from '@/lib/session'
import { prisma } from '@/lib/db'
import { formatCurrency } from '@/lib/utils'

export default async function DashboardPage() {
  let user = null
  try {
    user = await getSessionUser()
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('getSessionUser error:', e)
    user = null
  }

  if (!user) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-red-600 mt-2">You must be signed in to view the dashboard.</p>
      </div>
    )
  }

  const orgId = user.organizationId

  const now = new Date()
  const recentStart = new Date(now)
  recentStart.setDate(recentStart.getDate() - 30)
  const previousStart = new Date(now)
  previousStart.setDate(previousStart.getDate() - 60)

  const getTrend = ({ recentAmount, previousAmount, recentCount, previousCount }) => {
    if (previousAmount === 0 && previousCount === 0) {
      if (recentAmount > 0 || recentCount > 0) return 'UP'
      return 'FLAT'
    }

    const amountPct = previousAmount === 0 ? (recentAmount > 0 ? 1 : 0) : (recentAmount - previousAmount) / previousAmount
    const countPct = previousCount === 0 ? (recentCount > 0 ? 1 : 0) : (recentCount - previousCount) / previousCount
    const avgPct = (amountPct + countPct) / 2

    if (avgPct >= 0.1) return 'UP'
    if (avgPct <= -0.1) return 'DOWN'
    return 'FLAT'
  }

  const [
    totalDonors,
    donationCount,
    donationSumResult,
    atRiskDonors,
    recentDonations,
    recentCampaignStats,
    previousCampaignStats,
  ] = await Promise.all([
    prisma.donor.count({ where: { organizationId: orgId } }),
    prisma.donation.count({ where: { donor: { organizationId: orgId } } }),
    prisma.donation.aggregate({ _sum: { amount: true }, where: { donor: { organizationId: orgId } } }),
    prisma.donor.findMany({
      where: { organizationId: orgId, retentionRisk: { in: ['HIGH', 'CRITICAL'] } },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        retentionRisk: true,
        totalAmount: true,
        totalGifts: true,
        lastGiftDate: true,
      },
    }),
    prisma.donation.findMany({
      where: { donor: { organizationId: orgId } },
      include: { donor: true, campaign: true },
      orderBy: { createdAt: 'desc' },
      take: 6,
    }),
    prisma.donation.groupBy({
      by: ['campaignId'],
      where: {
        donor: { organizationId: orgId },
        campaignId: { not: null },
        date: { gte: recentStart },
      },
      _sum: { amount: true },
      _count: { _all: true },
    }),
    prisma.donation.groupBy({
      by: ['campaignId'],
      where: {
        donor: { organizationId: orgId },
        campaignId: { not: null },
        date: { gte: previousStart, lt: recentStart },
      },
      _sum: { amount: true },
      _count: { _all: true },
    }),
  ])

  const recentMap = new Map(
    recentCampaignStats
      .filter((row) => row.campaignId)
      .map((row) => [
        row.campaignId,
        {
          amount: row._sum?.amount ?? 0,
          count: row._count?._all ?? 0,
        },
      ])
  )

  const previousMap = new Map(
    previousCampaignStats
      .filter((row) => row.campaignId)
      .map((row) => [
        row.campaignId,
        {
          amount: row._sum?.amount ?? 0,
          count: row._count?._all ?? 0,
        },
      ])
  )

  const campaignIds = Array.from(new Set([...recentMap.keys(), ...previousMap.keys()]))

  const campaigns = campaignIds.length
    ? await prisma.campaign.findMany({
      where: { organizationId: orgId, id: { in: campaignIds } },
      select: { id: true, name: true },
    })
    : []

  const campaignNameById = new Map(campaigns.map((c) => [c.id, c.name]))

  const campaignInsights = campaignIds
    .map((id) => {
      const recent = recentMap.get(id) ?? { amount: 0, count: 0 }
      const previous = previousMap.get(id) ?? { amount: 0, count: 0 }
      const trend = getTrend({
        recentAmount: recent.amount,
        previousAmount: previous.amount,
        recentCount: recent.count,
        previousCount: previous.count,
      })
      return {
        id,
        name: campaignNameById.get(id) ?? 'Unknown campaign',
        recentAmount: recent.amount,
        previousAmount: previous.amount,
        recentCount: recent.count,
        previousCount: previous.count,
        trend,
      }
    })
    .sort((a, b) => b.recentAmount - a.recentAmount)

  const upCampaigns = campaignInsights.filter((c) => c.trend === 'UP')
  const downCampaigns = campaignInsights.filter((c) => c.trend === 'DOWN')

  const nextSteps = []
  if (upCampaigns.length) {
    nextSteps.push(`Double down on “${upCampaigns[0].name}” — it’s trending up.`)
  }
  if (downCampaigns.length) {
    nextSteps.push(`Review “${downCampaigns[0].name}” — it’s trending down.`)
  }
  if (!upCampaigns.length && !downCampaigns.length && campaignInsights.length) {
    nextSteps.push('Run a small test (email/landing copy) to move a flat campaign.')
  }
  if (!campaignInsights.length) {
    nextSteps.push('Record a few donations with campaigns to start tracking trends.')
  }
  nextSteps.push('Check totals weekly and adjust outreach accordingly.')

  const totalAmount = donationSumResult?._sum?.amount ?? 0

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-2">Welcome to your donor retention platform</p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
        >
          Home
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl shadow bg-gradient-to-r from-teal-700 to-cyan-600 text-white">
          <div className="text-sm text-white/80">Total Donors</div>
          <div className="text-3xl font-semibold mt-2">{totalDonors}</div>
        </div>

        <div className="p-5 rounded-xl shadow bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
          <div className="text-sm text-white/80">Total Donations</div>
          <div className="text-3xl font-semibold mt-2">{donationCount}</div>
        </div>

        <div className="p-5 rounded-xl shadow bg-gradient-to-r from-cyan-700 to-teal-600 text-white">
          <div className="text-sm text-white/80">Amount Received</div>
          <div className="text-3xl font-semibold mt-2">${totalAmount.toFixed(2)}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">At-risk Donors</div>
              <div className="text-2xl font-semibold">{atRiskDonors.length}</div>
            </div>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">Donors with high or critical retention risk.</p>

          {atRiskDonors.length ? (
            <ul className="mt-3 space-y-2 max-h-56 overflow-auto">
              {atRiskDonors.map((d) => (
                <li key={d.id} className="flex items-center justify-between p-2 rounded bg-muted">
                  <div>
                    <div className="font-medium">{d.firstName} {d.lastName}</div>
                    <div className="text-sm text-muted-foreground">{d.email || 'No email'} — {d.retentionRisk}</div>
                  </div>
                  <div className="text-sm text-muted-foreground">Gifts: {d.totalGifts ?? 0} — ${((d.totalAmount) || 0).toFixed(2)}</div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-3 text-sm text-muted-foreground">No at-risk donors</div>
          )}
        </div>

        <div className="p-4 bg-card border border-border rounded-xl shadow">
          <div className="text-sm text-muted-foreground">Recent Donations</div>
          <ul className="mt-3 space-y-2">
            {recentDonations.length ? (
              recentDonations.map((d) => (
                <li key={d.id} className="flex justify-between">
                  <div>
                    <div className="font-medium">{d.donor?.firstName} {d.donor?.lastName}</div>
                    <div className="text-sm text-muted-foreground">{d.campaign?.name ?? 'General'}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">${d.amount.toFixed(2)}</div>
                    <div className="text-sm text-muted-foreground">{new Date(d.createdAt).toLocaleDateString()}</div>
                  </div>
                </li>
              ))
            ) : (
              <li className="text-sm text-muted-foreground">No recent donations</li>
            )}
          </ul>
        </div>
      </div>

      <div className="p-4 bg-card border border-border rounded-xl shadow">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-muted-foreground">Campaign Insights</div>
            <div className="text-lg font-semibold">Trending up/down (last 30 days)</div>
          </div>
          <Link href="/campaigns" className="text-sm underline transition-colors hover:text-primary">
            View campaigns
          </Link>
        </div>

        {campaignInsights.length ? (
          <ul className="mt-4 space-y-2">
            {campaignInsights.slice(0, 6).map((c) => (
              <li key={c.id} className="flex items-center justify-between p-2 rounded bg-muted">
                <div>
                  <Link
                    href={`/campaigns/${c.id}`}
                    className="inline-block rounded-sm font-medium transition-colors duration-150 hover:text-primary hover:underline hover:underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    {c.name}
                  </Link>
                  <div className="text-sm text-muted-foreground">
                    30d: {formatCurrency(c.recentAmount)} · {c.recentCount} gifts
                    <span className="mx-2">•</span>
                    Prev 30d: {formatCurrency(c.previousAmount)} · {c.previousCount} gifts
                  </div>
                </div>
                <div className="text-sm font-semibold">
                  {c.trend === 'UP' ? 'Up' : c.trend === 'DOWN' ? 'Down' : 'Flat'}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-4 text-sm text-muted-foreground">No campaign donations in the last 60 days.</div>
        )}

        <div className="mt-5">
          <div className="text-sm text-muted-foreground">What to do next</div>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            {nextSteps.slice(0, 3).map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}