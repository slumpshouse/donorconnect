'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [organization, setOrganization] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const router = useRouter()

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (!firstName || !lastName || !email || !password) {
      setError('Please fill in all required fields.')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, password, organization }),
        credentials: 'same-origin',
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setError(body?.error || `Registration failed (${res.status})`)
        setLoading(false)
        return
      }

      // On success, redirect to login
      router.push('/login')
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e)
      setError('Unexpected error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-xl shadow-sm p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Create your account</h1>
          <p className="text-sm text-gray-600 mt-2" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Register to manage donors and donations.</p>
        </div>

        {error && <div className="mb-4 text-sm text-red-700 bg-red-50 p-3 rounded-lg border border-red-200" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>First name</label>
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              placeholder="First name"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 placeholder:text-gray-400"
              style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Last name</label>
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              placeholder="Last name"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 placeholder:text-gray-400"
              style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@organization.org"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 placeholder:text-gray-400"
              style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Create a password"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 placeholder:text-gray-400"
              style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Organization (optional)</label>
            <input
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              placeholder="Organization name"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 placeholder:text-gray-400"
              style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-lg text-white font-medium shadow-sm disabled:opacity-50"
              style={{backgroundColor: '#5B9FDF', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}
            >
              {loading ? 'Creating account…' : 'Create account'}
            </button>
            <Link href="/login" className="text-sm hover:underline" style={{color: '#5B9FDF', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}