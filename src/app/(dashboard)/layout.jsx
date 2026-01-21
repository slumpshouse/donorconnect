// Dashboard layout - Protected area
import { getSessionUser } from '@/lib/session'
import { redirect } from 'next/navigation'
import BackButton from '@/components/back-button'

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({ children }) {
  const user = await getSessionUser()
  if (!user) redirect('/login')
  
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* TODO: Implement navigation header */}
      {/* TODO: Implement main content area */}
      <main className="py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-4">
            <BackButton />
          </div>
          {children}
        </div>
      </main>
    </div>
  )
}