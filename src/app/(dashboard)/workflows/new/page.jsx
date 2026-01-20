 'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

const workflowSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional().or(z.literal('')),
  trigger: z.enum(['FIRST_DONATION','DONATION_RECEIVED','INACTIVITY_THRESHOLD','SEGMENT_ENTRY','MANUAL','SCHEDULED']).optional(),
  segmentId: z.string().optional().or(z.literal('')),
  isActive: z.boolean().optional(),
})

export default function NewWorkflowPage() {
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState(null)
  const router = useRouter()

  const { register, handleSubmit, formState: { errors }, reset } = useForm({ resolver: zodResolver(workflowSchema) })

  const [steps, setSteps] = useState([])
  const [newAction, setNewAction] = useState('sendEmail')
  const [newParam, setNewParam] = useState('')

  // Presets for common workflows
  const workflowPresets = [
    {
      id: 'thankyou',
      name: 'Donation Thank-you',
      values: { name: 'Donation Thank-you', trigger: 'DONATION_RECEIVED', description: 'Send an immediate thank-you email after a donation', isActive: true },
      steps: [{ action: 'sendEmail', templateId: 'thankyou_template' }],
    },
    {
      id: 'new_donor_followup',
      name: 'New Donor Follow-up',
      values: { name: 'New Donor Follow-up', trigger: 'FIRST_DONATION', description: 'Create a follow-up task for new donors', isActive: true },
      steps: [{ action: 'createTask', title: 'Follow up with new donor' }],
    },
    {
      id: 'lapsed_reengage',
      name: 'Lapsed Donor Re-engagement',
      values: { name: 'Lapsed Donor Re-engagement', trigger: 'INACTIVITY_THRESHOLD', description: 'Re-engage donors who have not given recently', isActive: false },
      steps: [{ action: 'addToSegment', segmentId: 'reengage_segment' }, { action: 'sendEmail', templateId: 'reengage_template' }],
    },
  ]

  function applyWorkflowPreset(p) {
    reset({ name: p.values.name, trigger: p.values.trigger, description: p.values.description, segmentId: p.values.segmentId || '', isActive: !!p.values.isActive })
    setSteps(p.steps || [])
  }

  function addStep() {
    if (!newParam && newAction !== 'wait') return
    let step = { action: newAction }
    if (newAction === 'sendEmail') step.templateId = newParam
    if (newAction === 'createTask') step.title = newParam
    if (newAction === 'addToSegment') step.segmentId = newParam
    setSteps((s) => [...s, step])
    setNewParam('')
  }

  function removeStep(idx) {
    setSteps((s) => s.filter((_, i) => i !== idx))
  }

  async function onSubmit(values) {
    setMessage(null)
    setSubmitting(true)
    try {
      const payload = {
        name: values.name,
        description: values.description || null,
        trigger: values.trigger || 'MANUAL',
        segmentId: values.segmentId || null,
        steps: steps,
        isActive: !!values.isActive,
      }

      const res = await fetch('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'same-origin',
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        setMessage({ type: 'error', text: err?.error || `Failed to create workflow (${res.status})` })
        setSubmitting(false)
        return
      }

      setMessage({ type: 'success', text: 'Workflow created.' })
      reset()
      setTimeout(() => router.push('/workflows'), 700)
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e)
      setMessage({ type: 'error', text: 'Unexpected error creating workflow.' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">New Workflow</h1>
        <p className="text-gray-600 mt-2">Create an automation workflow</p>
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
          <label className="block text-sm font-medium text-gray-700">Trigger</label>
          <select className="mt-1 block w-full rounded border px-3 py-2" {...register('trigger')}>
            <option value="MANUAL">Manual</option>
            <option value="DONATION_RECEIVED">Donation received</option>
            <option value="FIRST_DONATION">First donation</option>
            <option value="INACTIVITY_THRESHOLD">Inactivity threshold</option>
            <option value="SEGMENT_ENTRY">Segment entry</option>
            <option value="SCHEDULED">Scheduled</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Segment ID (optional)</label>
          <input className="mt-1 block w-full rounded border px-3 py-2" placeholder="segment id" {...register('segmentId')} />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">Presets</label>
            <div className="flex gap-2">
              {workflowPresets.map((p) => (
                <button key={p.id} type="button" onClick={() => applyWorkflowPreset(p)} className="px-3 py-1 bg-gray-100 rounded text-sm">{p.name}</button>
              ))}
            </div>
          </div>

          <div className="mt-2">
            <label className="block text-sm font-medium text-gray-700">Steps</label>
            <p className="text-xs text-gray-400 mt-1">Add friendly, non-technical workflow steps.</p>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2 items-end">
            <div>
              <label className="text-xs text-gray-600">Action</label>
              <select className="mt-1 block w-full rounded border px-2 py-2" value={newAction} onChange={(e) => setNewAction(e.target.value)}>
                <option value="sendEmail">Send Email</option>
                <option value="createTask">Create Task</option>
                <option value="addToSegment">Add to Segment</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="text-xs text-gray-600">Parameter</label>
              <input className="mt-1 block w-full rounded border px-2 py-2" value={newParam} onChange={(e) => setNewParam(e.target.value)} placeholder={newAction === 'sendEmail' ? 'email template id' : newAction === 'createTask' ? 'task title' : 'segment id'} />
            </div>
          </div>

          <div className="mt-2">
            <button type="button" onClick={addStep} className="px-3 py-1 bg-indigo-600 text-white rounded text-sm">Add Step</button>
          </div>

          {steps.length > 0 && (
            <ul className="mt-3 space-y-2">
              {steps.map((s, i) => (
                <li key={i} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <div className="text-sm">
                    <span className="font-medium">{s.action}</span>
                    {s.templateId && <> — template: <span className="font-medium">{s.templateId}</span></>}
                    {s.title && <> — title: <span className="font-medium">{s.title}</span></>}
                    {s.segmentId && <> — segment: <span className="font-medium">{s.segmentId}</span></>}
                  </div>
                  <button type="button" onClick={() => removeStep(i)} className="text-sm text-red-600">Remove</button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex items-center gap-3">
          <input type="checkbox" {...register('isActive')} />
          <label className="text-sm text-gray-700">Activate workflow</label>
        </div>

        <div>
          <Button type="submit" disabled={submitting} className="inline-flex items-center px-4 py-2">
            {submitting ? 'Creating...' : 'Create Workflow'}
          </Button>
        </div>
      </form>

      {message && <div className={`text-sm ${message.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>{message.text}</div>}
    </div>
  )
}
