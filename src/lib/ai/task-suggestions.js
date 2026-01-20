// AI / heuristic task suggestions for donor retention
//
// Output format is intentionally UI-friendly:
// { id, donorId, donorName, title, reason, priority, dueDate, trigger, urgencyScore }

function coerceDate(value) {
  if (!value) return null
  const d = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(d.getTime())) return null
  return d
}

function daysSince(date) {
  const d = coerceDate(date)
  if (!d) return null
  const ms = Date.now() - d.getTime()
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)))
}

function formatDateShort(date) {
  const d = coerceDate(date)
  if (!d) return null
  return d.toLocaleDateString()
}

function addDays(days) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d
}

export function suggestTasksForDonor({ donor, lastDonationDate, lastInteractionDate }) {
  const donorId = donor?.id
  const donorName = donor ? `${donor.firstName || ''} ${donor.lastName || ''}`.trim() : ''

  const totalGifts = Number(donor?.totalGifts ?? 0)
  const totalAmount = Number(donor?.totalAmount ?? 0)

  const daysSinceDonation = daysSince(lastDonationDate || donor?.lastGiftDate)
  // Interactions are optional context, but task suggestions should remain donation-driven.
  const daysSinceInteraction = daysSince(lastInteractionDate)

  const suggestions = []

  // 1) Recent donation -> thank you
  if (daysSinceDonation != null && daysSinceDonation <= 7) {
    suggestions.push({
      id: `thank-you:${donorId}:${String(lastDonationDate || donor?.lastGiftDate || '').slice(0, 10)}`,
      donorId,
      donorName,
      title: 'Send thank-you message after recent donation',
      reason: `A recent donation was recorded${formatDateShort(lastDonationDate || donor?.lastGiftDate) ? ` on ${formatDateShort(lastDonationDate || donor?.lastGiftDate)}` : ''}. Best practice for donor retention.`,
      priority: 'MEDIUM',
      dueDate: addDays(1),
      trigger: 'recent_donation',
      urgencyScore: 90,
    })
  }

  // 2) First-to-second gift conversion follow-up
  if (totalGifts === 1 && daysSinceDonation != null && daysSinceDonation >= 30 && daysSinceDonation <= 120) {
    suggestions.push({
      id: `second-gift:${donorId}:${daysSinceDonation}`,
      donorId,
      donorName,
      title: 'Follow up to encourage a second gift',
      reason: `Donor has only 1 gift and it has been ${daysSinceDonation} days since their last donation. A timely follow-up can improve conversion to a second gift.`,
      priority: 'HIGH',
      dueDate: addDays(0),
      trigger: 'first_to_second',
      urgencyScore: 95,
    })
  }

  // 3) 90+ days of no donations AND no interactions -> inactivity follow-up
  // 3) Donation-based follow-ups as time passes after the last gift
  if (daysSinceDonation != null && daysSinceDonation >= 30 && daysSinceDonation < 60) {
    suggestions.push({
      id: `impact-update:${donorId}:${daysSinceDonation}`,
      donorId,
      donorName,
      title: 'Send an impact update after the last donation',
      reason: `It has been ${daysSinceDonation} days since the last donation. An impact update can keep the relationship warm.`,
      priority: 'MEDIUM',
      dueDate: addDays(1),
      trigger: 'donation_followup_30_60',
      urgencyScore: 70,
    })
  }

  if (daysSinceDonation != null && daysSinceDonation >= 60 && daysSinceDonation < 90) {
    suggestions.push({
      id: `engagement-60:${donorId}:${daysSinceDonation}`,
      donorId,
      donorName,
      title: 'Share an update or invite after the last donation',
      reason: `It has been ${daysSinceDonation} days since the last donation. A light-touch update or invitation can improve retention.`,
      priority: 'MEDIUM',
      dueDate: addDays(2),
      trigger: 'donation_followup_60_90',
      urgencyScore: 78,
    })
  }

  if (daysSinceDonation != null && daysSinceDonation >= 90) {
    const interactionPart =
      daysSinceInteraction == null
        ? ''
        : daysSinceInteraction >= 90
          ? ` No interaction in ${daysSinceInteraction} days.`
          : ''

    suggestions.push({
      id: `donation-inactivity:${donorId}:${daysSinceDonation}`,
      donorId,
      donorName,
      title: `Follow up (${daysSinceDonation} days since last donation)`,
      reason: `No donation in ${daysSinceDonation} days detected.${interactionPart}`,
      priority: 'HIGH',
      dueDate: addDays(0),
      trigger: 'donation_inactivity_90_plus',
      urgencyScore: 96,
    })
  }

  // 4) Long donation gap and meaningful lifetime giving -> personal call
  if (daysSinceDonation != null && daysSinceDonation >= 180 && totalAmount >= 500) {
    suggestions.push({
      id: `reengage-call:${donorId}:${daysSinceDonation}`,
      donorId,
      donorName,
      title: 'Make a personal check-in call',
      reason: `It has been ${daysSinceDonation} days since the last donation and lifetime giving is $${totalAmount.toFixed(2)}. A personal touch can help re-engage.`,
      priority: 'HIGH',
      dueDate: addDays(1),
      trigger: 'long_donation_gap_value',
      urgencyScore: 92,
    })
  }

  // De-dupe by title, keep highest urgency
  const byTitle = new Map()
  for (const s of suggestions) {
    const prev = byTitle.get(s.title)
    if (!prev || (s.urgencyScore ?? 0) > (prev.urgencyScore ?? 0)) byTitle.set(s.title, s)
  }

  return Array.from(byTitle.values()).sort((a, b) => (b.urgencyScore ?? 0) - (a.urgencyScore ?? 0))
}
