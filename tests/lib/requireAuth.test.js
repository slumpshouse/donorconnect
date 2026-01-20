import { describe, it, expect, vi } from 'vitest'
import { createMockRequest } from '../helpers/api-request'

vi.mock('@/lib/session', () => ({
  getSession: vi.fn(),
}))

describe('requireAuth', () => {
  it('returns 401 JSON when no session present', async () => {
    const { getSession } = await import('@/lib/session')
    getSession.mockResolvedValue(null)

    const { requireAuth } = await import('@/lib/requireAuth')
    const request = createMockRequest('GET', '/api/donors')

    const result = await requireAuth(request)

    // If unauthorized, helper returns a NextResponse with status 401
    expect(result.status).toBe(401)
    const bodyText = await result.text()
    const data = bodyText ? JSON.parse(bodyText) : null
    expect(data).toEqual({ error: 'Unauthorized' })
  })
})
