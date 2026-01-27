"use client"

// Segments page (client)
import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useSegments } from '@/hooks/use-segments'

export default function SegmentsPage() {
  const [searchDraft, setSearchDraft] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)

  const { segments, loading, error, pagination, refetch } = useSegments(page, limit, { search })
  const [deletingId, setDeletingId] = useState(null)

  function runSearch() {
    setPage(1)
    setSearch(searchDraft)
  }

  async function handleDelete(id, name) {
    const ok = window.confirm(`Delete segment "${name || 'this segment'}"? This cannot be undone.`)
    if (!ok) return

    setDeletingId(id)
    try {
      const res = await fetch(`/api/segments/${id}`, { method: 'DELETE', credentials: 'same-origin' })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error || `Failed to delete segment (${res.status})`)
      }
      await refetch()
    } catch (e) {
      window.alert(String(e?.message || e))
    } finally {
      setDeletingId(null)
    }
  }
  const sampleSegments = [
    { id: 'sample-1', name: 'Recent Donors', description: 'Donors who gave within the last 30 days', memberCount: 42 },
    { id: 'sample-2', name: 'Lapsed Major Donors', description: 'Major donors with no gifts in 12+ months', memberCount: 18 },
    { id: 'sample-3', name: 'New Subscribers', description: 'Contacts created in the last 90 days', memberCount: 120 },
  ]

  const totalPages = Math.max(1, Math.ceil((pagination?.total || 0) / (pagination?.limit || limit)))

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-800" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Donor Segments</h1>
          <p className="text-base text-gray-600 mt-2" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Build dynamic groups of donors</p>
        </div>
        <Link href="/segments/new">
          <button className="px-6 py-3 rounded-lg text-white font-medium shadow-sm" style={{backgroundColor: '#5B9FDF', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>
            <Plus className="inline mr-2 h-4 w-4" />
            New Segment
          </button>
        </Link>
      </div>

      <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
        <div className="flex gap-4 items-center">
          <input
            value={searchDraft}
            onChange={(e) => setSearchDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') runSearch()
            }}
            placeholder="Search segments by name or description..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder:text-gray-400"
            style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-3 items-center">
          <button type="button" className={`px-4 py-2 rounded-lg font-medium ${filter === 'all' ? 'text-white' : 'bg-gray-100 text-gray-700'}`} style={{backgroundColor: filter === 'all' ? '#5B9FDF' : undefined, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}} onClick={() => setFilter('all')}>
            All Segments
          </button>
          <button type="button" className={`px-4 py-2 rounded-lg font-medium ${filter === 'suggested' ? 'text-white' : 'bg-gray-100 text-gray-700'}`} style={{backgroundColor: filter === 'suggested' ? '#5B9FDF' : undefined, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}} onClick={() => setFilter('suggested')}>
            Suggested
          </button>

          <select
            value={limit}
            onChange={(e) => { setLimit(Number(e.target.value)); setPage(1) }}
            className="border border-gray-200 rounded-lg px-3 py-2 ml-auto bg-white text-gray-800"
            style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}
          >
            <option value={5}>5 / page</option>
            <option value={10}>10 / page</option>
            <option value={20}>20 / page</option>
          </select>
        </div>
      </div>

      <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
        {loading ? (
          <div className="text-center py-8 text-gray-600" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Loading segments...</div>
        ) : error ? (
          <div className="text-red-600" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Error loading segments: {String(error.message || error)}</div>
        ) : filter === 'suggested' ? (
          <div>
            <h2 className="text-xl font-semibold text-gray-800" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Suggested segments</h2>
            <p className="text-sm text-gray-600 mt-1" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Common segment ideas you can create in one click.</p>
            <ul className="mt-4 space-y-3">
              {sampleSegments.map((s) => (
                <li key={s.id} className="p-4 border border-gray-200 rounded-lg flex justify-between items-center">
                  <div>
                    <div className="font-medium text-gray-800" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>{s.name}</div>
                    <div className="text-sm text-gray-600" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>{s.description}</div>
                    <div className="text-xs text-gray-600 mt-1" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Approx members: {s.memberCount}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Your segments</h2>
              <div className="text-sm text-gray-600" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>{pagination.total} total</div>
            </div>

            <ul className="mt-4 space-y-3">
              {segments.length ? segments.map((s) => (
                <li key={s.id} className="p-4 border border-gray-200 rounded-lg flex justify-between items-center">
                  <div>
                    <div className="font-medium text-gray-800" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>{s.name}</div>
                    <div className="text-sm text-gray-600" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>{s.description || ''}</div>
                    <div className="text-xs text-gray-600 mt-1" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Members: {s.memberCount ?? 0}</div>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/segments/${s.id}`}
                      className="text-sm underline underline-offset-4 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                      style={{color: '#5B9FDF', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}
                    >
                      View
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(s.id, s.name)}
                      disabled={deletingId === s.id}
                      className="px-3 py-1 rounded-lg bg-red-50 text-red-700 text-sm disabled:opacity-60"
                      style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}
                    >
                      {deletingId === s.id ? 'Deleting…' : 'Delete'}
                    </button>
                  </div>
                </li>
              )) : (
                <div className="p-4 text-sm text-gray-600" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>No segments found</div>
              )}
            </ul>

            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-600" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Page {pagination.page} of {totalPages} — {pagination.total} segments</div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-60 text-gray-800" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}} disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</button>
                <button className="px-3 py-1 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-60 text-gray-800" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}} disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}