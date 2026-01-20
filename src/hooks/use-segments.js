import { useState, useEffect } from 'react'

export function useSegments(page = 1, limit = 20, filters = {}) {
  const [segments, setSegments] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({ page, limit, total: 0 })

  async function fetchSegments(signal) {
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

      const res = await fetch(`/api/segments?${params.toString()}`, { credentials: 'same-origin', signal })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error || `Failed to load segments (${res.status})`)
      }

      const payload = await res.json()
      setSegments(payload.segments || [])
      setPagination(payload.pagination || { page, limit, total: 0 })
    } catch (e) {
      if (e.name !== 'AbortError') setError(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const controller = new AbortController()
    fetchSegments(controller.signal)
    return () => controller.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, JSON.stringify(filters)])

  return { segments, loading, error, pagination, refetch: () => fetchSegments() }
}

export function useSegment(id) {
  const [segment, setSegment] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/segments/${id}`, { credentials: 'same-origin' })
        if (!res.ok) throw new Error(`Failed to load segment (${res.status})`)
        const payload = await res.json()
        if (!cancelled) setSegment(payload.segment || null)
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
  }, [id])

  return { segment, loading, error }
}
// React hook for segment data management
// TODO: Implement useSegments hook