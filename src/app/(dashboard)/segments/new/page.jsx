import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/session'
import NewSegmentClientPage from './segment-new-client'

export const dynamic = 'force-dynamic'

export default async function NewSegmentPage() {
  const user = await getSessionUser()
  if (!user) redirect('/login')

  if (!['ADMIN', 'STAFF'].includes(user.role)) {
    redirect('/segments')
  }

  return <NewSegmentClientPage />
}
