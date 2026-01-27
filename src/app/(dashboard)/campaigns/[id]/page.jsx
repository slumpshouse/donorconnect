import { prisma } from '@/lib/db'
import { getSessionUser } from '@/lib/session'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'

function formatDonationType(type) {
  if (!type) return '—'
  const normalized = String(type).toUpperCase()
  if (normalized === 'ONE_TIME') return 'One-time'
  if (normalized === 'RECURRING') return 'Recurring'
  if (normalized === 'PLEDGE') return 'Pledge'
  if (normalized === 'IN_KIND') return 'In-kind'
  return String(type).replace(/_/g, ' ')
}

export default async function CampaignDetailPage({ params }) {
  const resolvedParams = await Promise.resolve(params)
  const id = resolvedParams?.id
  if (!id) notFound()

  const user = await getSessionUser()
  if (!user) redirect('/login')
  const orgId = user.organizationId

  const campaign = await prisma.campaign.findFirst({ where: { id, organizationId: orgId } })
  if (!campaign) return <div className="p-6">Campaign not found</div>

  const [donationAgg, topDonations, recent] = await Promise.all([
    prisma.donation.aggregate({
      where: { campaignId: id, donor: { organizationId: orgId } },
      _sum: { amount: true },
      _count: { id: true },
    }),
    prisma.donation.findMany({
      where: { campaignId: id, donor: { organizationId: orgId } },
      include: { donor: true },
      orderBy: { amount: 'desc' },
      take: 5,
    }),
    prisma.donation.findMany({
      where: { campaignId: id, donor: { organizationId: orgId } },
      include: { donor: true },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
  ])

  const totalAmount = donationAgg._sum?.amount ?? 0
  const donationCount = donationAgg._count?.id ?? 0
  const average = donationCount ? totalAmount / donationCount : 0
  const goal = campaign.goal ?? 0
  const progress = goal > 0 ? Math.min(100, (totalAmount / goal) * 100) : 0

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold transition-colors duration-150 hover:underline hover:underline-offset-4 text-gray-800" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>
                {campaign.name}
              </h1>
              <div className="text-sm text-gray-600 mt-2" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>{campaign.startDate ? formatDate(campaign.startDate) : '—'} • {campaign.endDate ? formatDate(campaign.endDate) : '—'}</div>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>{campaign.status?.toLowerCase?.() || 'Active'}</span>
              <Link href={`/campaigns/${id}/edit`}>
                <button className="px-4 py-2 rounded-lg text-white font-medium" style={{backgroundColor: '#5B9FDF', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Edit</button>
              </Link>
            </div>
          </div>

          <div className="mt-6">
            <div className="text-4xl font-extrabold" style={{color: '#5FBF6F', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>${totalAmount.toLocaleString()}</div>
            <div className="text-sm text-gray-600" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}> / ${goal.toLocaleString()}</div>

            <div className="mt-4 bg-gray-100 rounded-full h-3 overflow-hidden">
              <div className="h-3" style={{background: 'linear-gradient(90deg, #5B9FDF 0%, #4A9EE0 100%)', width: `${progress}%`}} />
            </div>
            <div className="text-sm text-center text-gray-600 mt-2" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>{progress.toFixed(1)}% of goal reached</div>
          </div>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
            <h2 className="font-semibold text-gray-800" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Top Donors</h2>
            <ul className="mt-3 space-y-3">
              {topDonations.map((d) => (
                <li key={d.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-white">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-md bg-blue-100 flex items-center justify-center text-gray-700 font-semibold" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>{(d.donor?.firstName?.[0]||'').toUpperCase()}{(d.donor?.lastName?.[0]||'').toUpperCase()}</div>
                    <div>
                      <div className="font-medium text-gray-900" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>{d.donor?.firstName} {d.donor?.lastName}</div>
                      <div className="text-sm text-gray-600" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>{d.donor?.totalGifts ?? 1} donation{(d.donor?.totalGifts ?? 1) > 1 ? 's' : ''}</div>
                    </div>
                  </div>
                  <div className="text-gray-900 font-semibold" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>${d.amount.toLocaleString()}</div>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
            <h2 className="font-semibold text-gray-800" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Campaign Donations</h2>
            <div className="mt-3 space-y-3">
              {recent.map((d) => (
                <div key={d.id} className="p-3 border border-gray-200 rounded-lg flex justify-between items-center bg-white">
                  <div>
                    <div className="font-medium text-gray-900" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>
                      {d.donor?.id ? (
                        <Link
                          href={`/donors/${d.donor.id}`}
                          className="rounded-sm transition-colors hover:underline hover:underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          style={{color: '#5B9FDF'}}
                        >
                          {d.donor?.firstName} {d.donor?.lastName}
                        </Link>
                      ) : (
                        <span>{d.donor?.firstName} {d.donor?.lastName}</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>{d.donor?.id} • {formatDate(d.createdAt)}</div>
                    <div className="mt-2">
                      <Badge variant="secondary" className="font-medium bg-gray-100 text-gray-700 border border-gray-200" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>
                        {formatDonationType(d.type)}
                      </Badge>
                      {d.notes && <span className="inline-block px-2 py-1 ml-2 text-sm text-gray-600" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>{d.notes}</span>}
                    </div>
                  </div>
                  <div className="text-gray-900 font-semibold" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>${d.amount.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
            <h3 className="font-medium text-gray-800" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Stats</h3>
            <div className="mt-4 grid grid-cols-1 gap-3">
              <div className="p-4 bg-blue-50 border border-gray-200 rounded-lg"><div className="text-xl font-bold text-gray-900" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>{donationCount}</div><div className="text-sm text-gray-600" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Total Donations</div></div>
              <div className="p-4 bg-green-50 border border-gray-200 rounded-lg"><div className="text-xl font-bold text-gray-900" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>${(average).toFixed(0)}</div><div className="text-sm text-gray-600" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Average Gift</div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
