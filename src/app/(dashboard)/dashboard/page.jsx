// Dashboard home page with sidebar
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import CampaignInsightsClient from '@/components/dashboard/campaign-insights-client'
import { getSessionUser } from '@/lib/session'
import { prisma } from '@/lib/db'
import { formatCurrency, formatDate } from '@/lib/utils'
import DashboardStatsClient from '@/components/dashboard/stats-client'
import { getCampaignNextSteps } from '@/lib/ai/campaign-insights'

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
      take: 10,
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

  const { nextSteps } = await getCampaignNextSteps({ campaignInsights })

  const totalAmount = donationSumResult?._sum?.amount ?? 0

  // shared system font
  const systemFont = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'

  return (
    <div className="space-y-6" suppressHydrationWarning style={{ fontFamily: systemFont }}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-800" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Dashboard</h1>
          <p className="text-base text-gray-600 mt-2" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Welcome to your donor retention platform</p>
        </div>

        <Link href="/">
          <button className="px-6 py-2 rounded-full border-2 border-blue-500 text-blue-500 font-medium hover:bg-blue-50 transition-colors">
            Home
          </button>
        </Link>
      </div>

          <DashboardStatsClient initial={{ totalDonors, totalDonations: donationCount, totalAmount }} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>At-risk Donors</h3>
            <div className="text-5xl font-bold mb-3" style={{color: '#5B9FDF', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>{atRiskDonors.length}</div>
            <p className="text-sm" style={{color: '#7B68A6', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Donors with high or critical retention risk</p>
          </div>

          {atRiskDonors.length ? (
            <div className="border-t border-gray-200 pt-6 space-y-6">
              {atRiskDonors.slice(0, 3).map((d) => (
                <div key={d.id} className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-bold text-gray-900 mb-1" style={{fontSize: '15px'}}>
                      {d.firstName} {d.lastName}
                    </div>
                    <div className="text-sm flex items-center gap-2" style={{color: '#7B68A6'}}>
                      <span>{d.email || 'No email'}</span>
                      <span className="px-2 py-0.5 text-xs font-semibold rounded" style={{backgroundColor: '#FEE2E2', color: '#DC2626'}}>HIGH</span>
                    </div>
                  </div>
                  <div className="text-sm ml-4" style={{color: '#9CA3AF'}}>{d.totalGifts ?? 0} donations</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-3 text-sm text-gray-500">No at-risk donors</div>
          )}
        </div>

        <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-2" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Recent Donations</h3>
          <p className="text-sm mb-6" style={{color: '#7B68A6', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Latest contributions from your donors</p>
          
          <div className="border-t border-gray-200 pt-4 mt-4">
            <div className="grid grid-cols-3 gap-4 mb-6 pb-3 border-b border-gray-200">
              <div className="text-xs font-semibold uppercase tracking-wide" style={{color: '#9CA3AF', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Donor</div>
              <div className="text-xs font-semibold uppercase tracking-wide text-center" style={{color: '#9CA3AF', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Amount</div>
              <div className="text-xs font-semibold uppercase tracking-wide text-right" style={{color: '#9CA3AF', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Date</div>
            </div>
            
            {recentDonations.length ? (
              <div className="space-y-6">
                {recentDonations.map((d) => (
                  <div key={d.id} className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="font-medium" style={{color: '#374151', fontSize: '15px'}}>{d.donor?.firstName} {d.donor?.lastName}</div>
                      <div className="text-sm mt-1" style={{color: '#9CA3AF'}}>{d.campaign?.name ?? 'General'}</div>
                    </div>
                    <div className="text-center font-bold" style={{color: '#5FBF6F', fontSize: '15px'}}>
                      ${d.amount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </div>
                    <div className="text-right" style={{color: '#374151', fontSize: '15px'}}>{formatDate(d.createdAt)}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500">No recent donations</div>
            )}
          </div>
        </div>
      </div>

      <div id="campaign-insights">
        <CampaignInsightsClient campaignInsights={campaignInsights} nextSteps={nextSteps} />
      </div>
    </div>
  )
}