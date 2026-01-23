'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'

const campaignDonorSchema = z.object({
  // donor
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  preferred: z.enum(['email', 'sms', 'both']).optional(),
  tags: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),

  // optional initial donation (campaign-linked)
  logDonation: z.boolean().optional(),
  amount: z.string().optional().or(z.literal('')),
  date: z.string().optional().or(z.literal('')),
  method: z.string().optional().or(z.literal('')),
  donationNotes: z.string().optional().or(z.literal('')),
})

export default function CampaignAddDonorPage() {
  const params = useParams()
  const router = useRouter()
  const campaignId = useMemo(() => {
    const id = params?.id
    if (typeof id === 'string') return id
    if (Array.isArray(id)) return id[0]
    return null
  }, [params])

  const [campaign, setCampaign] = useState(null)
  const [loadingCampaign, setLoadingCampaign] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(campaignDonorSchema),
    defaultValues: {
      logDonation: true,
      date: new Date().toISOString().slice(0, 10),
      method: 'Credit Card',
    },
  })

  const logDonation = Boolean(watch('logDonation'))

  useEffect(() => {
    let mounted = true
    if (!campaignId) return

    setLoadingCampaign(true)
    ;(async () => {
      try {
        const res = await fetch(`/api/campaigns/${campaignId}`, { credentials: 'same-origin' })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data?.error || 'Failed to load campaign')
        if (mounted) setCampaign(data?.campaign || null)
      } catch (e) {
        if (mounted) setCampaign(null)
      } finally {
        if (mounted) setLoadingCampaign(false)
      }
    })()

    return () => {
      mounted = false
    }
  }, [campaignId])

  async function onSubmit(values) {
    if (!campaignId) return

    setMessage(null)
    setSubmitting(true)

    try {
      // 1) Create donor
      const donorRes = await fetch('/api/donors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email || null,
          phone: values.phone || null,
          preferred: values.preferred || null,
          tags: values.tags || null,
          notes: values.notes || null,
        }),
      })

      const donorJson = await donorRes.json().catch(() => ({}))
      if (!donorRes.ok) throw new Error(donorJson?.error || `Failed to create donor (${donorRes.status})`)

      const donor = donorJson?.donor
      if (!donor?.id) throw new Error('Donor created, but no donor id returned')

      // notify other parts of the app so the new donor shows up immediately
      try {
        window.dispatchEvent(new CustomEvent('donor:created', { detail: donor }))
      } catch (e) {
        // ignore
      }

      // 2) Optionally log the initial donation to this campaign
      if (values.logDonation) {
        const parsedAmount = Number(values.amount)
        if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
          throw new Error('Enter a valid donation amount greater than 0.')
        }

        const donationRes = await fetch('/api/donations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({
            donorId: donor.id,
            amount: parsedAmount,
            date: values.date || new Date().toISOString().slice(0, 10),
            method: values.method || 'Credit Card',
            campaign: campaignId,
            recurring: false,
            notes: values.donationNotes || null,
          }),
        })

        const donationJson = await donationRes.json().catch(() => ({}))
        if (!donationRes.ok) {
          throw new Error(donationJson?.error || `Failed to log donation (${donationRes.status})`)
        }
      }

      setMessage({ type: 'success', text: 'Donor added to this campaign.' })
      setTimeout(() => router.push(`/campaigns/${campaignId}`), 700)
    } catch (e) {
      setMessage({ type: 'error', text: String(e?.message || e) })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Add donor to campaign</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {loadingCampaign ? 'Loading campaign…' : campaign ? `Campaign: ${campaign.name}` : 'Campaign not found.'}
          </p>
        </div>

        {campaignId && (
          <Link
            href={`/campaigns/${campaignId}`}
            className="inline-flex items-center justify-center rounded-md border border-border bg-muted px-3 py-2 text-sm font-medium text-foreground hover:bg-muted/80"
          >
            Back to campaign
          </Link>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-card border border-border p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground">First Name</label>
            <input
              className="mt-1 block w-full rounded border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground"
              {...register('firstName')}
              aria-invalid={errors.firstName ? 'true' : 'false'}
            />
            {errors.firstName && <p className="text-sm text-red-600">{errors.firstName.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground">Last Name</label>
            <input
              className="mt-1 block w-full rounded border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground"
              {...register('lastName')}
              aria-invalid={errors.lastName ? 'true' : 'false'}
            />
            {errors.lastName && <p className="text-sm text-red-600">{errors.lastName.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground">Email (optional)</label>
            <input className="mt-1 block w-full rounded border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground" {...register('email')} />
            {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground">Phone (optional)</label>
            <input className="mt-1 block w-full rounded border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground" {...register('phone')} />
            {errors.phone && <p className="text-sm text-red-600">{errors.phone.message}</p>}
          </div>
        </div>

        <fieldset>
          <legend className="text-sm font-medium text-foreground">Preferred Communication Channel</legend>
          <div className="mt-2 flex flex-wrap items-center gap-6">
            <label className="inline-flex items-center text-foreground">
              <input type="radio" value="email" {...register('preferred')} className="mr-2" />
              Email
            </label>
            <label className="inline-flex items-center text-foreground">
              <input type="radio" value="sms" {...register('preferred')} className="mr-2" />
              SMS
            </label>
            <label className="inline-flex items-center text-foreground">
              <input type="radio" value="both" {...register('preferred')} className="mr-2" />
              Both
            </label>
          </div>
        </fieldset>

        <div>
          <label className="block text-sm font-medium text-foreground">Tags (optional)</label>
          <input
            className="mt-1 block w-full rounded border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground"
            placeholder="First-time donor, Volunteer"
            {...register('tags')}
          />
          <p className="text-xs text-muted-foreground mt-1">Comma separated</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground">Notes (optional)</label>
          <textarea className="mt-1 block w-full rounded border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground" rows={3} {...register('notes')} />
        </div>

        <div className="rounded-lg border border-border bg-muted p-4">
          <label className="flex items-start gap-3">
            <input type="checkbox" {...register('logDonation')} className="mt-1" />
            <div>
              <div className="font-medium text-foreground">Log an initial donation for this campaign</div>
              <div className="text-sm text-muted-foreground">This will create a donation tied to the campaign so it shows up in campaign totals.</div>
            </div>
          </label>

          {logDonation && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground">Donation Amount *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="mt-1 block w-full rounded border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground"
                  placeholder="0.00"
                  {...register('amount')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground">Date Received</label>
                <input type="date" className="mt-1 block w-full rounded border border-border bg-background px-3 py-2 text-foreground" {...register('date')} />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground">Payment Method</label>
                <select className="mt-1 block w-full rounded border border-border bg-background px-3 py-2 text-foreground" {...register('method')}>
                  <option>Credit Card</option>
                  <option>Check</option>
                  <option>Cash</option>
                  <option>ACH</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground">Donation Notes (optional)</label>
                <textarea className="mt-1 block w-full rounded border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground" rows={2} {...register('donationNotes')} />
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={submitting || loadingCampaign || !campaignId} className="inline-flex items-center px-4 py-2">
            {submitting ? 'Saving…' : 'Add Donor'}
          </Button>

          {campaignId && (
            <Link href={`/donors/new`} className="text-sm text-muted-foreground hover:underline">
              Use the general donor form instead
            </Link>
          )}
        </div>

        {message && (
          <div className={`text-sm ${message.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>{message.text}</div>
        )}
      </form>
    </div>
  )
}
