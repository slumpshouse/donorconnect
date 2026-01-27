"use client"

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

const schema = z.object({
  name: z.string().min(1),
  trigger: z.string().optional().or(z.literal('')),
  conditions: z.string().optional().or(z.literal('')),
  actions: z.string().optional().or(z.literal('')),
  isActive: z.boolean().optional(),
})

export default function EditWorkflowPage() {
  const params = useParams()
  const router = useRouter()
  const id = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : null

  const [loading, setLoading] = useState(true)
  const [workflow, setWorkflow] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState(null)

  const { register, handleSubmit, reset } = useForm({ resolver: zodResolver(schema) })

  useEffect(() => {
    let mounted = true
    if (!id) return
    async function load() {
      setLoading(true)
      try {
        const res = await fetch(`/api/workflows/${id}`, { credentials: 'same-origin' })
        if (!res.ok) {
          // not found or missing API - stop gracefully
          setWorkflow(null)
          return
        }
        const data = await res.json()
        if (!mounted) return
        setWorkflow(data.workflow || data)
        
        const wf = data.workflow || data
        const steps = wf.steps || {}
        const conditionsArray = steps.conditions || []
        const actionsArray = steps.actions || []
        
        reset({
          name: wf.name || '',
          trigger: wf.trigger || '',
          conditions: Array.isArray(conditionsArray) ? conditionsArray.join('\n') : '',
          actions: Array.isArray(actionsArray) ? actionsArray.join('\n') : '',
          isActive: wf.isActive ?? true,
        })
      } catch (e) {
        console.error(e)
        setMessage({ type: 'error', text: 'Failed to load workflow' })
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [id, reset])

  async function onSubmit(values) {
    setSubmitting(true)
    setMessage(null)
    try {
      const res = await fetch(`/api/workflows/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
        credentials: 'same-origin',
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error || `Failed to update (${res.status})`)
      }
      setMessage({ type: 'success', text: 'Workflow updated.' })
      setTimeout(() => router.push('/workflows'), 700)
    } catch (e) {
      console.error(e)
      setMessage({ type: 'error', text: String(e?.message || 'Update failed') })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-gray-800" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Edit Workflow</h1>
        <p className="text-base text-gray-600 mt-2" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Edit workflow configuration</p>
      </div>

      <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm max-w-2xl">
        {loading && <div style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Loading...</div>}
        {!loading && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Name</label>
              <input className="block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-900" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}} {...register('name')} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Trigger</label>
              <input className="block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-900" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}} {...register('trigger')} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Conditions <span className="text-gray-500">(one per line)</span></label>
              <textarea rows={4} className="block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-900" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}} {...register('conditions')} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Actions <span className="text-gray-500">(one per line)</span></label>
              <textarea rows={4} className="block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-900" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}} {...register('actions')} />
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" {...register('isActive')} />
                <span className="text-sm text-gray-700" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Active</span>
              </label>
            </div>

            <div className="flex items-center gap-3">
              <button type="submit" disabled={submitting} className="px-6 py-3 rounded-lg text-white font-medium shadow-sm" style={{backgroundColor: '#5B9FDF', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>{submitting ? 'Saving...' : 'Save'}</button>
              <button type="button" onClick={() => router.push('/workflows')} className="px-6 py-3 rounded-lg bg-gray-100 text-gray-700 font-medium" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Cancel</button>
            </div>

            {message && <div className={`text-sm ${message.type === 'error' ? 'text-red-600' : 'text-green-600'}`} style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>{message.text}</div>}
          </form>
        )}
        {!loading && !workflow && <div className="text-yellow-600">Workflow API or resource not available.</div>}
      </div>
    </div>
  )
}
