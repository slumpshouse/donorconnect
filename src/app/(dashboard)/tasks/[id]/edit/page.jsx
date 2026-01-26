"use client"

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

const schema = z.object({
  title: z.string().min(1),
  description: z.string().optional().or(z.literal('')),
  donorId: z.string().optional().or(z.literal('')),
  assignedTo: z.string().optional().or(z.literal('')),
  priority: z.enum(['LOW','MEDIUM','HIGH','URGENT']).optional(),
  dueDate: z.string().optional().or(z.literal('')),
  status: z.enum(['TODO','IN_PROGRESS','COMPLETED','CANCELLED']).optional(),
})

export default function EditTaskPage() {
  const params = useParams()
  const router = useRouter()
  const taskId = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : null

  const [loading, setLoading] = useState(true)
  const [task, setTask] = useState(null)
  const [donors, setDonors] = useState([])
  const [admins, setAdmins] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(schema) })

  useEffect(() => {
    let mounted = true
    if (!taskId) return

    async function load() {
      setLoading(true)
      try {
        // fetch task list and find task
        const res = await fetch('/api/tasks', { credentials: 'same-origin' })
        if (!res.ok) throw new Error('Failed to load tasks')
        const data = await res.json().catch(() => ({}))
        const list = Array.isArray(data?.tasks) ? data.tasks : []
        const found = list.find((t) => t.id === taskId)
        if (!mounted) return
        setTask(found || null)
        // fetch donors and admins for selects
        const [donRes, adminRes] = await Promise.all([
          fetch('/api/donors?limit=200', { credentials: 'same-origin' }),
          fetch('/api/users/admins', { credentials: 'same-origin' }),
        ])
        const donorsData = await (donRes.ok ? donRes.json().catch(() => ({})) : Promise.resolve({ donors: [] }))
        const adminsData = await (adminRes.ok ? adminRes.json().catch(() => ({})) : Promise.resolve({ users: [] }))
        if (mounted) {
          setDonors(Array.isArray(donorsData?.donors) ? donorsData.donors : [])
          setAdmins(Array.isArray(adminsData?.users) ? adminsData.users : [])
        }

        reset({
          title: found?.title || '',
          description: found?.description || '',
          donorId: found?.donorId || '',
          assignedTo: found?.assignedTo || '',
          priority: found?.priority || 'MEDIUM',
          dueDate: found?.dueDate ? new Date(found.dueDate).toISOString().slice(0,10) : '',
          status: found?.status || 'TODO',
        })
      } catch (e) {
        console.error(e)
        setMessage({ type: 'error', text: String(e?.message || 'Failed to load') })
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => { mounted = false }
  }, [taskId, reset])

  async function onSubmit(values) {
    setSubmitting(true)
    setMessage(null)
    try {
      const payload = {
        title: values.title,
        description: values.description || null,
        donorId: values.donorId || null,
        assignedTo: values.assignedTo || null,
        priority: values.priority || 'MEDIUM',
        dueDate: values.dueDate || null,
        status: values.status || 'TODO',
      }
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'same-origin',
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error || `Failed to update (${res.status})`)
      }
      const json = await res.json().catch(() => ({}))
      setMessage({ type: 'success', text: 'Task updated.' })
      setTimeout(() => router.push('/tasks'), 700)
      return json
    } catch (e) {
      console.error(e)
      setMessage({ type: 'error', text: String(e?.message || 'Update failed') })
    } finally {
      setSubmitting(false)
    }
  }

  if (!taskId) return <div className="text-red-600">No task specified.</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Task</h1>
        <p className="text-muted-foreground mt-2">Modify task details and save changes</p>
      </div>

      <div className="bg-card border border-border p-6 rounded">
        {loading && <div>Loading...</div>}
        {!loading && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-sm font-medium text-foreground">Title</label>
              <input className="mt-1 block w-full rounded border border-border px-3 py-2" {...register('title')} />
              {errors.title && <p className="text-sm text-red-600">{errors.title.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground">Description</label>
              <textarea rows={4} className="mt-1 block w-full rounded border border-border px-3 py-2" {...register('description')} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground">Donor (optional)</label>
                <select className="mt-1 block w-full rounded border border-border px-2 py-2" {...register('donorId')}>
                  <option value="">None</option>
                  {donors.map((d) => (<option key={d.id} value={d.id}>{d.firstName} {d.lastName}</option>))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground">Assign to (optional)</label>
                <select className="mt-1 block w-full rounded border border-border px-2 py-2" {...register('assignedTo')}>
                  <option value="">Auto</option>
                  {admins.map((u) => (<option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground">Priority</label>
                <select className="mt-1 block w-full rounded border border-border px-2 py-2" {...register('priority')}>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground">Due Date</label>
                <input type="date" className="mt-1 block w-full rounded border border-border px-2 py-2" {...register('dueDate')} />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground">Status</label>
                <select className="mt-1 block w-full rounded border border-border px-2 py-2" {...register('status')}>
                  <option value="TODO">TODO</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Save changes'}</Button>
              <Button type="button" variant="ghost" onClick={() => router.push('/tasks')}>Cancel</Button>
            </div>

            {message && <div className={`text-sm ${message.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>{message.text}</div>}
          </form>
        )}
      </div>
    </div>
  )
}
