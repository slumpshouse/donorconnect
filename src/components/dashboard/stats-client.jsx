"use client"

import React, { useEffect } from 'react'
import useDashboardStats from '@/hooks/use-dashboard-stats'
import { formatCurrency } from '@/lib/utils'

export default function DashboardStatsClient({ initial = {} }) {
  const { stats, loading, error, refetch } = useDashboardStats()

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
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="p-5 rounded-xl shadow bg-gradient-to-r from-teal-700 to-cyan-600 text-white">
        <div className="text-sm text-white/80">Total Donors</div>
        <div className="text-3xl font-semibold mt-2">{totals.totalDonors}</div>
      </div>

      <div className="p-5 rounded-xl shadow bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
        <div className="text-sm text-white/80">Total Donations</div>
        <div className="text-3xl font-semibold mt-2">{totals.totalDonations}</div>
      </div>

      <div className="p-5 rounded-xl shadow bg-gradient-to-r from-cyan-700 to-teal-600 text-white">
        <div className="text-sm text-white/80">Amount Received</div>
        <div className="text-3xl font-semibold mt-2">{formatCurrency(totals.totalAmount)}</div>
      </div>
    </div>
  )
}
