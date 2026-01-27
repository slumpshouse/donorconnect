'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'

const campaignSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional().or(z.literal('')),
  goal: z.number().optional(),
  startDate: z.string().optional().or(z.literal('')),
  endDate: z.string().optional().or(z.literal('')),
  status: z.enum(['DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED']).optional(),
})

export default function EditCampaignPage({ params }) {
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState(null)
  const [campaignId, setCampaignId] = useState(null)
  const router = useRouter()

  const { register, handleSubmit, formState: { errors }, reset } = useForm({ 
    resolver: zodResolver(campaignSchema) 
  })

  useEffect(() => {
    async function loadCampaign() {
      try {
        const resolvedParams = await Promise.resolve(params)
        const id = resolvedParams?.id
        setCampaignId(id)
        
        const res = await fetch(`/api/campaigns/${id}`, { credentials: 'same-origin' })
        if (!res.ok) throw new Error('Failed to load campaign')
        
        const data = await res.json()
        const campaign = data.campaign
        
        reset({
          name: campaign.name || '',
          description: campaign.description || '',
          goal: campaign.goal || '',
          startDate: campaign.startDate ? new Date(campaign.startDate).toISOString().split('T')[0] : '',
          endDate: campaign.endDate ? new Date(campaign.endDate).toISOString().split('T')[0] : '',
          status: campaign.status || 'DRAFT',
        })
        setLoading(false)
      } catch (e) {
        setMessage({ type: 'error', text: 'Failed to load campaign' })
        setLoading(false)
      }
    }
    loadCampaign()
  }, [params, reset])

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
        status: values.status || 'DRAFT',
      }

      const res = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'same-origin',
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        setMessage({ type: 'error', text: err?.error || `Failed to update campaign (${res.status})` })
        setSubmitting(false)
        return
      }

      setMessage({ type: 'success', text: 'Campaign updated.' })
      setTimeout(() => router.push(`/campaigns/${campaignId}`), 700)
    } catch (e) {
      console.error(e)
      setMessage({ type: 'error', text: 'Unexpected error updating campaign.' })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-gray-600" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Loading campaign...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-gray-800" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Edit Campaign</h1>
        <p className="text-base text-gray-600 mt-2" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Update campaign details</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-lg">
        <div>
          <label className="block text-sm font-medium text-gray-700" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Name</label>
          <input className="mt-1 block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-900" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}} {...register('name')} aria-invalid={errors.name ? 'true' : 'false'} />
          {errors.name && <p className="text-sm text-red-600" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Description</label>
          <textarea className="mt-1 block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-900" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}} rows={3} {...register('description')} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Goal (USD)</label>
          <input type="number" className="mt-1 block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-900" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}} {...register('goal', { valueAsNumber: true })} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Start Date</label>
            <input type="date" className="mt-1 block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-900" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}} {...register('startDate')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>End Date</label>
            <input type="date" className="mt-1 block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-900" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}} {...register('endDate')} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Status</label>
          <select className="mt-1 block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-900" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}} {...register('status')}>
            <option value="DRAFT">Draft</option>
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={submitting} className="inline-flex items-center px-6 py-3 rounded-lg text-white font-medium shadow-sm" style={{backgroundColor: '#5B9FDF', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>
            {submitting ? 'Updating...' : 'Update Campaign'}
          </button>
          <button type="button" onClick={() => router.push(`/campaigns/${campaignId}`)} className="inline-flex items-center px-6 py-3 rounded-lg font-medium border border-gray-200 bg-white text-gray-700" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>
            Cancel
          </button>
        </div>
      </form>

      {message && <div className={`text-sm ${message.type === 'error' ? 'text-red-600' : 'text-green-600'}`} style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>{message.text}</div>}
    </div>
  )
}
