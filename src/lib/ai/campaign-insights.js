function buildDeterministicNextSteps(campaignInsights) {
  const list = Array.isArray(campaignInsights) ? campaignInsights : []
  const upCampaigns = list.filter((c) => c?.trend === 'UP')
  const downCampaigns = list.filter((c) => c?.trend === 'DOWN')

  const nextSteps = []
  if (upCampaigns.length) {
    nextSteps.push(`Double down on “${upCampaigns[0].name}” — it’s trending up.`)
  }
  if (downCampaigns.length) {
    nextSteps.push(`Review “${downCampaigns[0].name}” — it’s trending down.`)
  }
  if (!upCampaigns.length && !downCampaigns.length && list.length) {
    nextSteps.push('Run a small test (email/landing copy) to move a flat campaign.')
  }
  if (!list.length) {
    nextSteps.push('Record a few donations with campaigns to start tracking trends.')
  }
  nextSteps.push('Check totals weekly and adjust outreach accordingly.')

  return nextSteps.slice(0, 3)
}

function clampSteps(steps) {
  return (Array.isArray(steps) ? steps : [])
    .map((s) => (typeof s === 'string' ? s.trim() : ''))
    .filter(Boolean)
    .map((s) => (s.length > 220 ? `${s.slice(0, 217).trim()}…` : s))
    .slice(0, 3)
}

function parseNextStepsFromModelText(text) {
  if (typeof text !== 'string' || !text.trim()) return null

  // Prefer JSON: { "nextSteps": ["...", ...] }
  try {
    const maybe = JSON.parse(text)
    if (maybe && Array.isArray(maybe.nextSteps)) {
      const steps = clampSteps(maybe.nextSteps)
      return steps.length ? steps : null
    }
  } catch {
    // ignore
  }

  // Fallback: lines/bullets
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.replace(/^[-*\d.\s]+/, '').trim())
    .filter(Boolean)

  const steps = clampSteps(lines)
  return steps.length ? steps : null
}

async function callOpenAIForCampaignNextSteps({ campaignInsights }) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return null

  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini'

  const payload = {
    windowDays: 30,
    campaigns: (Array.isArray(campaignInsights) ? campaignInsights : []).slice(0, 8).map((c) => ({
      name: c?.name ?? 'Unknown campaign',
      recentAmount: Number(c?.recentAmount ?? 0),
      previousAmount: Number(c?.previousAmount ?? 0),
      recentCount: Number(c?.recentCount ?? 0),
      previousCount: Number(c?.previousCount ?? 0),
      trend: c?.trend ?? 'FLAT',
    })),
    outputFormat: {
      nextSteps: [
        'Three short, actionable steps for nonprofit staff based only on the metrics above. Each step should be one sentence.',
      ],
      constraints: [
        'Do not invent performance drivers (no claims about channels/creative) unless implied by data.',
        'No donor PII, no sensitive inferences, no internal tool talk.',
        'Reference campaign names when helpful.',
      ],
    },
  }

  const system =
    'You are DonorConnect\'s fundraising analyst assistant. ' +
    'Given only recent vs previous totals and gift counts by campaign, write practical next steps. ' +
    'Be conservative: do not invent causes; only recommend tests and checks that follow from the numbers.'

  const controller = new AbortController()
  const timeoutMs = Number(process.env.OPENAI_TIMEOUT_MS ?? 4500)
  const t = setTimeout(() => controller.abort(), timeoutMs)

  try {
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
          {
            role: 'user',
            content:
              'Return STRICT JSON only, no markdown, no commentary. ' +
              'Schema: {"nextSteps": [string, string, string]}.\n\n' +
              JSON.stringify(payload),
          },
        ],
      }),
      signal: controller.signal,
    })

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new Error(`OpenAI request failed (${res.status}): ${text.slice(0, 180)}`)
    }

    const data = await res.json()
    const content = data?.choices?.[0]?.message?.content
    const parsed = parseNextStepsFromModelText(content)
    return parsed
  } finally {
    clearTimeout(t)
  }
}

export async function getCampaignNextSteps({ campaignInsights }) {
  const fallback = buildDeterministicNextSteps(campaignInsights)

  if (!process.env.OPENAI_API_KEY) {
    return { nextSteps: fallback, source: 'deterministic' }
  }

  try {
    const steps = await callOpenAIForCampaignNextSteps({ campaignInsights })
    if (steps?.length) return { nextSteps: steps, source: 'openai' }

    return { nextSteps: fallback, source: 'deterministic', warning: 'AI was unavailable; used deterministic fallback.' }
  } catch (e) {
    return {
      nextSteps: fallback,
      source: 'deterministic',
      warning: `AI was unavailable; used deterministic fallback. (${String(e?.message || e).slice(0, 120)})`,
    }
  }
}

export { buildDeterministicNextSteps }
