"use client"

// Donations list page (client)
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useState, useEffect } from 'react'
import useDashboardStats from '@/hooks/use-dashboard-stats'

const sampleDonations = []

export default function DonationsPage() {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [donations, setDonations] = useState([])
  const [allDonations, setAllDonations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const { stats } = useDashboardStats()
  const totalAmount = stats?.donations?.totalAmount ?? 0
  const totalCount = stats?.donations?.totalDonations ?? 0
  const onlineCount = stats?.donations?.onlineCount ?? 0

  useEffect(() => {
    let mounted = true
    setLoading(true)
    fetch('/api/donations', { credentials: 'same-origin' })
      .then(async (res) => {
        if (!res.ok) throw await res.json()
        return res.json()
      })
      .then((data) => {
        if (!mounted) return
        const list = Array.isArray(data?.donations) ? data.donations : []
        setAllDonations(list)
        setDonations(list)
        setLoading(false)
      })
      .catch((err) => {
        if (!mounted) return
        setError(err)
        setLoading(false)
      })
    return () => { mounted = false }
  }, [])

  function runSearch() {
    const q = String(query || '').trim()
    if (!q) {
      setDonations(allDonations)
      return
    }
    const qLower = q.toLowerCase()
    const phoneDigits = q.replace(/\D/g, '')
    const filtered = (allDonations || []).filter((d) => {
      const first = String(d.donor?.firstName || '').toLowerCase()
      const last = String(d.donor?.lastName || '').toLowerCase()
      const email = String(d.donor?.email || '').toLowerCase()
      const id = String(d.id || '').toLowerCase()
      const phone = String(d.donor?.phone || '').replace(/\D/g, '')
      return (
        first.includes(qLower) ||
        last.includes(qLower) ||
        email.includes(qLower) ||
        id.includes(qLower) ||
        (phoneDigits && phone.includes(phoneDigits))
      )
    })
    setDonations(filtered)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-800" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Donations</h1>
          <p className="text-base text-gray-600 mt-2" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Search, filter, and manage all donations</p>
        </div>
        <Link href="/donations/new">
          <button className="px-6 py-3 rounded-lg text-white font-medium shadow-sm" style={{backgroundColor: '#5B9FDF', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>
            <Plus className="inline mr-2 h-4 w-4" />
            Log Donation
          </button>
        </Link>
      </div>

      <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
        <div className="flex gap-4 items-center">
          <input
            value={query}
            onChange={(e) => {
              const v = e.target.value
              setQuery(v)
              if (String(v || '').trim() === '') {
                setDonations(allDonations)
              }
            }}
            onKeyDown={(e) => { if (e.key === 'Enter') runSearch() }}
            placeholder="Search by name, email, ID, or phone number..."
            className="flex-1 border border-gray-200 rounded-lg px-4 py-3 bg-white text-gray-800"
            style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}
          />
          <button className="px-6 py-3 text-white rounded-lg font-medium" style={{backgroundColor: '#5B9FDF', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}} onClick={() => runSearch()}>🔍 Search</button>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <button className="px-4 py-2 rounded-lg text-white font-medium" style={{backgroundColor: filter === 'all' ? '#5B9FDF' : '#E5E7EB', color: filter === 'all' ? 'white' : '#6B7280', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}} onClick={() => setFilter('all')}>All Donations</button>
          <button className="px-4 py-2 rounded-lg text-white font-medium" style={{backgroundColor: filter === 'online' ? '#5B9FDF' : '#E5E7EB', color: filter === 'online' ? 'white' : '#6B7280', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}} onClick={() => setFilter('online')}>Online</button>
          <button className="px-4 py-2 rounded-lg text-white font-medium" style={{backgroundColor: filter === 'offline' ? '#5B9FDF' : '#E5E7EB', color: filter === 'offline' ? 'white' : '#6B7280', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}} onClick={() => setFilter('offline')}>Offline</button>
          <button className="px-4 py-2 rounded-lg text-white font-medium" style={{backgroundColor: filter === 'recurring' ? '#5B9FDF' : '#E5E7EB', color: filter === 'recurring' ? 'white' : '#6B7280', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}} onClick={() => setFilter('recurring')}>Recurring</button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-800" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>{totalCount}</div>
            <div className="text-sm text-gray-600 uppercase" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>TOTAL DONATIONS</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-800" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>${totalAmount.toLocaleString()}</div>
            <div className="text-sm text-gray-600 uppercase" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>TOTAL AMOUNT</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-800" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>{onlineCount}</div>
            <div className="text-sm text-gray-600 uppercase" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>ONLINE</div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-800" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Recent Donations</h2>
        </div>

        <div className="space-y-3">
          {loading && <div className="text-sm text-gray-600" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Loading donations…</div>}
          {error && <div className="text-sm text-red-600" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Failed to load donations</div>}
          {!loading && !donations.length && <div className="text-sm text-gray-600" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>No donations recorded.</div>}
          {!loading && donations.map((d) => (
            <div key={d.id} className="p-4 border border-gray-200 rounded-lg flex justify-between items-center">
              <div>
                <div className="font-medium text-gray-800" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>{d.donor?.firstName} {d.donor?.lastName} <span className="text-sm text-gray-600">• {d.campaign?.name ?? 'General'}</span></div>
                {d.notes && <div className="text-sm text-gray-600" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>{d.notes}</div>}
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-800" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>${(d.amount ?? 0).toFixed(2)}</div>
                <div className="text-sm text-gray-600" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>{d.date ? new Date(d.date).toLocaleDateString() : new Date(d.createdAt).toLocaleDateString()}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}