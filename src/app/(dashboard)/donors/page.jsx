"use client"

// Donors list page (client)
import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useDonors } from '@/hooks/use-donors'
import { RetentionRiskBadge } from '@/components/donors/retention-risk-badge'

export default function DonorsPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [retentionRisk, setRetentionRisk] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)

  const { donors, loading, error, pagination } = useDonors(page, limit, {
    search,
    status,
    retentionRisk,
  })

  const totalPages = Math.max(1, Math.ceil((pagination?.total || 0) / (pagination?.limit || limit)))

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Donors</h1>
          <p className="text-gray-600 mt-2">Manage your donor relationships and track engagement</p>
        </div>
        <Link href="/donors/new">
          <Button size="lg" className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg transform-gpu hover:scale-105">
            <Plus className="mr-2 h-4 w-4" />
            Add Donor
          </Button>
        </Link>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <div className="flex gap-3 items-center mb-4">
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search donors by name or email"
            className="border rounded px-3 py-2 w-1/3"
          />

          <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }} className="border rounded px-2 py-2">
            <option value="">All status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>

          <select value={retentionRisk} onChange={(e) => { setRetentionRisk(e.target.value); setPage(1) }} className="border rounded px-2 py-2">
            <option value="">All risk</option>
            <option value="UNKNOWN">Unknown</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>

          <select value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1) }} className="border rounded px-2 py-2 ml-auto">
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
                      <td className="p-2 text-sm text-gray-600">{d.email || '-'}</td>
                      <td className="p-2 text-sm text-gray-600">{d.phone || '-'}</td>
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
                    <td className="p-4 text-sm text-gray-500" colSpan={8}>No donors found</td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-600">Showing page {pagination.page} of {totalPages} — {pagination.total} donors</div>
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