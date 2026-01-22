import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/session'
import NewDonationClientPage from './donation-new-client'

export const dynamic = 'force-dynamic'

export default async function NewDonationPage() {
  const user = await getSessionUser()
  if (!user) redirect('/login')

  if (!['ADMIN', 'STAFF'].includes(user.role)) {
    redirect('/donations')
  }

  return <NewDonationClientPage />
}
