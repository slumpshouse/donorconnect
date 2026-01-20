/**
 * Segment Form Component
 * TODO: Implement form for creating/editing donor segments
 */

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'

const segmentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional().or(z.literal('')),
})

export function SegmentForm({ segment = {}, onSubmit, onCancel }) {
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(segmentSchema),
    defaultValues: {
      name: segment.name || '',
      description: segment.description || '',
    },
  })

  async function handleForm(values) {
    setSubmitting(true)
    try {
      if (onSubmit) await onSubmit(values)
      reset()
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('SegmentForm submit error', e)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(handleForm)} className="space-y-4 max-w-lg">
      <div>
        <label className="block text-sm font-medium text-gray-700">Segment Name</label>
        <input
          className="mt-1 block w-full rounded border px-3 py-2"
          {...register('name')}
          aria-invalid={errors.name ? 'true' : 'false'}
          placeholder="e.g. Recent Donors"
        />
        {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description (optional)</label>
        <textarea className="mt-1 block w-full rounded border px-3 py-2" rows={3} {...register('description')} />
        {errors.description && <p className="text-sm text-red-600">{errors.description.message}</p>}
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Save Segment'}</Button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="px-3 py-2 border rounded bg-white">Cancel</button>
        )}
      </div>
    </form>
  )
}

// TODO: Example usage:
// <SegmentForm 
//   segment={editingSegment} 
//   onSubmit={handleCreateSegment}
//   onCancel={() => setShowForm(false)}
// />