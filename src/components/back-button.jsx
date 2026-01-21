"use client"

import { useRouter, usePathname } from 'next/navigation'

export default function BackButton({ fallback = '/dashboard' }) {
  const router = useRouter()
  const pathname = usePathname()

  // Hide back button on the main dashboard landing page
  if (pathname === '/dashboard' || pathname === '/dashboard/') return null

  function handleBack() {
    // If history length is 1, router.back() may not do anything in some environments.
    // Use fallback to ensure a predictable destination.
    try {
      router.back()
    } catch (e) {
      router.push(fallback)
    }
  }

  return (
    <button
      type="button"
      onClick={handleBack}
      className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm border border-border bg-card text-foreground hover:bg-muted shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      aria-label="Go back"
    >
      ← Back
    </button>
  )
}
