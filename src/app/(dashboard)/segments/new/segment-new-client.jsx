"use client"

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

const segmentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional().or(z.literal('')),
})

export default function NewSegmentClientPage() {
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState(null)
  const router = useRouter()

  const { register, handleSubmit, formState: { errors }, reset } = useForm({ resolver: zodResolver(segmentSchema) })

  const [conditions, setConditions] = useState([])
  const [condField, setCondField] = useState('lastGiftDate')
  const [condOp, setCondOp] = useState('lt')
  const [condValue, setCondValue] = useState('')

  function addCondition() {
    if (!condValue) return
    setConditions((c) => [...c, { field: condField, operator: condOp, value: condValue }])
    setCondValue('')
  }

  function removeCondition(idx) {
    setConditions((c) => c.filter((_, i) => i !== idx))
  }

  const presets = [
    {
      id: 'recent',
      name: 'Recent Donors (30 days)',
      build: () => {
        const date = new Date()
        date.setDate(date.getDate() - 30)
        return [{ field: 'lastGiftDate', operator: 'gte', value: date.toISOString().slice(0, 10) }]
      },
    },
    {
      id: 'lapsed_major',
      name: 'Lapsed Major Donors (12+ months, >$1,000)',
      build: () => {
        const date = new Date()
        date.setFullYear(date.getFullYear() - 1)
        return [
          { field: 'totalAmount', operator: 'gte', value: '1000' },
          { field: 'lastGiftDate', operator: 'lte', value: date.toISOString().slice(0, 10) },
        ]
      },
    },
    {
      id: 'new_contacts',
      name: 'New Contacts (90 days)',
      build: () => {
        const date = new Date()
        date.setDate(date.getDate() - 90)
        return [{ field: 'totalGifts', operator: 'equals', value: '0' }, { field: 'lastGiftDate', operator: 'gte', value: date.toISOString().slice(0, 10) }]
      },
    },
  ]

  function applyPreset(p) {
    const built = p.build()
    setConditions(built)
  }

  async function onSubmit(values) {
    setMessage(null)
    setSubmitting(true)
    try {
      const rulesObj = { conditions }
      const payload = { name: values.name, description: values.description || null, rules: rulesObj }

      const res = await fetch('/api/segments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'same-origin',
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        setMessage({ type: 'error', text: err?.error || `Failed to create segment (${res.status})` })
        setSubmitting(false)
        return
      }

      setMessage({ type: 'success', text: 'Segment created.' })
      reset()
      setTimeout(() => router.push('/segments'), 700)
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e)
      setMessage({ type: 'error', text: 'Unexpected error creating segment.' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-gray-800" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>New Segment</h1>
        <p className="text-base text-gray-600 mt-2" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Create a donor segment</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-lg">
        <div>
          <label className="block text-sm font-medium text-gray-700" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Name</label>
          <input
            className="mt-1 block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-900"
            style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}
            {...register('name')}
            aria-invalid={errors.name ? 'true' : 'false'}
          />
          {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Description</label>
          <textarea
            className="mt-1 block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-900"
            style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}
            rows={3}
            {...register('description')}
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Presets</label>
            <div className="flex gap-2">
              {presets.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
                  style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-2">
            <label className="block text-sm font-medium text-gray-700" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Rules</label>
            <p className="text-xs text-gray-600 mt-1" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Build simple rules to define who belongs in this segment.</p>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2 items-end">
            <div>
              <label className="text-xs text-gray-700" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Field</label>
              <select className="mt-1 block w-full rounded-lg border border-gray-200 bg-white px-2 py-2 text-gray-900" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}} value={condField} onChange={(e) => setCondField(e.target.value)}>
                <option value="firstName">First name</option>
                <option value="lastName">Last name</option>
                <option value="email">Email</option>
                <option value="phone">Phone</option>
                <option value="city">City</option>
                <option value="state">State</option>
                <option value="zipCode">Zip code</option>
                <option value="createdAt">Created date</option>
                <option value="lastGiftDate">Last gift date</option>
                <option value="totalAmount">Total amount</option>
                <option value="totalGifts">Total gifts</option>
                <option value="status">Donor status</option>
                <option value="retentionRisk">Retention risk</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-700" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Operator</label>
              <select className="mt-1 block w-full rounded-lg border border-gray-200 bg-white px-2 py-2 text-gray-900" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}} value={condOp} onChange={(e) => setCondOp(e.target.value)}>
                <option value="equals">equals</option>
                <option value="contains">contains</option>
                <option value="lt">less than</option>
                <option value="gt">greater than</option>
                <option value="lte">≤</option>
                <option value="gte">≥</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-700" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Value</label>
              <input
                className="mt-1 block w-full rounded-lg border border-gray-200 bg-white px-2 py-2 text-gray-900"
                style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}
                value={condValue}
                onChange={(e) => setCondValue(e.target.value)}
                placeholder="value (e.g. 2025-01-01 or 100)"
              />
            </div>
          </div>

          

          {conditions.length > 0 && (
            <ul className="mt-3 space-y-2">
              {conditions.map((c, i) => (
                <li key={i} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg border border-gray-200">
                  <div className="text-sm" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>
                    {(() => {
                      const labels = {
                        firstName: 'First name',
                        lastName: 'Last name',
                        email: 'Email',
                        phone: 'Phone',
                        city: 'City',
                        state: 'State',
                        zipCode: 'Zip code',
                        createdAt: 'Created date',
                        lastGiftDate: 'Last gift date',
                        totalAmount: 'Total amount',
                        totalGifts: 'Total gifts',
                        status: 'Donor status',
                        retentionRisk: 'Retention risk',
                      }
                      const label = labels[c.field] || c.field
                      return <>{label} {c.operator} <span className="font-medium">{c.value}</span></>
                    })()}
                  </div>
                  <button type="button" onClick={() => removeCondition(i)} className="text-sm text-red-600 font-medium" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Remove</button>
                </li>
              ))}
            </ul>
          )}

        </div>

        <div>
          <button type="submit" disabled={submitting} className="inline-flex items-center px-6 py-3 rounded-lg text-white font-medium shadow-sm" style={{backgroundColor: '#5B9FDF', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>
            {submitting ? 'Creating...' : 'Create Segment'}
          </button>
        </div>
      </form>

      {message && <div className={`text-sm ${message.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>{message.text}</div>}
    </div>
  )
}
