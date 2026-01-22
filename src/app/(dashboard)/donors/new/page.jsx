import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/session'
import NewDonorClientPage from './donor-new-client'

export const dynamic = 'force-dynamic'

export default async function NewDonorPage() {
  const user = await getSessionUser()
  if (!user) redirect('/login')

  if (!['ADMIN', 'STAFF'].includes(user.role)) {
    redirect('/donors')
  }

  return <NewDonorClientPage />
}