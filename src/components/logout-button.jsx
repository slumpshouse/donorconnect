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
      className="w-full text-center px-4 py-3 rounded-lg bg-white border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-all disabled:opacity-50"
      style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}
    >
      {loading ? 'Logging out...' : 'Log Out'}
    </button>
  )
}
