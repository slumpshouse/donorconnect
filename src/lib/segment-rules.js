// Helpers for segment rule evaluation into Prisma Donor where clauses

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function normalizeOperator(op) {
  return typeof op === 'string' ? op.trim() : ''
}

function buildLeafCondition(rule) {
  if (!isPlainObject(rule)) return null

  const field = typeof rule.field === 'string' ? rule.field.trim() : ''
  const operator = normalizeOperator(rule.operator)
  const value = rule.value

  if (!field || !operator) return null

  // Special computed fields
  if (field === 'hasRecurring') {
    const wantRecurring = Boolean(value)
    return wantRecurring
      ? { donations: { some: { type: 'RECURRING' } } }
      : { donations: { none: { type: 'RECURRING' } } }
  }

  // Basic donor fields
  const directFields = new Set([
    'totalGifts',
    'totalAmount',
    'status',
    'retentionRisk',
    'firstGiftDate',
    'lastGiftDate',
    'email',
    'firstName',
    'lastName',
  ])

  if (!directFields.has(field)) return null

  // Guard: ignore empty string values which would produce an invalid/no-op filter
  if (typeof value === 'string' && value.trim() === '') return null

  if (operator === 'equals') {
    // For string fields prefer case-insensitive equals; for others, pass raw
    if (typeof value === 'string') return { [field]: { equals: value, mode: 'insensitive' } }
    return { [field]: value }
  }
  if (operator === 'notEquals') {
    if (typeof value === 'string') return { [field]: { not: { equals: value, mode: 'insensitive' } } }
    return { [field]: { not: value } }
  }

  if (operator === 'in') {
    const list = Array.isArray(value) ? value : []
    return { [field]: { in: list } }
  }

  if (operator === 'notIn') {
    const list = Array.isArray(value) ? value : []
    return { [field]: { notIn: list } }
  }

  if (operator === 'greaterThan') return { [field]: { gt: value } }
  if (operator === 'greaterThanOrEqual') return { [field]: { gte: value } }
  if (operator === 'lessThan') return { [field]: { lt: value } }
  if (operator === 'lessThanOrEqual') return { [field]: { lte: value } }

  if (operator === 'contains') {
    if (typeof value !== 'string') return null
    return { [field]: { contains: value, mode: 'insensitive' } }
  }

  if (operator === 'notContains') {
    if (typeof value !== 'string') return null
    return { [field]: { not: { contains: value, mode: 'insensitive' } } }
  }

  if (operator === 'before') {
    const dt = value ? new Date(value) : null
    if (!dt || Number.isNaN(dt.getTime())) return null
    return { [field]: { lt: dt } }
  }

  if (operator === 'after') {
    const dt = value ? new Date(value) : null
    if (!dt || Number.isNaN(dt.getTime())) return null
    return { [field]: { gt: dt } }
  }

  return null
}

function buildDonorWhereFromSegmentRules(rules) {
  if (!rules) return {}

  // Support nested rules:
  // { and: [rule1, rule2] } or { or: [rule1, rule2] }
  if (isPlainObject(rules) && Array.isArray(rules.and)) {
    const parts = rules.and.map(buildDonorWhereFromSegmentRules).filter((w) => isPlainObject(w) && Object.keys(w).length)
    return parts.length ? { AND: parts } : {}
  }

  if (isPlainObject(rules) && Array.isArray(rules.or)) {
    const parts = rules.or.map(buildDonorWhereFromSegmentRules).filter((w) => isPlainObject(w) && Object.keys(w).length)
    return parts.length ? { OR: parts } : {}
  }

  // Leaf rule
  const leaf = buildLeafCondition(rules)
  return leaf || {}
}

export { buildDonorWhereFromSegmentRules }
