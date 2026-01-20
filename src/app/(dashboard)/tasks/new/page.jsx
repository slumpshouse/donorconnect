 'use client'

import { useState } from 'react'
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">New Task</h1>
        <p className="text-gray-600 mt-2">Create a follow-up or engagement task</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-lg">
        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input className="mt-1 block w-full rounded border px-3 py-2" {...register('title')} aria-invalid={errors.title ? 'true' : 'false'} />
          {errors.title && <p className="text-sm text-red-600">{errors.title.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea className="mt-1 block w-full rounded border px-3 py-2" rows={4} {...register('description')} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Donor ID (optional)</label>
          <input className="mt-1 block w-full rounded border px-3 py-2" placeholder="donor id" {...register('donorId')} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Assign to (user id, optional)</label>
          <input className="mt-1 block w-full rounded border px-3 py-2" placeholder="user id" {...register('assignedTo')} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Priority</label>
          <select className="mt-1 block w-full rounded border px-3 py-2" {...register('priority')}>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Due Date</label>
          <input type="date" className="mt-1 block w-full rounded border px-3 py-2" {...register('dueDate')} />
        </div>

        <div>
          <Button type="submit" disabled={submitting} className="inline-flex items-center px-4 py-2">
            {submitting ? 'Creating...' : 'Create Task'}
          </Button>
        </div>
      </form>

      {message && <div className={`text-sm ${message.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>{message.text}</div>}
    </div>
  )
}
