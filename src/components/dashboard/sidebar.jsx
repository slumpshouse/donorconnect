import Link from 'next/link'
import LogoutButton from '@/components/logout-button'

export default function DashboardSidebar({ user }) {
  return (
    <aside className="w-64 bg-card border-r border-border h-screen p-4 sticky top-0">
      <div className="mb-6">
        <h2 className="text-lg font-bold">DonorConnect</h2>
        {user ? (
          <div className="text-sm text-muted-foreground mt-1">
            {user.firstName} {user.lastName}
          </div>
        ) : null}
      </div>

      <nav className="space-y-1">
        <Link
          href="/dashboard"
          className="block px-3 py-2 rounded-md text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          Dashboard
        </Link>
        <Link
          href="/donors"
          className="block px-3 py-2 rounded-md text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          Donors
        </Link>
        <Link
          href="/donations"
          className="block px-3 py-2 rounded-md text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          Donations
        </Link>
        <Link
          href="/campaigns"
          className="block px-3 py-2 rounded-md text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          Campaigns
        </Link>
        <Link
          href="/segments"
          className="block px-3 py-2 rounded-md text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          Segments
        </Link>
        <Link
          href="/workflows"
          className="block px-3 py-2 rounded-md text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          Workflows
        </Link>
        <Link
          href="/tasks"
          className="block px-3 py-2 rounded-md text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          Tasks
        </Link>
        {user?.role === 'ADMIN' ? (
          <>
            <Link
              href="/evidence-rubric"
              className="block px-3 py-2 rounded-md text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Evidence / Rubric
            </Link>
            <Link
              href="/reflection"
              className="block px-3 py-2 rounded-md text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Reflection
            </Link>
          </>
        ) : null}
      </nav>

      <div className="mt-6">
        <Link href="/donors/new" className="block">
          <button
            type="button"
            className="w-full text-center px-3 py-2 rounded bg-teal-600 text-white hover:bg-teal-500"
          >
            Add a new Donor
          </button>
        </Link>
      </div>

      <div className="mt-4">
        <LogoutButton />
      </div>
    </aside>
  )
}
