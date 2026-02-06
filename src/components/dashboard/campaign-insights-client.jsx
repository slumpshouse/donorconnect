"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'

export default function CampaignInsightsClient({ campaignInsights = [], nextSteps = [] }) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm" suppressHydrationWarning>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-1" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Campaign Insights</h3>
          <p className="text-sm text-gray-600" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Trending up/down over the last 30 days</p>
        </div>

        <div>
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="inline-flex items-center px-5 py-2 bg-blue-600 text-white rounded-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
            style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}
          >
            {visible ? 'Hide Insights' : 'Show Insights'}
          </button>
        </div>
      </div>

      {visible ? (
        <>
          {campaignInsights.length ? (
            <div className="space-y-6">
              {campaignInsights.slice(0, 6).map((c) => (
                <div key={c.id} className="flex items-start justify-between pb-6 border-b border-gray-200 last:border-b-0 last:pb-0">
                  <div className="flex-1">
                    <Link href={`/campaigns/${c.id}`} className="font-semibold text-gray-900 hover:text-blue-600 transition-colors text-base" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>
                      {c.name}
                    </Link>
                    <div className="text-sm text-gray-600 mt-1.5" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>
                      30d: <span className="text-blue-600 font-medium">{formatCurrency(c.recentAmount)}</span> • {c.recentCount} gift{c.recentCount !== 1 ? 's' : ''}
                    </div>
                    <div className="text-sm text-gray-600 mt-0.5" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>
                      Prev 30d: <span className="text-gray-700">{formatCurrency(c.previousAmount)}</span> • {c.previousCount} gift{c.previousCount !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <div className="ml-4">
                    {c.trend === 'UP' ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border-2 border-green-500 text-green-600 bg-white">✓ UP</span>
                    ) : c.trend === 'DOWN' ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border-2 border-red-400 text-red-500 bg-white">↘ DOWN</span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border-2 border-gray-400 text-gray-600 bg-white">→</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-500">No campaign donations in the last 60 days.</div>
          )}

              <div className="mt-8 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">📋</span>
              <h4 className="font-semibold text-gray-900" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>What to do next</h4>
            </div>
            <div className="space-y-3">
              {nextSteps.slice(0, 3).map((item, idx) => (
                <div key={item} className="flex items-start gap-3 p-3 bg-white rounded-lg border-l-4" style={{borderLeftColor: idx === 0 ? '#5FBF6F' : idx === 1 ? '#FF8C42' : '#4A9EE0'}}>
                  <span className="text-lg flex-shrink-0">{idx === 0 ? '✅' : idx === 1 ? '⚠️' : '📊'}</span>
                  <p className="text-sm text-gray-700" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>{item}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="text-sm text-gray-500">Insights are hidden. Click "Show Insights" to reveal campaign trends.</div>
      )}
    </div>
  )
}
