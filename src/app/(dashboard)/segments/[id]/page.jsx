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

  const [showAdd, setShowAdd] = useState(false)
  const [availableDonors, setAvailableDonors] = useState([])
  const [availableLoading, setAvailableLoading] = useState(false)
  const [availableError, setAvailableError] = useState(null)
  const [selected, setSelected] = useState({})
  const [saving, setSaving] = useState(false)
  const [savingError, setSavingError] = useState(null)

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

  async function openAddDonors() {
    setShowAdd(true)
    setAvailableLoading(true)
    setAvailableError(null)
    setSavingError(null)
    setSelected({})
    try {
      const list = await loadAvailableDonors(segmentId, donors)
      setAvailableDonors(list)
    } catch (e) {
      setAvailableError(e)
    } finally {
      setAvailableLoading(false)
    }
  }

  async function saveSelected() {
    const donorIds = Object.keys(selected).filter((id) => selected[id])
    if (!donorIds.length) return

    setSaving(true)
    setSavingError(null)
    try {
      const res = await fetch(`/api/segments/${segmentId}/members`, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ donorIds }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error || `Failed to add donors (${res.status})`)
      }

      const { seg, list } = await loadSegment(segmentId)
      setSegment(seg)
      setDonors(list)
      setShowAdd(false)
      setSelected({})
    } catch (e) {
      setSavingError(e)
    } finally {
      setSaving(false)
    }
  }

  async function removeDonor(donorId) {
    const ok = window.confirm('Remove this donor from the segment?')
    if (!ok) return

    try {
      const res = await fetch(`/api/segments/${segmentId}/members/${donorId}`, {
        method: 'DELETE',
        credentials: 'same-origin',
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error || `Failed to remove donor (${res.status})`)
      }

      const { seg, list } = await loadSegment(segmentId)
      setSegment(seg)
      setDonors(list)
    } catch (e) {
      window.alert(String(e?.message || e))
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded shadow">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold">{segment?.name || 'Segment'}</h1>
            <p className="text-gray-600 mt-2">{segment?.description || ''}</p>
            <div className="text-sm text-gray-500 mt-2">
              Members: <span className="font-medium">{segment?.memberCount ?? donors.length ?? 0}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            
            <button
              type="button"
              onClick={openAddDonors}
              className="text-sm underline"
              disabled={!segmentId}
            >
              Add donors
            </button>
          </div>
        </div>
      </div>

      {showAdd && (
        <div className="bg-white p-6 rounded shadow">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Add donors</h2>
            <button type="button" className="text-sm underline" onClick={() => setShowAdd(false)} disabled={saving}>
              Close
            </button>
          </div>

          {availableLoading ? (
            <div className="py-4 text-gray-600">Loading donors…</div>
          ) : availableError ? (
            <div className="py-4 text-red-600">Error: {String(availableError.message || availableError)}</div>
          ) : availableDonors.length ? (
            <div className="mt-4 space-y-2">
              {availableDonors.map((d) => (
                <label key={d.id} className="flex items-center gap-3 p-3 border rounded">
                  <input
                    type="checkbox"
                    checked={Boolean(selected[d.id])}
                    onChange={(e) => setSelected((prev) => ({ ...prev, [d.id]: e.target.checked }))}
                    disabled={saving}
                  />
                  <div className="flex-1">
                    <div className="font-medium">{d.firstName} {d.lastName}</div>
                    <div className="text-sm text-gray-600">{d.email || 'No email'}</div>
                  </div>
                </label>
              ))}
            </div>
          ) : (
            <div className="py-4 text-gray-600">No available donors to add.</div>
          )}

          {savingError && (
            <div className="mt-4 text-red-600">Error: {String(savingError.message || savingError)}</div>
          )}

          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              className="px-3 py-2 border rounded"
              onClick={saveSelected}
              disabled={saving || Object.keys(selected).filter((id) => selected[id]).length === 0}
            >
              {saving ? 'Adding…' : 'Add selected'}
            </button>
            <button
              type="button"
              className="px-3 py-2 border rounded"
              onClick={() => setSelected({})}
              disabled={saving}
            >
              Clear
            </button>
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold">Donors in this segment</h2>

        {loading ? (
          <div className="py-6 text-gray-600">Loading donors…</div>
        ) : error ? (
          <div className="py-6 text-red-600">Error: {String(error.message || error)}</div>
        ) : donors.length ? (
          <div className="mt-4 space-y-2">
            {donors.map((d) => (
              <div key={d.id} className="p-3 border rounded flex items-center justify-between">
                <div>
                  <div className="font-medium">
                    <Link href={`/donors/${d.id}`} className="underline">{d.firstName} {d.lastName}</Link>
                  </div>
                  <div className="text-sm text-gray-600">{d.email || 'No email'}</div>
                  <div className="text-xs text-gray-500 mt-1">Risk: {d.retentionRisk || '—'} • Status: {d.status || '—'}</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Total</div>
                    <div className="font-semibold">${Number(d.totalAmount || 0).toLocaleString()}</div>
                    <div className="text-xs text-gray-500">Gifts: {d.totalGifts ?? 0}</div>
                  </div>
                  <button type="button" className="text-sm text-red-700 underline" onClick={() => removeDonor(d.id)}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-gray-600">No donors found in this segment.</div>
        )}
      </div>
    </div>
  )
}