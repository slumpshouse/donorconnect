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
      <div className="bg-gradient-to-r from-teal-700 to-emerald-600 p-8 rounded-lg text-white flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Campaigns</h1>
          <p className="mt-2 text-white/80">Create and manage fundraising campaigns</p>
        </div>
        <div>
          <Link href="/campaigns/new">
            <Button>Add Campaign</Button>
          </Link>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="bg-card border border-border p-6 rounded-xl shadow">Loading campaigns...</div>
        ) : error ? (
          <div className="bg-card border border-border p-6 rounded-xl shadow text-red-600">Error loading campaigns: {String(error.message || error)}</div>
        ) : localCampaigns.length ? localCampaigns.map((c) => {
          const remaining = Math.max(0, (c.goal ?? 0) - (c.totalAmount ?? 0))
          const progress = c.goal ? Math.min(100, ((c.totalAmount ?? 0) / c.goal) * 100) : 0

          const start = c.startDate ? new Date(c.startDate) : null
          const end = c.endDate ? new Date(c.endDate) : null
          return (
            <div key={c.id} className="bg-card border border-border p-6 rounded-xl shadow">
              <div className="flex items-start justify-between">
                <div>
                  <Link
                    href={`/campaigns/${c.id}`}
                    className="group inline-block rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <h2 className="text-3xl font-extrabold text-foreground transition-colors duration-150 group-hover:text-primary group-hover:underline group-hover:underline-offset-4">
                      {c.name}
                    </h2>
                  </Link>
                  <div className="text-sm text-muted-foreground mt-2">{start ? start.toLocaleDateString() : '—'} - {end ? end.toLocaleDateString() : '—'}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">✓ {String(c.status || 'DRAFT')}</span>
                  <Link
                    href={`/campaigns/${c.id}`}
                    className="px-3 py-1 rounded bg-muted text-foreground text-sm transition-colors hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    View
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(c.id, c.name)}
                    disabled={deletingId === c.id}
                    className="px-3 py-1 rounded bg-red-50 text-red-700 text-sm disabled:opacity-60"
                  >
                    {deletingId === c.id ? 'Deleting…' : 'Delete'}
                  </button>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-baseline gap-4">
                  <div className="text-4xl font-extrabold text-emerald-600">${(c.totalAmount || 0).toLocaleString()}</div>
                  <div className="text-muted-foreground">/ ${(c.goal || 0).toLocaleString()}</div>
                </div>

                <div className="mt-4 bg-muted rounded-full h-3 overflow-hidden">
                  <div className="h-3 bg-gradient-to-r from-indigo-500 to-purple-600" style={{ width: `${progress}%` }} />
                </div>
                <div className="text-center text-indigo-600 mt-2">{progress.toFixed(1)}% of goal reached</div>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-muted rounded text-center">
                  <div className="text-2xl font-bold">{c.totalDonors}</div>
                  <div className="text-sm text-muted-foreground">TOTAL DONORS</div>
                </div>
                <div className="p-4 bg-muted rounded text-center">
                  <div className="text-2xl font-bold">${c.averageGift.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">AVERAGE GIFT</div>
                </div>
                <div className="p-4 bg-muted rounded text-center">
                  <div className="text-2xl font-bold">${remaining.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">REMAINING</div>
                </div>
              </div>
            </div>
          )
        }) : (
          <div className="bg-card border border-border p-6 rounded-xl shadow text-muted-foreground">No campaigns found</div>
        )}
      </div>
    </div>
  )
}