'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { RetentionRiskBadge } from '@/components/donors/retention-risk-badge'

// Donor detail page
export default function DonorDetailPage() {
  const params = useParams()
  const router = useRouter()
  const donorId = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : null

  const [donor, setDonor] = useState(null)
  const [donations, setDonations] = useState([])
  const [interactions, setInteractions] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('overview')
  const [deleting, setDeleting] = useState(false)
  const [loadError, setLoadError] = useState(null)

  useEffect(() => {
    let mounted = true
    if (!donorId) return

    async function fetchData() {
      setLoading(true)
      setLoadError(null)
      try {
        const [donorRes, donationsRes, interactionsRes] = await Promise.all([
          fetch(`/api/donors/${donorId}`, { credentials: 'same-origin' }),
          fetch(`/api/donors/${donorId}/donations`, { credentials: 'same-origin' }),
          fetch(`/api/donors/${donorId}/interactions`, { credentials: 'same-origin' }),
        ])

        if (!mounted) return

        const donorJson = donorRes.ok ? await donorRes.json() : null
        const donationsJson = donationsRes.ok ? await donationsRes.json() : []
        const interactionsJson = interactionsRes.ok ? await interactionsRes.json() : []

        setDonor(donorJson)
        setDonations(Array.isArray(donationsJson) ? donationsJson : [])
        setInteractions(Array.isArray(interactionsJson) ? interactionsJson : [])
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e)
        if (mounted) setLoadError(e)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchData()
    return () => (mounted = false)
  }, [donorId])

  if (!donorId) return <div className="text-red-600">No donor specified.</div>

  async function handleDelete() {
    const ok = window.confirm('Delete this donor? This cannot be undone.')
    if (!ok) return

    setDeleting(true)
    try {
      const res = await fetch(`/api/donors/${donorId}`, { method: 'DELETE', credentials: 'same-origin' })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error || `Failed to delete donor (${res.status})`)
      }
      router.push('/donors')
    } catch (e) {
      window.alert(String(e?.message || e))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-xl font-bold text-gray-700" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>
            {donor ? (donor.firstName?.[0] ?? '?') : 'D'}
          </div>
          <div>
            <div className="text-2xl font-semibold text-gray-800" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>{donor ? `${donor.firstName} ${donor.lastName}` : 'Loading...'}</div>
            <div className="text-sm text-gray-600" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>{donor?.email ?? 'No email'} • {donor?.phone ?? 'No phone'}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/donors/${donorId}/edit`} className="px-4 py-2 rounded-lg text-white" style={{backgroundColor: '#5B9FDF', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Edit</Link>
          <button onClick={handleDelete} disabled={deleting} className="px-4 py-2 rounded-lg text-white disabled:opacity-60" style={{backgroundColor: '#ef4444', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
        <div className="flex gap-4 border-b border-gray-200 pb-3">
          <button onClick={() => setTab('overview')} className={`pb-2 text-sm font-medium ${tab === 'overview' ? 'border-b-2 text-gray-900' : 'text-gray-600'}`} style={tab === 'overview' ? {borderColor: '#5B9FDF', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'} : {fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Overview</button>
          <button onClick={() => setTab('donations')} className={`pb-2 text-sm font-medium ${tab === 'donations' ? 'border-b-2 text-gray-900' : 'text-gray-600'}`} style={tab === 'donations' ? {borderColor: '#5B9FDF', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'} : {fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Donations</button>
          <button onClick={() => setTab('interactions')} className={`pb-2 text-sm font-medium ${tab === 'interactions' ? 'border-b-2 text-gray-900' : 'text-gray-600'}`} style={tab === 'interactions' ? {borderColor: '#5B9FDF', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'} : {fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Interactions</button>
        </div>

        <div className="mt-4">
          {loading && <div style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Loading data...</div>}
          {!loading && loadError && <div className="text-red-600" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Error: {String(loadError.message || loadError)}</div>}

          {!loading && tab === 'overview' && (
            <div className="space-y-4">
              <div className="p-4 border border-gray-200 rounded-lg bg-blue-50">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-600" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Retention insights</div>
                    <div className="text-sm text-gray-700" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Retention risk overview</div>
                  </div>
                  <RetentionRiskBadge risk={donor?.aiInsights?.level || donor?.retentionRisk} />
                </div>
                {donor?.aiInsights?.summary && (
                  <div className="mt-2 text-sm text-gray-600" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>{donor.aiInsights.summary}</div>
                )}
                {donor?.aiInsights?.factors && (
                  <div className="mt-2 text-xs text-gray-600" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>
                    {typeof donor.aiInsights.factors.daysSinceLastGift === 'number'
                      ? `Days since last gift: ${donor.aiInsights.factors.daysSinceLastGift} • `
                      : ''}
                    Total gifts: {donor.aiInsights.factors.totalGifts ?? (donor.totalGifts ?? 0)} •
                    Total amount: ${(donor.aiInsights.factors.totalAmount ?? (donor.totalAmount ?? 0)).toFixed(2)}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 border border-gray-200 rounded-lg bg-white">
                  <div className="text-sm text-gray-600" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Status</div>
                  <div className="text-lg font-semibold text-gray-900" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>{donor?.status ?? '—'}</div>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg bg-white">
                  <div className="text-sm text-gray-600" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Retention Risk</div>
                  <div className="text-lg font-semibold text-gray-900" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>{donor?.retentionRisk ?? '—'}</div>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg bg-white">
                  <div className="text-sm text-gray-600" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Created</div>
                  <div className="text-lg font-semibold text-gray-900" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>{donor?.createdAt ? new Date(donor.createdAt).toLocaleDateString() : '—'}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 border border-gray-200 rounded-lg bg-blue-50">
                <div className="text-sm text-gray-600" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Total Gifts</div>
                <div className="text-lg font-semibold text-gray-900" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>{donor?.totalGifts ?? 0}</div>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg bg-green-50">
                <div className="text-sm text-gray-600" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Total Amount</div>
                <div className="text-lg font-semibold text-gray-900" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>${(donor?.totalAmount ?? 0).toFixed(2)}</div>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg bg-orange-50">
                <div className="text-sm text-gray-600" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Last Gift</div>
                <div className="text-lg font-semibold text-gray-900" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>{donor?.lastGiftDate ? new Date(donor.lastGiftDate).toLocaleDateString() : '—'}</div>
              </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 border border-gray-200 rounded-lg bg-white">
                  <div className="text-sm text-gray-600" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Address</div>
                  <div className="text-sm text-gray-700" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>{donor?.address || '—'}</div>
                  <div className="text-sm text-gray-700" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>{[donor?.city, donor?.state, donor?.zipCode].filter(Boolean).join(', ') || '—'}</div>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg bg-white">
                  <div className="text-sm text-gray-600" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Contact</div>
                  <div className="text-sm text-gray-700" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Email: {donor?.email || '—'}</div>
                  <div className="text-sm text-gray-700" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Phone: {donor?.phone || '—'}</div>
                </div>
              </div>
            </div>
          )}

          {!loading && tab === 'donations' && (
            <div>
              {donations.length ? (
                <ul className="space-y-2">
                  {donations.map((d) => (
                    <li key={d.id} className="flex justify-between p-3 border border-gray-200 rounded-lg bg-white">
                      <div>
                        <div className="font-medium text-gray-900" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>${d.amount.toFixed(2)}</div>
                        <div className="text-sm text-gray-600" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>{d.campaign?.name ?? 'General'}</div>
                      </div>
                      <div className="text-sm text-gray-600" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>{new Date(d.date).toLocaleDateString()}</div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-sm text-gray-600" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>No donations recorded.</div>
              )}
            </div>
          )}

          {!loading && tab === 'interactions' && (
            <div>
              {interactions.length ? (
                <ul className="space-y-2">
                  {interactions.map((i) => (
                    <li key={i.id} className="p-3 border border-gray-200 rounded-lg bg-white">
                      <div className="font-medium text-gray-900" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>{i.type}</div>
                      <div className="text-sm text-gray-600" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>{i.subject}</div>
                      <div className="text-xs text-gray-600" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>{new Date(i.date).toLocaleString()}</div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-sm text-gray-600" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>No interactions.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
