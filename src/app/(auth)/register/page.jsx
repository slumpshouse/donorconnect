'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

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
    <div className="min-h-screen flex items-center justify-center p-6 bg-background text-foreground">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create your account</CardTitle>
          <CardDescription>Register to manage donors and donations.</CardDescription>
        </CardHeader>
        <CardContent>
          {error && <div className="mb-4 text-sm text-red-700 bg-red-100 p-2 rounded">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground">First name</label>
              <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="mt-1" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground">Last name</label>
              <Input value={lastName} onChange={(e) => setLastName(e.target.value)} className="mt-1" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground">Email</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground">Password</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground">Organization (optional)</label>
              <Input value={organization} onChange={(e) => setOrganization(e.target.value)} className="mt-1" />
            </div>

            <div>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating account…' : 'Create account'}
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">Already have an account?{' '}
              <Link href="/login" className="text-teal-400 hover:underline">Sign in</Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}