// vitest-environment node

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '@/app/api/ai/outreach/route'
import { createMockRequest, createMockSession } from '../../../helpers/api-request'

vi.mock('@/lib/requireAuth', () => ({
  requireAuth: vi.fn(),
}))

vi.mock('@/lib/db', () => ({
  prisma: {
    donor: {
      findFirst: vi.fn(),
    },
    donation: {
      findMany: vi.fn(),
    },
  },
}))

describe('POST /api/ai/outreach', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when unauthenticated', async () => {
    const { requireAuth } = await import('@/lib/requireAuth')
    requireAuth.mockResolvedValue({
      json: () => ({ error: 'Unauthorized' }),
      status: 401,
    })

    const req = createMockRequest('POST', '/api/ai/outreach', { donorId: 'donor-1', channel: 'email' })
    const res = await POST(req)

    expect(res.status).toBe(401)
  })

  it('returns template draft when OPENAI_API_KEY is not set', async () => {
    const { requireAuth } = await import('@/lib/requireAuth')
    const { prisma } = await import('@/lib/db')

    requireAuth.mockResolvedValue(createMockSession({ role: 'STAFF', organizationId: 'org-123' }))
    prisma.donor.findFirst.mockResolvedValue({
      id: 'donor-1',
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      retentionRisk: 'HIGH',
      totalGifts: 2,
      totalAmount: 100,
      lastGiftDate: new Date('2025-01-01'),
    })
    prisma.donation.findMany.mockResolvedValue([])

    const prev = process.env.OPENAI_API_KEY
    delete process.env.OPENAI_API_KEY

    const req = createMockRequest('POST', '/api/ai/outreach', { donorId: 'donor-1', channel: 'email' })
    const res = await POST(req)
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.source).toBe('template')
    expect(typeof data.draft).toBe('string')
    expect(data.draft).toContain('AI Outreach Assistant')

    if (prev) process.env.OPENAI_API_KEY = prev
  })
})
