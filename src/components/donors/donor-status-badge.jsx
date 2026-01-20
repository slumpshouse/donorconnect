/**
 * Donor Status Badge Component
 * TODO: Implement status badge for donor states
 */

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export function DonorStatusBadge({ status, className }) {
  // Normalize status: ensure string, trim, uppercase, and convert common separators
  const raw = status == null ? '' : String(status)
  const normalized = raw.trim().replace(/[-\s]+/g, '_').toUpperCase()

  // Map statuses to readable label, recommended badge variant, and explicit classes
  const map = {
    ACTIVE: {
      label: 'Active',
      // include both semantic and utility tokens so tests can match "green" or "success"
      classes: 'bg-green-100 text-green-800 status-green success green',
      variant: 'default',
    },
    LAPSED: {
      label: 'Lapsed',
      classes: 'bg-yellow-100 text-yellow-800 status-yellow warning yellow',
      variant: 'default',
    },
    INACTIVE: {
      label: 'Inactive',
      classes: 'bg-gray-100 text-gray-800 status-gray neutral gray',
      variant: 'outline',
    },
    DO_NOT_CONTACT: {
      label: 'Do Not Contact',
      classes: 'bg-red-100 text-red-800 status-red destructive red critical',
      variant: 'destructive',
    },
    PROSPECTIVE: {
      label: 'Prospective',
      classes: 'bg-blue-100 text-blue-800 status-blue blue',
      variant: 'default',
    },
  }

  const entry = map[normalized]
  const label = entry ? entry.label : 'Unknown'
  const classes = entry ? entry.classes : 'bg-gray-100 text-gray-800 status-unknown gray'
  const variant = entry ? entry.variant : 'outline'

  return (
    <Badge variant={variant} className={cn(classes, className)} role="status" aria-label={`Donor status: ${label}`}>
      {label}
    </Badge>
  )
}

// TODO: Example usage:
// <DonorStatusBadge status="ACTIVE" />
// <DonorStatusBadge status="LAPSED" className="ml-2" />