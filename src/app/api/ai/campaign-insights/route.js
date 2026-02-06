import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/requireAuth'

function buildDeterministicSummary({ insights = [], now = new Date() }) {
  const topByAmount = insights[0]
  const up = insights.find((c) => c.trend === 'UP')
  const down = insights.find((c) => c.trend === 'DOWN')

  const lines = ['AI Campaign Insights (template fallback)\n']

  if (!insights.length) {
    lines.push('Summary: No campaign donations were recorded in the last 60 days.')
    lines.push('\nSuggested next actions:')
    lines.push('- Start tagging donations with campaigns to track performance.')
    lines.push('- Run a small test (email subject line or landing copy) and measure results.')
    lines.push('- Review results weekly and iterate.')
    return lines.join('\n')
  }

  lines.push(`Period: last 30 days ending ${now.toLocaleDateString('en-US')}`)

  const bullets = []
  if (topByAmount) {
    bullets.push(`Top campaign by revenue: ${topByAmount.name} (${formatCurrency(topByAmount.recentAmount)} from ${topByAmount.recentCount} gifts).`)
  }
  if (up) {
    bullets.push(`Trending up: ${up.name} (vs previous 30 days).`) 
  }
  if (down) {
    bullets.push(`Trending down: ${down.name} (vs previous 30 days).`) 
  }

  lines.push('\nSummary:')
  bullets.slice(0, 3).forEach((b) => lines.push(`- ${b}`))

  lines.push('\nSuggested next actions:')
  if (up) lines.push(`- Double down on ${up.name}: repeat what’s working (audience/creative/timing).`)
  if (down) lines.push(`- Audit ${down.name}: check message, channel, landing page, and timing.`)
  lines.push('- Keep one variable per test (subject line OR audience OR CTA) and compare 30-day totals.')

  return lines.join('\n')
}

