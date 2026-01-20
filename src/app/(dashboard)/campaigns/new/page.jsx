 'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

const campaignSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional().or(z.literal('')),
  goal: z.number().optional(),
  startDate: z.string().optional().or(z.literal('')),
  endDate: z.string().optional().or(z.literal('')),
})

export default function NewCampaignPage() {
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState(null)
  const router = useRouter()

  const { register, handleSubmit, formState: { errors }, reset } = useForm({ resolver: zodResolver(campaignSchema) })

  async function onSubmit(values) {
    setMessage(null)
    setSubmitting(true)
    try {
      const payload = {
        name: values.name,
        description: values.description || null,
        goal: values.goal ? Number(values.goal) : null,
        startDate: values.startDate || null,
        endDate: values.endDate || null,
      }

      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'same-origin',
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        setMessage({ type: 'error', text: err?.error || `Failed to create campaign (${res.status})` })
        setSubmitting(false)
        return
      }

      setMessage({ type: 'success', text: 'Campaign created.' })
      reset()
      setTimeout(() => router.push('/campaigns'), 700)
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e)
      setMessage({ type: 'error', text: 'Unexpected error creating campaign.' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">New Campaign</h1>
        <p className="text-gray-600 mt-2">Create a fundraising campaign</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-lg">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input className="mt-1 block w-full rounded border px-3 py-2" {...register('name')} aria-invalid={errors.name ? 'true' : 'false'} />
          {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea className="mt-1 block w-full rounded border px-3 py-2" rows={3} {...register('description')} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Goal (USD)</label>
          <input type="number" className="mt-1 block w-full rounded border px-3 py-2" {...register('goal', { valueAsNumber: true })} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Start Date</label>
            <input type="date" className="mt-1 block w-full rounded border px-3 py-2" {...register('startDate')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">End Date</label>
            <input type="date" className="mt-1 block w-full rounded border px-3 py-2" {...register('endDate')} />
          </div>
        </div>

        <div>
          <Button type="submit" disabled={submitting} className="inline-flex items-center px-4 py-2">
            {submitting ? 'Creating...' : 'Create Campaign'}
          </Button>
        </div>
      </form>

      {message && <div className={`text-sm ${message.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>{message.text}</div>}
    </div>
  )
}
