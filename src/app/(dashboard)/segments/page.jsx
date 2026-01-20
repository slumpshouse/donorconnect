"use client"

// Segments page (client)
import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useSegments } from '@/hooks/use-segments'

export default function SegmentsPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)

  const { segments, loading, error, pagination, refetch } = useSegments(page, limit, { search })
  const [deletingId, setDeletingId] = useState(null)

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
          <h1 className="text-3xl font-bold">Donor Segments</h1>
          <p className="text-gray-600 mt-2">Create and manage donor segments</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <div className="flex gap-3 items-center mb-4">
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search segments by name or description"
            className="border rounded px-3 py-2 w-1/3"
          />

          <select value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1) }} className="border rounded px-2 py-2 ml-auto">
            <option value={5}>5 / page</option>
            <option value={10}>10 / page</option>
            <option value={20}>20 / page</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading segments...</div>
        ) : error ? (
          <div className="text-red-600">Error loading segments: {String(error.message || error)}</div>
        ) : (
          <div>
            <ul className="space-y-3">
              {segments.length ? segments.map((s) => (
                <li key={s.id} className="p-3 border rounded flex justify-between items-center">
                  <div>
                    <div className="font-medium">{s.name}</div>
                    <div className="text-sm text-gray-600">{s.description || ''}</div>
                    <div className="text-xs text-gray-500 mt-1">Members: {s.memberCount ?? 0}</div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/segments/${s.id}`} className="text-sm text-primary underline">View</Link>
                    <Link href={`/segments/${s.id}`} className="text-sm text-primary underline">Add donors</Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(s.id, s.name)}
                      disabled={deletingId === s.id}
                      className="text-sm text-red-700 underline disabled:opacity-60"
                    >
                      {deletingId === s.id ? 'Deleting…' : 'Delete'}
                    </button>
                  </div>
                </li>
              )) : (
                <div className="p-4 text-sm text-gray-500">No segments found</div>
              )}
            </ul>
            <div className="mt-6">
              <h3 className="text-lg font-semibold">Suggested segments</h3>
              <ul className="mt-3 space-y-2">
                {sampleSegments.map((s) => (
                  <li key={s.id} className="p-3 border rounded flex justify-between items-center bg-gray-50">
                    <div>
                      <div className="font-medium">{s.name}</div>
                      <div className="text-sm text-gray-600">{s.description}</div>
                      <div className="text-xs text-gray-500 mt-1">Approx members: {s.memberCount}</div>
                    </div>
                    <div className="flex gap-2">
                      {/* 'Use' template removed */}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-600">Page {pagination.page} of {totalPages} — {pagination.total} segments</div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1 border rounded" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</button>
                <button className="px-3 py-1 border rounded" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}