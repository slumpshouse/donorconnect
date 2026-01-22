// Dashboard layout - Protected area
import { getSessionUser } from '@/lib/session'
import { redirect } from 'next/navigation'
import DashboardSidebar from '@/components/dashboard/sidebar'

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({ children }) {
  const user = await getSessionUser()
  if (!user) redirect('/login')
  
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto">
        <div className="flex">
          <DashboardSidebar user={user} />

          <main className="flex-1 p-6 py-10">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}