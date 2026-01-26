"use client"

import { useEffect, useState } from 'react'
import { formatDate } from '@/lib/utils'
import { useForm } from 'react-hook-form'
import { useParams, useRouter } from 'next/navigation'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'

const editSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  state: z.string().optional().or(z.literal('')),
  zipCode: z.string().optional().or(z.literal('')),
  tags: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
  status: z.enum(['ACTIVE','LAPSED','INACTIVE','DO_NOT_CONTACT']).optional(),
})

export default function EditDonorPage() {
  const params = useParams()
  const router = useRouter()
  const donorId = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : null

  const [loading, setLoading] = useState(true)
  const [donor, setDonor] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(editSchema) })
  useEffect(() => {
    let mounted = true
    if (!donorId) return

    async function load() {
      setLoading(true)
      try {
        const res = await fetch(`/api/donors/${donorId}`, { credentials: 'same-origin' })
        if (!res.ok) throw new Error(`Failed to load donor (${res.status})`)
        const data = await res.json()
        if (!mounted) return
        setDonor(data)
        reset({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          city: data.city || '',
          state: data.state || '',
          zipCode: data.zipCode || '',
          tags: (data.tags && Array.isArray(data.tags) ? data.tags.join(', ') : data.tags) || '',
          notes: data.notes || '',
          status: data.status || 'ACTIVE',
        })
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e)
        setMessage({ type: 'error', text: String(e?.message || 'Failed to load donor') })
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => (mounted = false)
  }, [donorId, reset])

  async function onSubmit(values) {
    setSubmitting(true)
    setMessage(null)
    try {
      const payload = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email || null,
        phone: values.phone || null,
        address: values.address || null,
        city: values.city || null,
        state: values.state || null,
        zipCode: values.zipCode || null,
        status: values.status || undefined,
      }

      const res = await fetch(`/api/donors/${donorId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'same-origin',
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error || `Failed to update donor (${res.status})`)
      }

      const updated = await res.json().catch(() => null)
      setMessage({ type: 'success', text: 'Donor updated.' })
      setDonor(updated)
      // keep values in form
      setTimeout(() => router.push(`/donors/${donorId}`), 700)
      return updated
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e)
      setMessage({ type: 'error', text: String(e?.message || 'Update failed') })
    } finally {
      setSubmitting(false)
    }
  }

  if (!donorId) return <div className="text-red-600">No donor specified.</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Donor</h1>
        <p className="text-foreground mt-2">Modify donor details and save changes</p>
      </div>

      <div className="bg-card border border-border p-6 rounded">
        {loading && <div>Loading donor...</div>}

        {!loading && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-3xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground">First Name</label>
                <input className="mt-1 block w-full rounded border border-border bg-background px-3 py-2 text-foreground placeholder:text-foreground/70" {...register('firstName')} />
                {errors.firstName && <p className="text-sm text-red-600">{errors.firstName.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground">Last Name</label>
                <input className="mt-1 block w-full rounded border border-border bg-background px-3 py-2 text-foreground placeholder:text-foreground/70" {...register('lastName')} />
                {errors.lastName && <p className="text-sm text-red-600">{errors.lastName.message}</p>}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold">Contact Information</h2>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground">Email</label>
                  <input className="mt-1 block w-full rounded border border-border bg-background px-3 py-2 text-foreground placeholder:text-foreground/70" {...register('email')} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground">Phone</label>
                  <input
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={10}
                    onInput={(e) => { e.currentTarget.value = e.currentTarget.value.replace(/\D/g, '').slice(0, 10) }}
                    className="mt-1 block w-full rounded border border-border bg-background px-3 py-2 text-foreground placeholder:text-foreground/70"
                    {...register('phone')}
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-foreground">Address</label>
                <input className="mt-1 block w-full rounded border border-border bg-background px-3 py-2 text-foreground placeholder:text-foreground/70" {...register('address')} />
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground">City</label>
                  <input className="mt-1 block w-full rounded border border-border bg-background px-3 py-2 text-foreground placeholder:text-foreground/70" {...register('city')} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground">State</label>
                  <input className="mt-1 block w-full rounded border border-border bg-background px-3 py-2 text-foreground placeholder:text-foreground/70" {...register('state')} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground">ZIP Code</label>
                  <input className="mt-1 block w-full rounded border border-border bg-background px-3 py-2 text-foreground placeholder:text-foreground/70" {...register('zipCode')} />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold">Donation Information</h2>
              <div className="mt-4 grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground">Total Donations</label>
                  <input value={(donor?.totalGifts ?? 0).toString()} disabled className="mt-1 block w-full rounded border border-border bg-background px-3 py-2 text-foreground" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground">Last Donation</label>
                    <input value={donor?.lastGiftDate ? new Date(donor.lastGiftDate).toLocaleDateString() : ''} disabled className="mt-1 block w-full rounded border border-border bg-background px-3 py-2 text-foreground" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground">Donor Since</label>
                    <input value={donor?.createdAt ? new Date(donor.createdAt).toLocaleDateString() : ''} disabled className="mt-1 block w-full rounded border border-border bg-background px-3 py-2 text-foreground" />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold">Additional Information</h2>
              <div className="mt-4">
                <label className="block text-sm font-medium text-foreground">Tags</label>
                <input className="mt-1 block w-full rounded border border-border bg-background px-3 py-2 text-foreground placeholder:text-foreground/70" {...register('tags')} />
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-foreground">Status</label>
                <select className="mt-1 block w-full rounded border border-border bg-background px-3 py-2 text-foreground" {...register('status')}>
                  <option value="ACTIVE">Active</option>
                  <option value="LAPSED">Lapsed</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="DO_NOT_CONTACT">Do Not Contact</option>
                </select>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-foreground">Notes</label>
                <textarea rows={4} className="mt-1 block w-full rounded border border-border bg-background px-3 py-2 text-foreground placeholder:text-foreground/70" {...register('notes')} />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Save changes'}</Button>
              <Button type="button" variant="ghost" onClick={() => router.push(`/donors/${donorId}`)} disabled={submitting}>Cancel</Button>
            </div>

            {message && <div className={`text-sm ${message.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>{message.text}</div>}
          </form>
        )}
      </div>
    </div>
  )
}
