'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function HomeSessionButton() {
  const [authed, setAuthed] = useState(null)

  useEffect(() => {
    let mounted = true
    async function check() {
      try {
        const res = await fetch('/api/auth/session', { credentials: 'same-origin' })
        if (!mounted) return
        if (res.ok) {
          setAuthed(true)
        } else {
          setAuthed(false)
        }
      } catch (e) {
        if (!mounted) return
        setAuthed(false)
      }
    }
    check()
    return () => { mounted = false }
  }, [])

  if (authed === null) {
    return (
      <a className="inline-flex w-full items-center justify-center rounded-lg px-6 py-3 text-sm font-medium text-white sm:w-auto opacity-80" style={{backgroundColor: '#5B9FDF', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Checking…</a>
    )
  }

  if (authed) {
    return (
      <Link href="/dashboard" className="inline-flex w-full items-center justify-center rounded-lg px-6 py-3 text-sm font-medium text-white sm:w-auto hover:opacity-90" style={{backgroundColor: '#5B9FDF', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Open dashboard</Link>
    )
  }

  return (
    <Link href="/login" className="inline-flex w-full items-center justify-center rounded-lg px-6 py-3 text-sm font-medium text-white sm:w-auto hover:opacity-90" style={{backgroundColor: '#5B9FDF', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Get started</Link>
  )
}
