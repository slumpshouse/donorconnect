"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import LogoutButton from '@/components/logout-button'

export default function DashboardSidebar({ user }) {
  const pathname = usePathname()
  
  const isActive = (path) => {
    if (path === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(path)
  }
  
  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen p-6 sticky top-0">
      <div className="mb-8">
        <h2 className="text-xl font-bold" style={{color: '#5B9FDF', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>DonorConnect</h2>
        {user ? (
          <div className="text-sm text-gray-600 mt-1" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>
            {user.firstName} {user.lastName}
          </div>
        ) : null}
      </div>

      <nav className="space-y-2">
        <Link
          href="/dashboard"
          className={`block px-4 py-2 rounded-lg transition-colors ${
            isActive('/dashboard') ? 'bg-blue-50 border-l-4 border-primary' : 'hover:bg-gray-50'
          }`}
          style={{color: isActive('/dashboard') ? '#5B9FDF' : '#6B7280', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}
        >
          Dashboard
        </Link>
        <Link
          href="/donors"
          className={`block px-4 py-2 rounded-lg transition-colors ${
            isActive('/donors') ? 'bg-blue-50 border-l-4 border-primary' : 'hover:bg-gray-50'
          }`}
          style={{color: isActive('/donors') ? '#5B9FDF' : '#6B7280', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}
        >
          Donors
        </Link>
        <Link
          href="/donations"
          className={`block px-4 py-2 rounded-lg transition-colors ${
            isActive('/donations') ? 'bg-blue-50 border-l-4 border-primary' : 'hover:bg-gray-50'
          }`}
          style={{color: isActive('/donations') ? '#5B9FDF' : '#6B7280', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}
        >
          Donations
        </Link>
        <Link
          href="/campaigns"
          className={`block px-4 py-2 rounded-lg transition-colors ${
            isActive('/campaigns') ? 'bg-blue-50 border-l-4 border-primary' : 'hover:bg-gray-50'
          }`}
          style={{color: isActive('/campaigns') ? '#5B9FDF' : '#6B7280', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}
        >
          Campaigns
        </Link>
        <Link
          href="/segments"
          className={`block px-4 py-2 rounded-lg transition-colors ${
            isActive('/segments') ? 'bg-blue-50 border-l-4 border-primary' : 'hover:bg-gray-50'
          }`}
          style={{color: isActive('/segments') ? '#5B9FDF' : '#6B7280', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}
        >
          Segments
        </Link>
        <Link
          href="/workflows"
          className={`block px-4 py-2 rounded-lg transition-colors ${
            isActive('/workflows') ? 'bg-blue-50 border-l-4 border-primary' : 'hover:bg-gray-50'
          }`}
          style={{color: isActive('/workflows') ? '#5B9FDF' : '#6B7280', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}
        >
          Workflows
        </Link>
        <Link
          href="/tasks"
          className={`block px-4 py-2 rounded-lg transition-colors ${
            isActive('/tasks') ? 'bg-blue-50 border-l-4 border-primary' : 'hover:bg-gray-50'
          }`}
          style={{color: isActive('/tasks') ? '#5B9FDF' : '#6B7280', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}
        >
          Tasks
        </Link>
        {user?.role === 'ADMIN' ? (
          <>
            <Link
              href="/evidence-rubric"
              className={`block px-4 py-2 rounded-lg transition-colors ${
                isActive('/evidence-rubric') ? 'bg-blue-50 border-l-4 border-primary' : 'hover:bg-gray-50'
              }`}
              style={{color: isActive('/evidence-rubric') ? '#5B9FDF' : '#6B7280', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}
            >
              Evidence / Rubric
            </Link>
            <Link
              href="/reflection"
              className={`block px-4 py-2 rounded-lg transition-colors ${
                isActive('/reflection') ? 'bg-blue-50 border-l-4 border-primary' : 'hover:bg-gray-50'
              }`}
              style={{color: isActive('/reflection') ? '#5B9FDF' : '#6B7280', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}
            >
              Reflection
            </Link>
          </>
        ) : null}
      </nav>

      <div className="mt-8">
        <Link href="/donors/new" className="block">
          <button
            type="button"
            className="w-full text-center px-4 py-3 rounded-lg text-white font-medium transition-all shadow-sm"
            style={{backgroundColor: '#5B9FDF'}}
          >
            + Add New Donor
          </button>
        </Link>
      </div>

      <div className="mt-4">
        <button
          type="button"
          className="w-full text-center px-4 py-3 rounded-lg bg-white border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-all"
          onClick={() => document.querySelector('form[action="/api/auth/logout"]')?.requestSubmit()}
        >
          Sign Out
        </button>
        <LogoutButton />
      </div>
    </aside>
  )
}
