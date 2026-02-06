import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/requireAuth'

function formatDateShort(value) {
  if (!value) return null
  const d = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleDateString('en-US')
}

function buildDeterministicDraft({ donor, donations, channel }) {
  const name = [donor?.firstName, donor?.lastName].filter(Boolean).join(' ').trim() || 'there'
  const lastGift = formatDateShort(donor?.lastGiftDate)
  const amount = typeof donor?.totalAmount === 'number' ? donor.totalAmount : Number(donor?.totalAmount ?? 0)
  const gifts = typeof donor?.totalGifts === 'number' ? donor.totalGifts : Number(donor?.totalGifts ?? 0)

  const lastCampaign = Array.isArray(donations) && donations.length ? donations[0]?.campaign?.name : null
  const contextBits = [
    gifts ? `${gifts} gift${gifts === 1 ? '' : 's'} total` : null,
    amount ? `total giving $${amount.toFixed(2)}` : null,
    lastGift ? `last gift ${lastGift}` : null,
    lastCampaign ? `most recent campaign: ${lastCampaign}` : null,
  ].filter(Boolean)

  const subject = `Thank you${lastGift ? ` for your recent support` : ''}`
  const opener = `Hi ${name},\n\nThank you for supporting our mission.`
  const context = contextBits.length ? `\n\nI’m reaching out because we really appreciate your support (${contextBits.join(' • ')}).` : ''
  const ask = `\n\nIf you have a moment, I’d love to share a quick update on the impact you’re making and hear what motivated your giving.`
  const close = `\n\nWith gratitude,\n[Your Name]`

  if (String(channel || 'email').toLowerCase() === 'call') {
    return [
      'AI Outreach Assistant (template fallback)\n',
      'Call script\n',
      `- Opener: ${opener.replace(/\n\n/g, ' ')}${context.replace(/\n\n/g, ' ')}`,
      '- Ask: "Would you be open to a quick 2-minute update on how your support helps?"',
      '- Question: "What inspired your most recent gift?"',
      '- Close: "Thanks again — we’re grateful for you."',
    ].join('\n')
  }

  return [
    'AI Outreach Assistant (template fallback)\n',
    `Subject: ${subject}\n`,
    opener + context + ask + close,
    '\n\nNext steps:\n- Log this outreach in Interactions\n- Create a follow-up Task if needed\n- Check if they’ve given again after 2 weeks',
  ].join('')
}

async function callOpenAI({ donor, donations, channel }) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return null

  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini'

  const name = [donor?.firstName, donor?.lastName].filter(Boolean).join(' ').trim() || 'the donor'
  const lastGiftDate = formatDateShort(donor?.lastGiftDate)

  const donationsSummary = (Array.isArray(donations) ? donations : []).map((d) => ({
    date: formatDateShort(d.date),
    amount: typeof d.amount === 'number' ? d.amount : Number(d.amount ?? 0),
    campaign: d.campaign?.name || null,
  }))

  const system =
    'You are DonorConnect\'s AI Outreach Assistant. You write stewardship outreach drafts for nonprofit staff. ' +
    'You must be conservative: do NOT invent facts, donors\' personal details, or outcomes. ' +
    'Use only the provided donor and donation context. Do not mention internal risk scores.'

  const user = {
    channel: String(channel || 'email').toLowerCase() === 'call' ? 'call' : 'email',
    donor: {
      name,
      email: donor?.email || null,
      totalGifts: donor?.totalGifts ?? 0,
      totalAmount: donor?.totalAmount ?? 0,
      lastGiftDate: lastGiftDate || null,
    },
    recentDonations: donationsSummary,
    outputFormat:
      'Return plain text with these sections: (1) Title line: "AI Outreach Assistant"; ' +
      '(2) If email: a Subject line and an email body under 140 words; ' +
      '(3) If call: a short call script with bullet points; ' +
      '(4) 3 bullet "Next steps" for staff. ' +
      'Tone: warm, grateful, professional. No sensitive inferences.',
  }

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
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

    if (!['ADMIN', 'STAFF'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json().catch(() => ({}))
    const donorId = body?.donorId
    const channel = body?.channel || 'email'

    if (!donorId) return NextResponse.json({ error: 'Missing donorId' }, { status: 400 })

    const donor = await prisma.donor.findFirst({
      where: { id: donorId, organizationId: session.user.organizationId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        retentionRisk: true,
        totalGifts: true,
        totalAmount: true,
        lastGiftDate: true,
      },
    })

    if (!donor) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const donations = await prisma.donation.findMany({
      where: { donorId: donor.id },
      orderBy: { date: 'desc' },
      take: 3,
      include: { campaign: true },
    })

    const fallback = buildDeterministicDraft({ donor, donations, channel })

    // If no API key configured, provide a safe deterministic fallback.
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ draft: fallback, source: 'template' })
    }

    // If the LLM request fails (bad key, network, rate limit), fail open:
    // return the deterministic fallback instead of a 500.
    try {
      const draft = await callOpenAI({ donor, donations, channel })
      if (draft) return NextResponse.json({ draft, source: 'openai' })
      return NextResponse.json({ draft: fallback, source: 'template', warning: 'AI draft was unavailable; used template fallback.' })
    } catch (e) {
      return NextResponse.json({
        draft: fallback,
        source: 'template',
        warning: `AI draft was unavailable; used template fallback. (${String(e?.message || e).slice(0, 160)})`,
      })
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('POST /api/ai/outreach error', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
