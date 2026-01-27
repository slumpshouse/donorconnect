"use client"
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useCampaigns } from '@/hooks/use-campaigns'
import { useEffect, useState } from 'react'

export default function CampaignsPage() {
  const { campaigns, loading, error, refetch } = useCampaigns()
  const [localCampaigns, setLocalCampaigns] = useState([])
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    setLocalCampaigns(Array.isArray(campaigns) ? campaigns : [])
  }, [campaigns])

  async function handleDelete(id, name) {
    const ok = window.confirm(`Delete campaign "${name || 'this campaign'}"? This cannot be undone.`)
    if (!ok) return

    setDeletingId(id)
    try {
      const res = await fetch(`/api/campaigns/${id}`, { method: 'DELETE', credentials: 'same-origin' })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error || `Failed to delete campaign (${res.status})`)
      }

      // remove immediately from UI
      setLocalCampaigns((prev) => (prev || []).filter((c) => c.id !== id))

      await refetch()
    } catch (e) {
      window.alert(String(e?.message || e))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-800" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Campaigns</h1>
          <p className="text-base text-gray-600 mt-2" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Create and manage fundraising campaigns</p>
        </div>
        <Link href="/campaigns/new">
          <button className="px-6 py-3 rounded-lg text-white font-medium shadow-sm" style={{backgroundColor: '#5B9FDF', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>
            Add Campaign
          </button>
        </Link>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Loading campaigns...</div>
        ) : error ? (
          <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm text-red-600" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Error loading campaigns: {String(error.message || error)}</div>
        ) : localCampaigns.length ? localCampaigns.map((c) => {
          const remaining = Math.max(0, (c.goal ?? 0) - (c.totalAmount ?? 0))
          const progress = c.goal ? Math.min(100, ((c.totalAmount ?? 0) / c.goal) * 100) : 0

          const start = c.startDate ? new Date(c.startDate) : null
          const end = c.endDate ? new Date(c.endDate) : null
          return (
            <div key={c.id} className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <Link
                    href={`/campaigns/${c.id}`}
                    className="group inline-block rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                  >
                    <h2 className="text-3xl font-extrabold text-gray-800 transition-colors duration-150 group-hover:underline group-hover:underline-offset-4" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', color: '#374151'}}>
                      {c.name}
                    </h2>
                  </Link>
                  <div className="text-sm text-gray-600 mt-2" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>{start ? start.toLocaleDateString() : '—'} - {end ? end.toLocaleDateString() : '—'}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium" style={{backgroundColor: c.status === 'ACTIVE' ? '#D1FAE5' : c.status === 'COMPLETED' ? '#D1FAE5' : '#E5E7EB', color: c.status === 'ACTIVE' ? '#065F46' : c.status === 'COMPLETED' ? '#065F46' : '#6B7280', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>✓ {String(c.status || 'DRAFT')}</span>
                  <Link
                    href={`/campaigns/${c.id}`}
                    className="px-4 py-2 rounded-lg text-white text-sm shadow-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                    style={{backgroundColor: '#10B981', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}
                  >
                    View
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(c.id, c.name)}
                    disabled={deletingId === c.id}
                    className="px-3 py-1 rounded-lg bg-red-50 text-red-700 text-sm disabled:opacity-60"
                    style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}
                  >
                    {deletingId === c.id ? 'Deleting…' : 'Delete'}
                  </button>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-baseline gap-4">
                  <div className="text-4xl font-extrabold" style={{color: '#10B981', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>${(c.totalAmount || 0).toLocaleString()}</div>
                  <div className="text-gray-600" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>/ ${(c.goal || 0).toLocaleString()}</div>
                </div>

                <div className="mt-4 bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div className="h-3" style={{ width: `${progress}%`, background: 'linear-gradient(to right, #5B9FDF, #7CB9E8)' }} />
                </div>
                <div className="text-center mt-2" style={{color: '#5B9FDF', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>{progress.toFixed(1)}% of goal reached</div>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
                  <div className="text-2xl font-bold text-gray-800" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>{c.totalDonors}</div>
                  <div className="text-sm text-gray-600" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>TOTAL DONORS</div>
                </div>
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
                  <div className="text-2xl font-bold text-gray-800" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>${c.averageGift.toLocaleString()}</div>
                  <div className="text-sm text-gray-600" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>AVERAGE GIFT</div>
                </div>
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
                  <div className="text-2xl font-bold text-gray-800" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>${remaining.toLocaleString()}</div>
                  <div className="text-sm text-gray-600" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>REMAINING</div>
                </div>
              </div>
            </div>
          )
        }) : (
          <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm text-gray-600" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>No campaigns found</div>
        )}
      </div>
    </div>
  )
}