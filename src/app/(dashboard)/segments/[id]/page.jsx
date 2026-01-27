"use client"

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

export default function SegmentDetailPage() {
  const params = useParams()
  const segmentId = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : null
  const [segment, setSegment] = useState(null)
  const [donors, setDonors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function loadSegment(currentSegmentId) {
    const res = await fetch(`/api/segments/${currentSegmentId}`, { credentials: 'same-origin' })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err?.error || `Failed to load segment (${res.status})`)
    }
    const payload = await res.json().catch(() => ({}))
    const seg = payload?.segment || null
    const list = Array.isArray(seg?.donors) ? seg.donors : []
    return { seg, list }
  }

  async function loadAvailableDonors(currentSegmentId, currentDonors) {
    const res = await fetch('/api/donors?limit=100', { credentials: 'same-origin' })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err?.error || `Failed to load donors (${res.status})`)
    }
    const payload = await res.json().catch(() => ({}))
    const all = Array.isArray(payload?.donors) ? payload.donors : []
    const existing = new Set((currentDonors || []).map((d) => d.id))
    return all.filter((d) => d?.id && !existing.has(d.id))
  }

  useEffect(() => {
    let mounted = true
    if (!segmentId) return

    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const { seg, list } = await loadSegment(segmentId)
        if (!mounted) return
        setSegment(seg)
        setDonors(list)
      } catch (e) {
        if (mounted) setError(e)
      } finally {
        if (mounted) setLoading(false)
      }
    })()

    return () => {
      mounted = false
    }
  }, [segmentId])

  if (!segmentId) return <div className="text-red-600">No segment specified.</div>

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/segments"
          className="inline-flex text-sm underline underline-offset-4 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          style={{color: '#5B9FDF', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}
        >
          ← Back to segments
        </Link>
      </div>
      <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>{segment?.name || 'Segment'}</h1>
            <p className="text-base text-gray-600 mt-2" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>{segment?.description || ''}</p>
            <div className="text-sm text-gray-600 mt-2" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>
              Members: <span className="font-medium">{segment?.memberCount ?? donors.length ?? 0}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
        <h2 className="text-xl font-semibold text-gray-800" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Donors in this segment</h2>

        {loading ? (
          <div className="py-6 text-gray-600" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Loading donors…</div>
        ) : error ? (
          <div className="py-6 text-red-600" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Error: {String(error.message || error)}</div>
        ) : donors.length ? (
          <div className="mt-4 space-y-2">
            {donors.map((d) => (
              <div key={d.id} className="p-3 border border-gray-200 rounded-lg flex items-center justify-between bg-white">
                <div>
                  <div className="font-medium text-gray-900" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>
                    <Link href={`/donors/${d.id}`} className="underline" style={{color: '#5B9FDF'}}>{d.firstName} {d.lastName}</Link>
                  </div>
                  <div className="text-sm text-gray-600" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>{d.email || 'No email'}</div>
                  <div className="text-xs text-gray-500 mt-1" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Risk: {d.retentionRisk || '—'} • Status: {d.status || '—'}</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm text-gray-600" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Total</div>
                    <div className="font-semibold text-gray-900" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>${Number(d.totalAmount || 0).toLocaleString()}</div>
                    <div className="text-xs text-gray-600" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Gifts: {d.totalGifts ?? 0}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-gray-600" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>No donors found in this segment.</div>
        )}
      </div>
    </div>
  )
}