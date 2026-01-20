"use client"
import { useEffect, useState } from 'react'

export default function useDashboardStats() {
  const [stats, setStats] = useState({ donations: { totalDonations: 0, totalAmount: 0, onlineCount: 0 }, tasks: { open: 0, dueToday: 0, overdue: 0, completedThisMonth: 0 } })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    fetch('/api/dashboard', { credentials: 'same-origin' })
      .then(async (res) => {
        if (!res.ok) throw await res.json()
        return res.json()
      })
      .then((data) => {
        if (!mounted) return
        setStats({ donations: data.donations || {}, tasks: data.tasks || {} })
        setLoading(false)
      })
      .catch((err) => {
        if (!mounted) return
        setError(err)
        setLoading(false)
      })
    return () => { mounted = false }
  }, [])

  return { stats, loading, error }
}
