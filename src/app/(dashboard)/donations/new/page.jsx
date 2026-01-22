// New donation form page (styled)
"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function NewDonationPage() {
  const [donors, setDonors] = useState([])
  const [selectedDonor, setSelectedDonor] = useState(null)
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [method, setMethod] = useState('Credit Card')
  const [campaigns, setCampaigns] = useState([])
  const [campaign, setCampaign] = useState('')
  const [recurring, setRecurring] = useState(false)
  const [notes, setNotes] = useState('')
  const [sendEmail, setSendEmail] = useState(true)
  const [sendReceipt, setSendReceipt] = useState(true)
  const [createFollowUp, setCreateFollowUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await fetch('/api/donors')
        if (!mounted) return
        const data = await res.json().catch(() => ({}))
        const donorList = Array.isArray(data?.donors) ? data.donors : (data?.donors ?? [])
        setDonors(donorList)
        if (donorList.length) {
          setSelectedDonor(donorList[0])
        }
      } catch (e) {
        // ignore
      }
    })()

    ;(async () => {
      try {
        const res = await fetch('/api/campaigns')
        const data = await res.json().catch(() => ({}))
        const list = Array.isArray(data?.campaigns) ? data.campaigns : []
        setCampaigns(list)
        // Default to "General" (no campaign) unless user picks one.
        setCampaign('')
      } catch (e) {
        setCampaigns([])
      }
    })()

    return () => (mounted = false)
  }, [])

  const router = useRouter()

  async function handleSubmit(e) {
    e.preventDefault()
    setMessage(null)
    const parsedAmount = parseFloat(amount)
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setMessage({ type: 'error', text: 'Enter a valid amount greater than 0.' })
      return
    }

    setLoading(true)
    try {
      const payload = {
        donorId: selectedDonor?.id,
        amount: parsedAmount,
        date,
        method,
        campaign,
        recurring,
        notes,
      }

      const res = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'same-origin',
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        setMessage({ type: 'error', text: err?.error || `Failed to create donation (${res.status})` })
        setLoading(false)
        return
      }

      const created = await res.json().catch(() => null)
      setMessage({ type: 'success', text: 'Donation recorded.' })

      // trigger workflows if options selected
      if (sendEmail || sendReceipt || createFollowUp) {
        try {
          await fetch('/api/workflows', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              trigger: 'donation_logged',
              donation: created ?? payload,
              sendEmail,
              sendReceipt,
              createFollowUp,
            }),
            credentials: 'same-origin',
          })
        } catch (e) {
          // ignore workflow errors
        }
      }
      // redirect to donations list
      router.push('/donations')

      // reset (in case user navigates back)
      setAmount('')
      setNotes('')
      setRecurring(false)
    } catch (error) {
      setMessage({ type: 'error', text: 'Unexpected error. Check console.' })
      // eslint-disable-next-line no-console
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Log a Donation</h1>
        <p className="text-sm text-muted-foreground">Record a new donation and trigger thank-you workflow</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-card border border-border p-6 rounded-lg shadow">
        {/* Donor select + card */}
        <div>
          <label className="block text-sm font-medium text-muted-foreground">Donor *</label>
          <div className="mt-2">
            <select
              value={selectedDonor?.id || ''}
              onChange={(e) => setSelectedDonor(donors.find(d => d.id === e.target.value) || null)}
              className="dc-select-light-options w-full rounded-md border px-3 py-2 bg-background text-foreground"
              style={{ colorScheme: 'light' }}
            >
              {donors.map((d) => (
                <option key={d.id} value={d.id}>{d.firstName} {d.lastName} {d.email ? `(${d.email})` : ''}</option>
              ))}
            </select>
          </div>

          {selectedDonor && (
            <div className="mt-3 p-4 rounded border border-border bg-muted flex items-center gap-4">
              <div className="h-12 w-12 rounded-md bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-semibold">{(selectedDonor.firstName?.[0]||'').toUpperCase()}{(selectedDonor.lastName?.[0]||'').toUpperCase()}</div>
              <div>
                <div className="font-medium">{selectedDonor.firstName} {selectedDonor.lastName}</div>
                <div className="text-sm text-muted-foreground">{selectedDonor.email ? selectedDonor.email : 'No email'} • Total giving: ${selectedDonor.totalAmount?.toLocaleString?.() ?? '0'}</div>
              </div>
            </div>
          )}
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-muted-foreground">Donation Amount *</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-2 w-full rounded-md border px-4 py-3 text-lg bg-background text-foreground placeholder:text-muted-foreground"
            placeholder="0.00"
            required
          />
          <p className="text-xs text-muted-foreground mt-1">Enter the donation amount in USD</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground">Date Received *</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-2 w-full rounded-md border px-3 py-2 bg-background text-foreground" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground">Payment Method *</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="dc-select-light-options mt-2 w-full rounded-md border px-3 py-2 bg-background text-foreground"
              style={{ colorScheme: 'light' }}
            >
              <option>Credit Card</option>
              <option>Check</option>
              <option>Cash</option>
              <option>ACH</option>
              <option>Other</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground">Type of Donation</label>
          <div className="mt-2">
            <select
              value={campaign}
              onChange={(e) => setCampaign(e.target.value)}
              className="dc-select-light-options w-full rounded-md border px-3 py-2 bg-background text-foreground"
              style={{ colorScheme: 'light' }}
            >
              <option value="">General</option>
              {campaigns.map((c) => (
                <option key={c.id ?? c.name} value={c.id ?? c.name}>
                  {c.name ?? c.id}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground mt-1">Optional: Link this donation to a specific campaign</p>
          </div>
        </div>

        <div>
          <label className="inline-flex items-center p-3 border rounded">
            <input type="checkbox" checked={recurring} onChange={(e) => setRecurring(e.target.checked)} className="mr-3" />
            <div>
              <div className="font-medium">This is a recurring donation</div>
              <div className="text-sm text-muted-foreground">Donor has committed to regular giving</div>
            </div>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground">Notes</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-2 w-full rounded-md border px-3 py-2 h-28 bg-background text-foreground placeholder:text-muted-foreground" placeholder="Add any additional notes about this donation (optional)" />
        </div>

        <div className="p-4 rounded border border-border bg-muted">
          <div className="font-medium mb-2">Thank You Workflow</div>
          <label className="flex items-center gap-3"><input type="checkbox" checked={sendEmail} onChange={(e) => setSendEmail(e.target.checked)} /> <span>Send thank you email automatically</span></label>
          <label className="flex items-center gap-3 mt-2"><input type="checkbox" checked={sendReceipt} onChange={(e) => setSendReceipt(e.target.checked)} /> <span>Generate and email tax receipt</span></label>
          <label className="flex items-center gap-3 mt-2"><input type="checkbox" checked={createFollowUp} onChange={(e) => setCreateFollowUp(e.target.checked)} /> <span>Create follow-up task for personal call</span></label>
        </div>

        <div>
          <Button type="submit" className="w-full bg-gradient-to-r from-teal-700 to-emerald-600 text-white">
            {loading ? 'Saving...' : '💰  Log Donation & Send Thank You'}
          </Button>
        </div>

        {message && (
          <div className={`text-sm ${message.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>{message.text}</div>
        )}
      </form>
    </div>
  )
}
