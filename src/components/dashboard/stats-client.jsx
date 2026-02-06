"use client"

import React, { useEffect } from 'react'
import useDashboardStats from '@/hooks/use-dashboard-stats'
import { formatCurrency } from '@/lib/utils'

export default function DashboardStatsClient({ initial = {} }) {
  const { stats, loading, error, refetch } = useDashboardStats()
  // router removed; Campaign Insights button deleted

  // Merge server-provided initial totals with client-fetched stats for immediate UX
  const totals = {
    totalDonors: initial.totalDonors ?? stats.donations?.totalDonors ?? 0,
    totalDonations: initial.totalDonations ?? stats.donations?.totalDonations ?? stats.donations?.totalDonations ?? 0,
    totalAmount: initial.totalAmount ?? stats.donations?.totalAmount ?? 0,
  }

  useEffect(() => {
    function onDonorCreated() { refetch() }
    function onDonationCreated() { refetch() }
    window.addEventListener('donor:created', onDonorCreated)
    window.addEventListener('donation:created', onDonationCreated)
    return () => {
      window.removeEventListener('donor:created', onDonorCreated)
      window.removeEventListener('donation:created', onDonationCreated)
    }
  }, [refetch])

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" suppressHydrationWarning>
      <div className="p-6 rounded-xl shadow-sm border-t-4 bg-white" style={{borderTopColor: '#4A9EE0', backgroundColor: '#E8F4FD'}}>
        <div className="text-xs uppercase tracking-wide text-gray-500 mb-2">Total Donors</div>
        <div className="text-4xl font-bold" style={{color: '#4A9EE0'}}>{totals.totalDonors}</div>
      </div>

      <div className="p-6 rounded-xl shadow-sm border-t-4 bg-white" style={{borderTopColor: '#FF8C42', backgroundColor: '#FFF0E5'}}>
        <div className="text-xs uppercase tracking-wide text-gray-500 mb-2">Total Donations</div>
        <div className="text-4xl font-bold" style={{color: '#FF8C42'}}>{totals.totalDonations}</div>
      </div>

      <div className="p-6 rounded-xl shadow-sm border-t-4 bg-white" style={{borderTopColor: '#5FBF6F', backgroundColor: '#E8F8EA'}}>
        <div className="text-xs uppercase tracking-wide text-gray-500 mb-2">Amount Received</div>
        <div className="text-2xl lg:text-3xl font-bold break-all" style={{color: '#5FBF6F'}} suppressHydrationWarning>{formatCurrency(totals.totalAmount)}</div>
      </div>

      </div>

      {/* Campaign Insights button removed */}
    </>
  )
}