function formatCurrency(value) {
  const n = typeof value === 'number' ? value : Number(value ?? 0)
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

function getTrend({ recentAmount, previousAmount, recentCount, previousCount }) {
  if (previousAmount === 0 && previousCount === 0) {
    if (recentAmount > 0 || recentCount > 0) return 'UP'
    return 'FLAT'
  }

  const amountPct = previousAmount === 0 ? (recentAmount > 0 ? 1 : 0) : (recentAmount - previousAmount) / previousAmount
  const countPct = previousCount === 0 ? (recentCount > 0 ? 1 : 0) : (recentCount - previousCount) / previousCount
  const avgPct = (amountPct + countPct) / 2

  if (avgPct >= 0.1) return 'UP'
  if (avgPct <= -0.1) return 'DOWN'
  return 'FLAT'
}

async function fetchCampaignInsights(orgId) {
  const now = new Date()
  const recentStart = new Date(now)
  recentStart.setDate(recentStart.getDate() - 30)
  const previousStart = new Date(now)
  previousStart.setDate(previousStart.getDate() - 60)

  const [recentCampaignStats, previousCampaignStats] = await Promise.all([
    prisma.donation.groupBy({
      by: ['campaignId'],
      where: {
        donor: { organizationId: orgId },
        campaignId: { not: null },
        date: { gte: recentStart },
      },
      _sum: { amount: true },
      _count: { _all: true },
    }),
    prisma.donation.groupBy({
      by: ['campaignId'],
      where: {
        donor: { organizationId: orgId },
        campaignId: { not: null },
        date: { gte: previousStart, lt: recentStart },
      },
      _sum: { amount: true },
      _count: { _all: true },
    }),
  ])

  const recentMap = new Map(
    recentCampaignStats
      .filter((row) => row.campaignId)
      .map((row) => [
        row.campaignId,
        {
          amount: row._sum?.amount ?? 0,
          count: row._count?._all ?? 0,
        },
      ])
  )

  const previousMap = new Map(
    previousCampaignStats
      .filter((row) => row.campaignId)
      .map((row) => [
        row.campaignId,
        {
          amount: row._sum?.amount ?? 0,
          count: row._count?._all ?? 0,
        },
      ])
  )

  const campaignIds = Array.from(new Set([...recentMap.keys(), ...previousMap.keys()]))

  const campaigns = campaignIds.length
    ? await prisma.campaign.findMany({
      where: { organizationId: orgId, id: { in: campaignIds } },
      select: { id: true, name: true },
    })
    : []

  const campaignNameById = new Map(campaigns.map((c) => [c.id, c.name]))

  const insights = campaignIds
    .map((id) => {
      const recent = recentMap.get(id) ?? { amount: 0, count: 0 }
      const previous = previousMap.get(id) ?? { amount: 0, count: 0 }
      const trend = getTrend({
        recentAmount: recent.amount,
        previousAmount: previous.amount,
        recentCount: recent.count,
        previousCount: previous.count,
      })

      return {
        id,
        name: campaignNameById.get(id) ?? 'Unknown campaign',
        recentAmount: recent.amount,
        previousAmount: previous.amount,
        recentCount: recent.count,
        previousCount: previous.count,
        trend,
      }
    })
    .sort((a, b) => b.recentAmount - a.recentAmount)

  return { insights, now, recentStart, previousStart }
}

async function callOpenAI({ now, recentStart, previousStart, insights }) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return null

  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini'

  const safeTop = (Array.isArray(insights) ? insights : []).slice(0, 8).map((c) => ({
    name: c.name,
    trend: c.trend,
    recentAmount: c.recentAmount,
    recentCount: c.recentCount,
    previousAmount: c.previousAmount,
    previousCount: c.previousCount,
  }))

  const system =
    'You are DonorConnect\'s AI Campaign Insights assistant. ' +
    'You summarize campaign performance and suggest small, practical fundraising experiments. ' +
    'Be conservative: do NOT invent facts, donors, channels used, or causes. ' +
    'Use only the provided aggregated campaign stats. Keep it short and actionable.'

  const user = {
    timeframe: {
      recentWindow: `${recentStart.toLocaleDateString('en-US')} to ${now.toLocaleDateString('en-US')}`,
      previousWindow: `${previousStart.toLocaleDateString('en-US')} to ${recentStart.toLocaleDateString('en-US')}`,
    },
    campaigns: safeTop,
    outputFormat:
      'Return plain text with sections: ' +
      '(1) Title line: "AI Campaign Insights"; ' +
      '(2) 3 bullets summarizing what changed; ' +
      '(3) 3 bullets for "Next experiments" (each should be a single-variable test); ' +
      '(4) A one-line caution: "Verify against your data before acting."',
  }

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      temperature: 0.3,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: JSON.stringify(user) },
      ],
    }),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`OpenAI request failed (${res.status}): ${text.slice(0, 200)}`)
  }

  const data = await res.json()
  const content = data?.choices?.[0]?.message?.content
  return typeof content === 'string' && content.trim() ? content.trim() : null
}

export async function POST(request) {
  try {
    const auth = await requireAuth(request)
    if (auth instanceof NextResponse) return auth
    const session = auth

    const { insights, now, recentStart, previousStart } = await fetchCampaignInsights(session.user.organizationId)
    const fallback = buildDeterministicSummary({ insights, now })

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ summary: fallback, source: 'template' })
    }

    try {
      const summary = await callOpenAI({ now, recentStart, previousStart, insights })
      if (summary) return NextResponse.json({ summary, source: 'openai' })
      return NextResponse.json({ summary: fallback, source: 'template', warning: 'AI summary was unavailable; used template fallback.' })
    } catch (e) {
      return NextResponse.json({
        summary: fallback,
        source: 'template',
        warning: `AI summary was unavailable; used template fallback. (${String(e?.message || e).slice(0, 160)})`,
      })
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('POST /api/ai/campaign-insights error', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
