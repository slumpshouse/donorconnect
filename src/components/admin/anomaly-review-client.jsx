"use client"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'

export default function AnomalyReviewClient() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [visible, setVisible] = useState(false)
  const [isAdmin, setIsAdmin] = useState(null)
  const [processingId, setProcessingId] = useState(null)

  // Check session to ensure only admins see this UI
  useEffect(() => {
    let mounted = true
    async function checkSession() {
      try {
        const res = await fetch('/api/auth/session', { credentials: 'same-origin' })
        if (!mounted) return
        if (!res.ok) {
          setIsAdmin(false)
          return
        }
        const json = await res.json()
        const role = json?.user?.role
        setIsAdmin(role === 'ADMIN')
      } catch (e) {
        if (!mounted) return
        setIsAdmin(false)
      }
    }
    checkSession()
    return () => { mounted = false }
  }, [])

  // Only load anomalies if user is admin
  useEffect(() => {
    let mounted = true
    if (!isAdmin) {
      setLoading(false)
      return () => { mounted = false }
    }

    async function load() {
      setLoading(true)
      try {
        const res = await fetch('/api/anomalies')
        const json = await res.json()
        if (!mounted) return
        if (!res.ok) throw json
        setData(json.results)
      } catch (e) {
        setError(e)
      } finally {
        setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [isAdmin])

  // If we haven't determined admin status or user is not admin, hide the widget
  if (isAdmin === null) return null
  if (isAdmin === false) return null

  if (loading) return <div className="p-4">Loading suspicions…</div>
  if (error) return <div className="p-4 text-red-600">Error loading suspicions</div>

  // defensive: ensure data has expected shape
  const donorAnomalies = (data && data.donorAnomalies) ? data.donorAnomalies : []
  const donationAnomalies = (data && data.donationAnomalies) ? data.donationAnomalies : []

  // rely on app CSS for fonts

  function displayDonor(d) {
    // prefer full name, then email, then shortened id
    if (d.donorName) return d.donorName
    if (d.donorEmail) return d.donorEmail
    if (d.name) return d.name
    if (d.email) return d.email
    if (d.id) return `${d.id.slice(0, 8)}…`
    return 'Unknown donor'
  }

  async function handleDecision(entityType, id, decision) {
    setProcessingId(id)
    try {
      const res = await fetch('/api/anomalies/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entityType, id, decision }),
        credentials: 'same-origin'
      })
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json?.error || 'Request failed')
      }

      // remove the item locally from the lists
      setData((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          donorAnomalies: (prev.donorAnomalies || []).filter((x) => x.id !== id),
          donationAnomalies: (prev.donationAnomalies || []).filter((x) => x.id !== id),
        }
      })
    } catch (e) {
      // show minimal inline error
      // eslint-disable-next-line no-console
      console.error('review error', e)
      setError({ message: e.message || 'Failed to submit review' })
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="text-lg font-semibold">Information Review</div>
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="inline-flex items-center px-5 py-2 bg-blue-600 text-white rounded-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          {visible ? 'Hide Suspicions' : `Show Suspicions (${donorAnomalies.length + donationAnomalies.length})`}
        </button>
      </div>

      <div className="mb-4 text-sm text-gray-600">Donor suspicions: {donorAnomalies.length} — Donation suspicions: {donationAnomalies.length}</div>

      {visible ? (
        <>
          <div className="mb-4">
            <div className="font-medium mb-2">Donor suspicions</div>
            <ul className="mt-2 list-disc pl-5">
              {donorAnomalies.length ? donorAnomalies.map((d) => (
                <li key={d.id} className="text-sm text-gray-700 flex items-center justify-between">
                  <div>
                    <Link href={`/donors/${d.id}`} className="font-medium hover:underline">{d.name || d.email || `${d.id.slice(0,8)}…`}</Link>
                    {`: `}
                    <span className="text-gray-500">{d.issues.join(', ')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button disabled={processingId===d.id} onClick={() => handleDecision('donor', d.id, 'confirmed')} className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">Confirm</button>
                    <button disabled={processingId===d.id} onClick={() => handleDecision('donor', d.id, 'dismissed')} className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">Dismiss</button>
                  </div>
                </li>
              )) : <li className="text-sm text-gray-500">No donor suspicions found.</li>}
            </ul>
          </div>

          <div>
            <div className="font-medium mb-2">Donation suspicions</div>
            <ul className="mt-2 list-disc pl-5">
              {donationAnomalies.length ? donationAnomalies.map((d) => (
                <li key={d.id} className="text-sm text-gray-700 flex items-center justify-between">
                  <div>
                    <Link href={`/donors/${d.donorId}`} className="font-medium hover:underline">{displayDonor(d)}</Link>
                    {` — `}
                    <span className="text-gray-700">{typeof d.amount === 'number' ? d.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : d.amount}</span>
                    {` — `}
                    <span className="text-gray-500">{d.issues.map(i => i.replace(/_/g, ' ')).join(', ')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button disabled={processingId===d.id} onClick={() => handleDecision('donation', d.id, 'confirmed')} className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">Confirm</button>
                    <button disabled={processingId===d.id} onClick={() => handleDecision('donation', d.id, 'dismissed')} className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">Dismiss</button>
                  </div>
                </li>
              )) : <li className="text-sm text-gray-500">No donation suspicions found.</li>}
            </ul>
          </div>
        </>
      ) : (
        <div className="text-sm text-gray-500">Insights are hidden. Click the button to reveal suspicions.</div>
      )}
    </div>
  )
}
