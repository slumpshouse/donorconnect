"use client"

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

const schema = z.object({
  name: z.string().min(1),
  description: z.string().optional().or(z.literal('')),
  isActive: z.boolean().optional(),
  trigger: z.string().optional().or(z.literal('')),
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
        reset({
          name: data?.workflow?.name || data?.name || '',
          description: data?.workflow?.description || '',
          isActive: data?.workflow?.isActive ?? data?.isActive ?? true,
          trigger: data?.workflow?.trigger || '',
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
        <h1 className="text-3xl font-bold">Edit Workflow</h1>
        <p className="text-muted-foreground mt-2">Edit workflow configuration</p>
      </div>

      <div className="bg-card border border-border p-6 rounded max-w-2xl">
        {loading && <div>Loading...</div>}
        {!loading && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground">Name</label>
              <input className="mt-1 block w-full rounded border border-border px-3 py-2" {...register('name')} />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground">Description</label>
              <textarea rows={4} className="mt-1 block w-full rounded border border-border px-3 py-2" {...register('description')} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2">
                  <input type="checkbox" {...register('isActive')} />
                  <span className="text-sm">Active</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground">Trigger</label>
                <select className="mt-1 block w-full rounded border border-border px-2 py-2" {...register('trigger')}>
                  <option value="on_donation">On Donation</option>
                  <option value="on_signup">On Signup</option>
                  <option value="manual">Manual</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Save'}</Button>
              <Button type="button" variant="ghost" onClick={() => router.push('/workflows')}>Cancel</Button>
            </div>

            {message && <div className={`text-sm ${message.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>{message.text}</div>}
          </form>
        )}
        {!loading && !workflow && <div className="text-yellow-600">Workflow API or resource not available.</div>}
      </div>
    </div>
  )
}
