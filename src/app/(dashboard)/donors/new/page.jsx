 'use client'

// New donor form page
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

const donorSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  preferred: z.enum(['email', 'sms', 'both']).optional(),
  tags: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
})

export default function NewDonorPage() {
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({ resolver: zodResolver(donorSchema) })

  const router = useRouter()

  async function onSubmit(values) {
    setMessage(null)
    setSubmitting(true)
    try {
      const payload = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email || null,
        phone: values.phone || null,
        preferred: values.preferred || null,
        tags: values.tags || null,
        notes: values.notes || null,
      }

      const res = await fetch('/api/donors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'same-origin',
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        setMessage({ type: 'error', text: err?.error || `Failed to create donor (${res.status})` })
        setSubmitting(false)
        return
      }

      const created = await res.json().catch(() => null)
      setMessage({ type: 'success', text: 'Donor created successfully.' })
      reset()
      // show success message briefly then navigate to dashboard
      setTimeout(() => router.push('/dashboard'), 900)
      return created
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e)
      setMessage({ type: 'error', text: 'Unexpected error creating donor.' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      
      <div>
        <h1 className="text-3xl font-bold">Add New Donor</h1>
        <p className="text-foreground mt-2">Create a new donor profile</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground">First Name</label>
            <input
              className="mt-1 block w-full rounded border border-border bg-background px-3 py-2 text-foreground placeholder:text-foreground/70"
              {...register('firstName')}
              aria-invalid={errors.firstName ? 'true' : 'false'}
            />
            {errors.firstName && <p className="text-sm text-red-600">{errors.firstName.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground">Last Name</label>
            <input
              className="mt-1 block w-full rounded border border-border bg-background px-3 py-2 text-foreground placeholder:text-foreground/70"
              {...register('lastName')}
              aria-invalid={errors.lastName ? 'true' : 'false'}
            />
            {errors.lastName && <p className="text-sm text-red-600">{errors.lastName.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground">Email Address</label>
          <input className="mt-1 block w-full rounded border border-border bg-background px-3 py-2 text-foreground placeholder:text-foreground/70" {...register('email')} />
          {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground">Phone Number</label>
          <input className="mt-1 block w-full rounded border border-border bg-background px-3 py-2 text-foreground placeholder:text-foreground/70" {...register('phone')} />
          {errors.phone && <p className="text-sm text-red-600">{errors.phone.message}</p>}
        </div>

        <fieldset className="mt-2">
          <legend className="text-sm font-medium text-foreground">Preferred Communication Channel</legend>
          <div className="mt-2 flex items-center gap-6">
            <label className="inline-flex items-center text-foreground">
              <input type="radio" value="email" {...register('preferred')} className="mr-2" />
              Email
            </label>
            <label className="inline-flex items-center text-foreground">
              <input type="radio" value="sms" {...register('preferred')} className="mr-2" />
              SMS
            </label>
            <label className="inline-flex items-center text-foreground">
              <input type="radio" value="both" {...register('preferred')} className="mr-2" />
              Both
            </label>
          </div>
        </fieldset>

        <div>
          <label className="block text-sm font-medium text-foreground">Tags</label>
          <input className="mt-1 block w-full rounded border border-border bg-background px-3 py-2 text-foreground placeholder:text-foreground/70" placeholder="First-time donor, Volunteer" {...register('tags')} />
          <p className="text-xs text-foreground mt-1">Comma separated</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground">Notes</label>
          <textarea className="mt-1 block w-full rounded border border-border bg-background px-3 py-2 text-foreground placeholder:text-foreground/70" rows={4} {...register('notes')} />
        </div>

        <div>
          <Button type="submit" disabled={submitting} className="inline-flex items-center px-4 py-2">
            {submitting ? 'Creating...' : 'Create Donor'}
          </Button>
        </div>
      </form>

      {message && (
        <div className={`text-sm ${message.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
          {message.text}
        </div>
      )}
    </div>
  )
}