// AI / heuristic retention risk scoring
//
// Goal: assign each donor one of 3 UI labels:
// - Likely to return (LOW)
// - At risk (MEDIUM)
// - High risk (HIGH)
//
// If OPENAI_API_KEY is configured, the donor detail endpoint can optionally
// request an LLM-generated summary. List endpoints always use the fast heuristic.

function coerceDate(value) {
  if (!value) return null
  const d = value instanceof Date ? value : new Date(value)
  // invalid date -> null
  if (Number.isNaN(d.getTime())) return null
  return d
}

function daysSince(date) {
  const d = coerceDate(date)
  if (!d) return null
  const ms = Date.now() - d.getTime()
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)))
}

function clamp(num, min, max) {
  return Math.min(max, Math.max(min, num))
}

// Fast, deterministic scoring based on donor-level metrics (RFM-style).
export function heuristicRetentionRisk(donor) {
  const totalGifts = Number(donor?.totalGifts ?? 0)
  const totalAmount = Number(donor?.totalAmount ?? 0)
  const daysSinceLastGift = daysSince(donor?.lastGiftDate)
  const daysSinceFirstGift = daysSince(donor?.firstGiftDate)

  // Base risk: donors with no recorded gifts are treated as "At risk" (MEDIUM)
  // because they have not yet demonstrated repeat behavior.
  let score = totalGifts <= 0 ? 55 : 40

  // Recency (most important)
  if (daysSinceLastGift == null) {
    // No last gift date -> treat similar to having no giving history
    score += 15
  } else if (daysSinceLastGift <= 30) {
    score -= 18
  } else if (daysSinceLastGift <= 90) {
    score += 0
  } else if (daysSinceLastGift <= 180) {
    score += 18
  } else if (daysSinceLastGift <= 365) {
    score += 30
  } else {
    score += 40
  }

  // Frequency: more gifts => lower risk
  if (totalGifts >= 10) score -= 20
  else if (totalGifts >= 5) score -= 12
  else if (totalGifts >= 2) score -= 6

  // Monetary: higher giving correlates with retention (light weight)
  if (totalAmount >= 5000) score -= 10
  else if (totalAmount >= 1000) score -= 6
  else if (totalAmount >= 250) score -= 2

  // Very new donors: if their first gift is recent, reduce risk a bit
  if (daysSinceFirstGift != null && daysSinceFirstGift <= 30) score -= 6

  score = clamp(Math.round(score), 0, 100)

  let level
  if (score <= 33) level = 'LOW'
  else if (score <= 66) level = 'MEDIUM'
  else level = 'HIGH'

  const label = level === 'LOW' ? 'Likely to return' : level === 'MEDIUM' ? 'At risk' : 'High risk'

  const factors = {
    score,
    daysSinceLastGift,
    daysSinceFirstGift,
    totalGifts,
    totalAmount,
  }

  return {
    level,
    label,
    score,
    factors,
    summary:
      level === 'LOW'
        ? 'Recent and/or repeated giving suggests strong likelihood of returning.'
        : level === 'MEDIUM'
          ? 'Giving recency and frequency indicate a meaningful risk of lapsing.'
          : 'Long time since last gift and/or limited giving history suggests high lapse risk.',
  }
}

async function openAiRetentionRiskSummary(donor) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return null

  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini'

  // Only send the minimal donor metrics needed.
  const payload = {
    totalGifts: Number(donor?.totalGifts ?? 0),
    totalAmount: Number(donor?.totalAmount ?? 0),
    firstGiftDate: donor?.firstGiftDate ?? null,
    lastGiftDate: donor?.lastGiftDate ?? null,
    status: donor?.status ?? null,
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 2500)

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        temperature: 0.2,
        messages: [
          {
            role: 'system',
            content:
              'You are a donor retention analyst. Classify retention risk into exactly one of: LOW, MEDIUM, HIGH. ' +
              'Also provide a concise 1-2 sentence summary suitable for an "AI Insights" panel.',
          },
          {
            role: 'user',
            content:
              'Given donor metrics below, respond ONLY as JSON: {"level":"LOW|MEDIUM|HIGH","summary":"..."}.\n\n' +
              JSON.stringify(payload),
          },
        ],
      }),
    })

    if (!res.ok) return null
    const data = await res.json().catch(() => null)
    const text = data?.choices?.[0]?.message?.content
    if (!text || typeof text !== 'string') return null

    const parsed = JSON.parse(text)
    const level = typeof parsed?.level === 'string' ? parsed.level.trim().toUpperCase() : null
    const summary = typeof parsed?.summary === 'string' ? parsed.summary.trim() : null

    if (!['LOW', 'MEDIUM', 'HIGH'].includes(level)) return null
    if (!summary) return null

    return { level, summary }
  } catch (e) {
    return null
  } finally {
    clearTimeout(timeout)
  }
}

// Returns a stable risk result; may be enriched with an LLM summary if configured.
export async function getRetentionRiskInsights(donor) {
  const base = heuristicRetentionRisk(donor)
  const ai = await openAiRetentionRiskSummary(donor)

  if (ai) {
    const label = ai.level === 'LOW' ? 'Likely to return' : ai.level === 'MEDIUM' ? 'At risk' : 'High risk'
    return {
      ...base,
      level: ai.level,
      label,
      summary: ai.summary,
      source: 'openai',
    }
  }

  return { ...base, source: 'heuristic' }
}
