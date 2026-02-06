import { prisma } from './db'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

async function getDonationStats(orgId) {
  const agg = await prisma.donation.aggregate({
    where: { donor: { organizationId: orgId } },
    _avg: { amount: true },
    _sum: { amount: true },
    _count: { _all: true },
  })
  return {
    avg: agg._avg?.amount ?? 0,
    sum: agg._sum?.amount ?? 0,
    count: agg._count?._all ?? 0,
  }
}

export async function scanAnomalies(organizationId) {
  // donors with invalid email, impossible lastGiftDate, negative totals
  const donors = await prisma.donor.findMany({ where: { organizationId }, take: 200 })

  const donationStats = await getDonationStats(organizationId)
  const donationThreshold = Math.max(100000, (donationStats.avg || 0) * 10)

  // build quick maps to detect duplicates by normalized name and email
  const nameMap = {}
  const emailMap = {}
  for (const d of donors) {
    const fn = (d.firstName || '').trim().toLowerCase()
    const ln = (d.lastName || '').trim().toLowerCase()
    const nameKey = `${fn}|${ln}`
    if (fn || ln) {
      nameMap[nameKey] = nameMap[nameKey] || []
      nameMap[nameKey].push(d.id)
    }
    if (d.email) {
      const em = d.email.trim().toLowerCase()
      emailMap[em] = emailMap[em] || []
      emailMap[em].push(d.id)
    }
  }

  const donorAnomalies = []
  for (const d of donors) {
    const issues = []
    if (d.email && !EMAIL_RE.test(d.email)) issues.push('invalid_email')
    if (d.lastGiftDate && new Date(d.lastGiftDate) > new Date()) issues.push('lastGiftDate_in_future')
    if (d.totalAmount != null && d.totalAmount < 0) issues.push('negative_totalAmount')

    const fn = (d.firstName || '').trim().toLowerCase()
    const ln = (d.lastName || '').trim().toLowerCase()
    const nameKey = `${fn}|${ln}`
    if ((fn || ln) && nameMap[nameKey] && nameMap[nameKey].length > 1) issues.push('duplicate_name')

    if (d.email) {
      const em = d.email.trim().toLowerCase()
      if (emailMap[em] && emailMap[em].length > 1) issues.push('duplicate_email')
    }

    if (issues.length) donorAnomalies.push({ id: d.id, name: `${d.firstName || ''} ${d.lastName || ''}`.trim(), email: d.email, issues })
  }

  // recent donations with extreme amounts or impossible dates
  const donations = await prisma.donation.findMany({ where: { donor: { organizationId } }, orderBy: { createdAt: 'desc' }, take: 500 })
  const donationAnomalies = []
  // build donations-by-donor map for additional checks (duplicates, rapid activity)
  const donationsByDonor = donations.reduce((m, item) => {
    m[item.donorId] = m[item.donorId] || []
    m[item.donorId].push(item)
    return m
  }, {})

  for (const don of donations) {
    const issues = []
    if (don.amount != null && (don.amount <= 0 || don.amount > donationThreshold)) issues.push('suspicious_amount')
    if (don.date && new Date(don.date) > new Date()) issues.push('date_in_future')
    // basic duplicate check: same donor, same amount within short window
    const recentForDonor = donationsByDonor[don.donorId] || []
    const sameAmountNearby = recentForDonor.filter((d2) => Math.abs(new Date(d2.createdAt) - new Date(don.createdAt)) <= 1000 * 60 * 60 * 24 && d2.amount === don.amount)
    if (sameAmountNearby.length > 1) issues.push('possible_duplicate_or_rapid_attempts')
    if (issues.length) {
      // include donor name for easier display
      const donor = await prisma.donor.findUnique({ where: { id: don.donorId }, select: { firstName: true, lastName: true, email: true } })
      const donorName = donor ? `${donor.firstName || ''} ${donor.lastName || ''}`.trim() : null
      const donorEmail = donor?.email || null
      donationAnomalies.push({ id: don.id, donorId: don.donorId, donorName, donorEmail, amount: don.amount, date: don.date, issues })
    }
  }

  // Additional donor-level checks that require segment membership or activity patterns
  // Fetch segments named like 'first' or 'repeat' for this organization
  const segments = await prisma.segment.findMany({ where: { organizationId, OR: [ { name: { contains: 'first', mode: 'insensitive' } }, { name: { contains: 'repeat', mode: 'insensitive' } } ] }, select: { id: true, name: true } })
  const segmentIds = segments.map(s => s.id)
  let segmentMembers = []
  if (segmentIds.length && donors.length) {
    const donorIds = donors.map(d => d.id)
    segmentMembers = await prisma.segmentMember.findMany({ where: { segmentId: { in: segmentIds }, donorId: { in: donorIds } }, select: { segmentId: true, donorId: true } })
  }

  const membersByDonor = segmentMembers.reduce((m, sm) => {
    m[sm.donorId] = m[sm.donorId] || []
    m[sm.donorId].push(sm.segmentId)
    return m
  }, {})

  // examine donors for suspicious charge history and segment mismatches
  for (const d of donors) {
    const donorIssues = []
    const recentDonations = (donationsByDonor[d.id] || []).filter(dt => {
      // consider donations in last 30 days for rapid activity
      try { return new Date(dt.createdAt) >= new Date(Date.now() - 1000 * 60 * 60 * 24 * 30) } catch (e) { return false }
    })
    // suspicious charge history: >3 gifts in 24 hours or same amount repeated 3+ times in 24 hours
    if (recentDonations.length) {
      // group by day-window (24h) relative to each donation
      const byDayBuckets = {}
      for (const r of recentDonations) {
        const dayKey = Math.floor(new Date(r.createdAt).getTime() / (1000 * 60 * 60 * 24))
        byDayBuckets[dayKey] = (byDayBuckets[dayKey] || 0) + 1
      }
      if (Object.values(byDayBuckets).some(c => c >= 4)) donorIssues.push('suspicious_charge_history')

      // repeated same-amount within 24h
      const amountWindowCount = {}
      for (const r of recentDonations) {
        const key = `${r.amount}|${Math.floor(new Date(r.createdAt).getTime() / (1000 * 60 * 60 * 24))}`
        amountWindowCount[key] = (amountWindowCount[key] || 0) + 1
      }
      if (Object.values(amountWindowCount).some(c => c >= 3)) donorIssues.push('suspicious_charge_history')
    }

    // segment mismatches
    const memberSegs = membersByDonor[d.id] || []
    if (memberSegs.length) {
      // find any 'first' or 'repeat' segment names
      for (const segId of memberSegs) {
        const seg = segments.find(s => s.id === segId)
        if (!seg) continue
        if (/first/i.test(seg.name) && (d.totalGifts ?? 0) > 1) donorIssues.push('first_time_mismatch')
        if (/repeat/i.test(seg.name) && (d.totalGifts ?? 0) <= 1) donorIssues.push('repeat_segment_mismatch')
      }
    }

    // similar data: same last name + same first initial (but not exact duplicate)
    const fn = (d.firstName || '').trim().toLowerCase()
    const ln = (d.lastName || '').trim().toLowerCase()
    if (ln) {
      const group = Object.keys(nameMap).filter(k => k.endsWith(`|${ln}`))
      // if multiple distinct first names share last name and same first initial
      const similar = group.reduce((acc, k) => acc.concat(nameMap[k] || []), []).filter(id => id !== d.id)
      if (similar.length) {
        // require first initial match
        const initial = fn.charAt(0)
        const hasMatch = similar.some(otherId => {
          const other = donors.find(x => x.id === otherId)
          return (other && (other.firstName || '').trim().toLowerCase().charAt(0) === initial)
        })
        if (hasMatch) donorIssues.push('similar_name')
      }
    }

    if (donorIssues.length) {
      // merge with existing donorAnomalies entry if present
      const existing = donorAnomalies.find(x => x.id === d.id)
      if (existing) existing.issues = Array.from(new Set([...existing.issues, ...donorIssues]))
      else donorAnomalies.push({ id: d.id, name: `${d.firstName || ''} ${d.lastName || ''}`.trim(), email: d.email, issues: donorIssues })
    }
  }

  return { donorAnomalies, donationAnomalies, donationStats: { ...donationStats, threshold: donationThreshold } }
}

export default { scanAnomalies }
