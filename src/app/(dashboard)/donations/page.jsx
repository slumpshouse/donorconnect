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
      <div className="bg-gradient-to-r from-teal-700 to-emerald-600 p-8 rounded-lg text-white">
        <h1 className="text-4xl font-bold">Donation List</h1>
        <p className="mt-2 text-white/80">Search, filter, and manage all your donors</p>
      </div>

      <div className="bg-card border border-border p-6 rounded-xl shadow">
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
            className="flex-1 border rounded px-4 py-3 bg-background text-foreground placeholder:text-muted-foreground"
          />
          <button className="px-4 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded" onClick={() => runSearch()}>🔍 Search</button>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <button className={`px-4 py-2 rounded ${filter === 'all' ? 'bg-teal-600 text-white' : 'bg-muted'}`} onClick={() => setFilter('all')}>All Donations</button>
          <button className={`px-4 py-2 rounded ${filter === 'online' ? 'bg-teal-600 text-white' : 'bg-muted'}`} onClick={() => setFilter('online')}>Online</button>
          <button className={`px-4 py-2 rounded ${filter === 'offline' ? 'bg-teal-600 text-white' : 'bg-muted'}`} onClick={() => setFilter('offline')}>Offline</button>
          <button className={`px-4 py-2 rounded ${filter === 'recurring' ? 'bg-teal-600 text-white' : 'bg-muted'}`} onClick={() => setFilter('recurring')}>Recurring</button>
        </div>
      </div>

      <div className="bg-card border border-border p-6 rounded-xl shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold">{totalCount}</div>
            <div className="text-sm text-muted-foreground uppercase">TOTAL DONATIONS</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">${totalAmount.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground uppercase">TOTAL AMOUNT</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{onlineCount}</div>
            <div className="text-sm text-muted-foreground uppercase">ONLINE</div>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border p-6 rounded-xl shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Recent Donations</h2>
          <Link href="/donations/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Log Donation
            </Button>
          </Link>
        </div>

        <div className="space-y-3">
          {loading && <div className="text-sm text-muted-foreground">Loading donations…</div>}
          {error && <div className="text-sm text-red-600">Failed to load donations</div>}
          {!loading && !donations.length && <div className="text-sm text-muted-foreground">No donations recorded.</div>}
          {!loading && donations.map((d) => (
            <div key={d.id} className="p-4 border rounded flex justify-between items-center">
              <div>
                <div className="font-medium">{d.donor?.firstName} {d.donor?.lastName} <span className="text-sm text-muted-foreground">• {d.campaign?.name ?? 'General'}</span></div>
                {d.notes && <div className="text-sm text-muted-foreground">{d.notes}</div>}
              </div>
              <div className="text-right">
                <div className="font-semibold">${(d.amount ?? 0).toFixed(2)}</div>
                <div className="text-sm text-muted-foreground">{d.date ? new Date(d.date).toLocaleDateString() : new Date(d.createdAt).toLocaleDateString()}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}