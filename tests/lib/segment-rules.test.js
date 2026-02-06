// vitest-environment node

import { describe, it, expect } from 'vitest'
import { buildDonorWhereFromSegmentRules } from '@/lib/segment-rules'

describe('segment-rules', () => {
  it('builds case-insensitive equals for string fields', () => {
    const where = buildDonorWhereFromSegmentRules({ field: 'email', operator: 'equals', value: 'Test@Example.org' })
    expect(where).toEqual({ email: { equals: 'Test@Example.org', mode: 'insensitive' } })
  })

  it('does not use mode for enum fields', () => {
    const where = buildDonorWhereFromSegmentRules({ field: 'status', operator: 'equals', value: 'ACTIVE' })
    expect(where).toEqual({ status: 'ACTIVE' })
    expect(JSON.stringify(where)).not.toContain('insensitive')
  })

  it('supports nested AND/OR', () => {
    const where = buildDonorWhereFromSegmentRules({
      and: [
        { field: 'totalGifts', operator: 'greaterThanOrEqual', value: 2 },
        { or: [{ field: 'retentionRisk', operator: 'equals', value: 'HIGH' }] },
      ],
    })

    expect(where).toHaveProperty('AND')
  })
})
