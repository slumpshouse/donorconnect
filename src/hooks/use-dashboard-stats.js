"use client"
import { useEffect, useState } from 'react'

export default function useDashboardStats() {
  const [stats, setStats] = useState({ donations: { totalDonations: 0, totalAmount: 0, onlineCount: 0 }, tasks: { open: 0, dueToday: 0, overdue: 0, completedThisMonth: 0 } })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function fetchStats() {
    setLoading(true)
    try {
      const res = await fetch('/api/dashboard', { credentials: 'same-origin' })
      if (!res.ok) throw await res.json()
      const data = await res.json()
      setStats({ donations: data.donations || {}, tasks: data.tasks || {} })
      setError(null)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let mounted = true
    if (mounted) fetchStats()
    return () => { mounted = false }
  }, [])

  return { stats, loading, error, refetch: fetchStats }
}
