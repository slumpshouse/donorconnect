"use client"

// Donors list page (client)
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useDonors } from '@/hooks/use-donors'
import { RetentionRiskBadge } from '@/components/donors/retention-risk-badge'

export default function DonorsPage() {
  const [searchDraft, setSearchDraft] = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [retentionRisk, setRetentionRisk] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)

  const { donors, loading, error, pagination, refetch } = useDonors(page, limit, {
    search,
    status,
    retentionRisk,
  })

  function runSearch() {
    setPage(1)
    setSearch(searchDraft)
  }
  
  // refresh when a donor is created elsewhere
  useEffect(() => {
    function onDonorCreated() {
      try {
        refetch && refetch()
      } catch (e) {
        // ignore
      }
    }
    window.addEventListener('donor:created', onDonorCreated)
    return () => window.removeEventListener('donor:created', onDonorCreated)
  }, [refetch])

  const totalPages = Math.max(1, Math.ceil((pagination?.total || 0) / (pagination?.limit || limit)))

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-800" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Donors</h1>
          <p className="text-base text-gray-600 mt-2" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Manage your donor relationships and track engagement</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/donors/new">
            <button className="px-6 py-3 rounded-lg text-white font-medium shadow-sm" style={{backgroundColor: '#5B9FDF', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>
              <Plus className="inline mr-2 h-4 w-4" />
              Add Donor
            </button>
          </Link>

          {/* Duplicate Insights removed per request */}
        </div>
      </div>

      <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
        <div className="flex gap-3 items-center mb-4">
          <input
            value={searchDraft}
            onChange={(e) => { setSearchDraft(e.target.value) }}
            onKeyDown={(e) => { if (e.key === 'Enter') runSearch() }}
            placeholder="Search donors by name or email"
            className="border border-gray-300 rounded-lg px-4 py-2 w-1/3 text-gray-900 placeholder:text-gray-400"
            style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}
          />

          <button type="button" className="px-5 py-2 text-white rounded-lg font-medium" style={{backgroundColor: '#5B9FDF', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}} onClick={runSearch}>
            🔍 Search
          </button>

          <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }} className="border rounded px-2 py-2 bg-background text-foreground">
            <option value="">All status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>

          <select value={retentionRisk} onChange={(e) => { setRetentionRisk(e.target.value); setPage(1) }} className="border rounded px-2 py-2 bg-background text-foreground">
            <option value="">All risk</option>
            <option value="UNKNOWN">Unknown</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>

          <select value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1) }} className="border rounded px-2 py-2 ml-auto bg-background text-foreground">
            <option value={5}>5 / page</option>
            <option value={10}>10 / page</option>
            <option value={20}>20 / page</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading donors...</div>
        ) : error ? (
          <div className="text-red-600">Error loading donors: {String(error.message || error)}</div>
        ) : (
          <div>
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="text-left">
                  <th className="p-2">Name</th>
                  <th className="p-2">Email</th>
                  <th className="p-2">Phone</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Risk</th>
                  
                  <th className="p-2">Gifts</th>
                  <th className="p-2">Amount</th>
                  <th className="p-2">Last Gift</th>
                  
                </tr>
              </thead>
              <tbody>
                {donors.length ? (
                  donors.map((d) => (
                    <tr key={d.id} className="border-t">
                      <td className="p-2">
                        <Link href={`/donors/${d.id}`} className="hover:underline">
                          {d.firstName} {d.lastName}
                        </Link>
                      </td>
                      <td className="p-2 text-sm text-muted-foreground">{d.email || '-'}</td>
                      <td className="p-2 text-sm text-muted-foreground">{d.phone || '-'}</td>
                      <td className="p-2">{d.status}</td>
                      <td className="p-2">
                        <RetentionRiskBadge risk={d?.aiInsights?.level || d.retentionRisk} />
                      </td>
                      
                      <td className="p-2">{d.totalGifts ?? 0}</td>
                      <td className="p-2">${(d.totalAmount ?? 0).toFixed(2)}</td>
                      <td className="p-2">{d.lastGiftDate ? new Date(d.lastGiftDate).toLocaleDateString() : '-'}</td>
                      
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="p-4 text-sm text-muted-foreground" colSpan={8}>No donors found</td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">Showing page {pagination.page} of {totalPages} — {pagination.total} donors</div>
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