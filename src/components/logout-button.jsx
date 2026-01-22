'use client'
import { useState } from 'react'

export default function LogoutButton() {
  const [loading, setLoading] = useState(false)

  async function handleLogout(e) {
    e.preventDefault()
    if (loading) return
    setLoading(true)
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' })
      if (res.ok) {
        // Redirect to login page after successful logout
        window.location.href = '/login'
      } else {
        setLoading(false)
        const data = await res.json().catch(() => ({}))
        alert(data?.error || 'Logout failed')
      }
    } catch (e) {
      setLoading(false)
      alert('Logout failed')
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="block w-full text-left px-3 py-2 rounded-md text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50"
    >
      {loading ? 'Signing out...' : 'Sign out'}
    </button>
  )
}
