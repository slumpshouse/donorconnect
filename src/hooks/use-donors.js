// React hook for donor data management
import { useState, useEffect } from 'react'

/**
 * TODO: Hook to fetch and manage donors list
 * @param {number} page - Page number for pagination
 * @param {number} limit - Items per page
 * @param {Object} filters - Search and filter options
 * @returns {Object} { donors, loading, error, refetch }
 */
export function useDonors(page = 1, limit = 20, filters = {}) {
  const [donors, setDonors] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({ page, limit, total: 0 })

  async function fetchDonors(signal) {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('limit', String(limit))
      Object.keys(filters || {}).forEach((k) => {
        if (filters[k] !== undefined && filters[k] !== null && String(filters[k]) !== '') {
          params.set(k, String(filters[k]))
        }
      })

      const res = await fetch(`/api/donors?${params.toString()}`, { credentials: 'same-origin', signal })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error || `Failed to load donors (${res.status})`)
      }

      const payload = await res.json()
      setDonors(payload.donors || [])
      setPagination(payload.pagination || { page, limit, total: 0 })
    } catch (e) {
      if (e.name !== 'AbortError') setError(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const controller = new AbortController()
    fetchDonors(controller.signal)
    return () => controller.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, JSON.stringify(filters)])

  return {
    donors,
    loading,
    error,
    pagination,
    refetch: () => fetchDonors(),
  }
}

/**
 * TODO: Hook to fetch single donor
 * @param {string} donorId - Donor ID
 * @returns {Object} { donor, loading, error, refetch }
 */
export function useDonor(donorId) {
  const [donor, setDonor] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!donorId) return
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/donors/${donorId}`, { credentials: 'same-origin' })
        if (!res.ok) throw new Error(`Failed to load donor (${res.status})`)
        const payload = await res.json()
        if (!cancelled) setDonor(payload || null)
      } catch (e) {
        if (!cancelled) setError(e)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [donorId])

  return { donor, loading, error, refetch: () => {} }
}