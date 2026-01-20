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
      className="inline-flex items-center px-3 py-2 rounded-md text-sm border bg-white hover:bg-gray-50"
      aria-label="Go back"
    >
      ← Back
    </button>
  )
}
