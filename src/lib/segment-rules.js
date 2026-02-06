// Helpers for segment rule evaluation into Prisma Donor where clauses

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function normalizeOperator(op) {
  return typeof op === 'string' ? op.trim() : ''
}

function normalizeEnumValue(field, value) {
  if (typeof value !== 'string') return null
  const normalized = value.trim().toUpperCase()
  if (!normalized) return null

  if (field === 'status') {
    const allowed = new Set(['ACTIVE', 'LAPSED', 'INACTIVE', 'DO_NOT_CONTACT'])
    return allowed.has(normalized) ? normalized : null
  }

  if (field === 'retentionRisk') {
    const allowed = new Set(['UNKNOWN', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
    return allowed.has(normalized) ? normalized : null
  }

  return null
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
  const numericFields = new Set(['totalGifts', 'totalAmount'])
  const enumFields = new Set(['status', 'retentionRisk'])
  const dateFields = new Set(['firstGiftDate', 'lastGiftDate'])
  const stringFields = new Set(['email', 'firstName', 'lastName'])

  const isNumeric = numericFields.has(field)
  const isEnum = enumFields.has(field)
  const isDate = dateFields.has(field)
  const isString = stringFields.has(field)

  if (!isNumeric && !isEnum && !isDate && !isString) return null

  // Guard: ignore empty string values which would produce an invalid/no-op filter
  if (typeof value === 'string' && value.trim() === '') return null

  if (operator === 'equals') {
    if (isString) return { [field]: { equals: String(value), mode: 'insensitive' } }
    if (isEnum) {
      const enumValue = normalizeEnumValue(field, value)
      if (!enumValue) return null
      return { [field]: enumValue }
    }
    return { [field]: value }
  }
  if (operator === 'notEquals') {
    if (isString) return { [field]: { not: { equals: String(value), mode: 'insensitive' } } }
    if (isEnum) {
      const enumValue = normalizeEnumValue(field, value)
      if (!enumValue) return null
      return { [field]: { not: enumValue } }
    }
    return { [field]: { not: value } }
  }

  if (operator === 'in') {
    const list = Array.isArray(value) ? value : []
    if (isEnum) {
      const normalized = list.map((v) => normalizeEnumValue(field, v)).filter(Boolean)
      if (normalized.length === 0) return null
      return { [field]: { in: normalized } }
    }
    if (list.length === 0) return null
    return { [field]: { in: list } }
  }

  if (operator === 'notIn') {
    const list = Array.isArray(value) ? value : []
    if (isEnum) {
      const normalized = list.map((v) => normalizeEnumValue(field, v)).filter(Boolean)
      if (normalized.length === 0) return null
      return { [field]: { notIn: normalized } }
    }
    if (list.length === 0) return null
    return { [field]: { notIn: list } }
  }

  if (isNumeric) {
    if (operator === 'greaterThan') return { [field]: { gt: value } }
    if (operator === 'greaterThanOrEqual') return { [field]: { gte: value } }
    if (operator === 'lessThan') return { [field]: { lt: value } }
    if (operator === 'lessThanOrEqual') return { [field]: { lte: value } }
  }

  if (isString) {
    if (operator === 'contains') {
      if (typeof value !== 'string') return null
      return { [field]: { contains: value, mode: 'insensitive' } }
    }

    if (operator === 'notContains') {
      if (typeof value !== 'string') return null
      return { [field]: { not: { contains: value, mode: 'insensitive' } } }
    }
  }

  if (isDate) {
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
