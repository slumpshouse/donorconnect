 'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional().or(z.literal('')),
  donorId: z.string().optional().or(z.literal('')),
  assignedTo: z.string().optional().or(z.literal('')),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  dueDate: z.string().optional().or(z.literal('')),
})

export default function NewTaskPage() {
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState(null)
  const router = useRouter()

  const { register, handleSubmit, formState: { errors }, reset } = useForm({ resolver: zodResolver(taskSchema) })
  const [donors, setDonors] = useState([])
  const [admins, setAdmins] = useState([])

  async function onSubmit(values) {
    setMessage(null)
    setSubmitting(true)
    try {
      const payload = {
        title: values.title,
        description: values.description || null,
        donorId: values.donorId || null,
        assignedTo: values.assignedTo || null,
        priority: values.priority || 'MEDIUM',
        dueDate: values.dueDate || null,
      }

      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'same-origin',
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        setMessage({ type: 'error', text: err?.error || `Failed to create task (${res.status})` })
        setSubmitting(false)
        return
      }

      setMessage({ type: 'success', text: 'Task created.' })
      reset()
      setTimeout(() => router.push('/tasks'), 700)
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e)
      setMessage({ type: 'error', text: 'Unexpected error creating task.' })
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await fetch('/api/donors?limit=200', { credentials: 'same-origin' })
        if (!res.ok) return
        const data = await res.json().catch(() => ({}))
        if (mounted) setDonors(Array.isArray(data?.donors) ? data.donors : [])
      } catch (e) {
        // ignore
      }
    })()
    ;(async () => {
      try {
        const res = await fetch('/api/users/admins', { credentials: 'same-origin' })
        if (!res.ok) return
        const data = await res.json().catch(() => ({}))
        if (mounted) setAdmins(Array.isArray(data?.users) ? data.users : [])
      } catch (e) {
        // ignore
      }
    })()
    return () => { mounted = false }
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-gray-800" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>New Task</h1>
        <p className="text-base text-gray-600 mt-2" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Create a follow-up or engagement task</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-lg">
        <div>
          <label className="block text-sm font-medium text-gray-700" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Title</label>
          <input className="mt-1 block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-900" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}} {...register('title')} aria-invalid={errors.title ? 'true' : 'false'} />
          {errors.title && <p className="text-sm text-red-600">{errors.title.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Description</label>
          <textarea className="mt-1 block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-900" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}} rows={4} {...register('description')} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Donor (optional)</label>
          <select className="mt-1 block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-900" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}} {...register('donorId')}>
            <option value="">None</option>
            {donors.map((d) => (
              <option key={d.id} value={d.id}>{d.firstName} {d.lastName}{d.email ? ` — ${d.email}` : ''}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Assign to (optional)</label>
          <select className="mt-1 block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-900" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}} {...register('assignedTo')}>
            <option value="">Auto (assign to org admin)</option>
            {admins.map((u) => (
              <option key={u.id} value={u.id}>{u.firstName} {u.lastName}{u.email ? ` — ${u.email}` : ''}</option>
            ))}
            {/* Ensure Sarah Admin appears in the list if present by email fallback */}
            {!admins.find(a => a.email === 'admin@hopefoundation.org') && (
              <option value="admin@hopefoundation.org">Sarah Admin — admin@hopefoundation.org</option>
            )}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Priority</label>
          <select className="mt-1 block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-900" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}} {...register('priority')}>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Due Date</label>
          <input type="date" className="mt-1 block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-900" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}} {...register('dueDate')} />
        </div>

        <div>
          <button type="submit" disabled={submitting} className="inline-flex items-center px-6 py-3 rounded-lg text-white font-medium shadow-sm" style={{backgroundColor: '#5B9FDF', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>
            {submitting ? 'Creating...' : 'Create Task'}
          </button>
        </div>
      </form>

      {message && <div className={`text-sm ${message.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>{message.text}</div>}
    </div>
  )
}
