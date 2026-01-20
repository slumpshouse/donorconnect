/**
 * Retention Risk Badge Component
 */

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export function RetentionRiskBadge({ risk, className }) {
  const raw = risk == null ? '' : String(risk)
  const normalized = raw.trim().replace(/[-\s]+/g, '_').toUpperCase()

  // Map internal enum levels to the 3 labels requested for the UI.
  // Prisma enum includes UNKNOWN/LOW/MEDIUM/HIGH/CRITICAL.
  const map = {
    LOW: {
      label: 'Likely to return',
      classes: 'bg-green-100 text-green-800 risk-green success green',
      variant: 'default',
    },
    UNKNOWN: {
      label: 'Likely to return',
      classes: 'bg-green-100 text-green-800 risk-green success green',
      variant: 'default',
    },
    MEDIUM: {
      label: 'At risk',
      classes: 'bg-yellow-100 text-yellow-800 risk-yellow warning yellow',
      variant: 'default',
    },
    HIGH: {
      label: 'High risk',
      classes: 'bg-red-100 text-red-800 risk-red destructive red critical',
      variant: 'destructive',
    },
    CRITICAL: {
      label: 'High risk',
      classes: 'bg-red-100 text-red-800 risk-red destructive red critical',
      variant: 'destructive',
    },

    // Support passing the already-formatted label (defensive)
    LIKELY_TO_RETURN: {
      label: 'Likely to return',
      classes: 'bg-green-100 text-green-800 risk-green success green',
      variant: 'default',
    },
    AT_RISK: {
      label: 'At risk',
      classes: 'bg-yellow-100 text-yellow-800 risk-yellow warning yellow',
      variant: 'default',
    },
    HIGH_RISK: {
      label: 'High risk',
      classes: 'bg-red-100 text-red-800 risk-red destructive red critical',
      variant: 'destructive',
    },
  }

  const entry = map[normalized]
  const label = entry ? entry.label : 'At risk'
  const classes = entry ? entry.classes : 'bg-yellow-100 text-yellow-800 risk-yellow warning yellow'
  const variant = entry ? entry.variant : 'default'

  return (
    <Badge variant={variant} className={cn(classes, className)} role="status" aria-label={`Retention risk: ${label}`}>
      {label}
    </Badge>
  )
}

// TODO: Example usage:
// <RetentionRiskBadge risk="LOW" />
// <RetentionRiskBadge risk="HIGH" className="ml-2" />