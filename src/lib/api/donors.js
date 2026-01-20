// Business logic for donor operations
import { prisma } from '../db'

/**
 * TODO: Get a single donor by ID
 * @param {Object} params - Query parameters
 * @returns {Promise<Object|null>} Donor object or null
 */
export async function getDonor(params) {
  // TODO: Query single donor with related data (donations, interactions, tasks)
  // TODO: Calculate donor metrics (totalAmount, totalGifts, avgGift, lastGiftDate)
  // TODO: Return donor object or null
}

/**
 * TODO: Create a new donor
 * @param {Object} donorData - Donor data to create
 * @returns {Promise<Object>} Created donor object
 */
export async function createDonor(donorData) {
  // TODO: Create donor in database
  // TODO: Return created donor with calculated fields
}

/**
 * TODO: Update an existing donor
 * @param {Object} params - Update parameters (id, organizationId, data)
 * @returns {Promise<Object>} Updated donor object
 */
export async function updateDonor(params) {
  // TODO: Update donor in database
  // TODO: Recalculate metrics if needed
  // TODO: Return updated donor
}

/**
 * TODO: Delete a donor
 * @param {Object} params - Delete parameters (id, organizationId)
 */
export async function deleteDonor(params) {
  // TODO: Delete donor and related data
  // TODO: Handle cascade deletes appropriately
}

/**
 * TODO: Update donor metrics after donation changes
 * @param {string} donorId - Donor ID to update metrics for
 */
export async function updateDonorMetrics(donorId) {
  if (!donorId) return

  // Fetch donations for the donor
  const donations = await prisma.donation.findMany({ where: { donorId } })

  const totalGifts = Array.isArray(donations) ? donations.length : 0
  const totalAmount = (donations || []).reduce((sum, d) => sum + (Number(d.amount) || 0), 0)

  // donations may use 'receivedAt' in tests or 'date' in real schema
  const dates = (donations || []).map((d) => {
    return d.receivedAt ? new Date(d.receivedAt) : d.date ? new Date(d.date) : null
  }).filter(Boolean)

  const lastGiftDate = dates.length ? new Date(Math.max(...dates.map((d) => d.getTime()))) : null

  // Determine retention risk by days since last gift
  let retentionRisk = 'UNKNOWN'
  if (lastGiftDate) {
    const msPerDay = 24 * 60 * 60 * 1000
    const days = Math.floor((Date.now() - lastGiftDate.getTime()) / msPerDay)
    if (days > 365) retentionRisk = 'CRITICAL'
    else if (days > 180) retentionRisk = 'HIGH'
    else if (days > 90) retentionRisk = 'MEDIUM'
    else retentionRisk = 'LOW'
  }

  // Update donor record
  await prisma.donor.update({
    where: { id: donorId },
    data: {
      totalGifts,
      totalAmount,
      lastGiftDate,
      retentionRisk,
    },
  })
}