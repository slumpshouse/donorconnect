// Utility functions for shadcn/ui

import clsx from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// Format currency
export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

// Format date
export function formatDate(date) {
  if (date == null) return 'Invalid Date'
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return 'Invalid Date'
  const month = d.getMonth() + 1
  const day = d.getDate()
  const year = d.getFullYear()
  return `${month}/${day}/${year}`
}

// Format date and time
export function formatDateTime(date) {
  if (date == null) return 'Invalid Date'
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return 'Invalid Date'
  const month = d.getMonth() + 1
  const day = d.getDate()
  const year = d.getFullYear()
  let hours = d.getHours()
  const minutes = d.getMinutes().toString().padStart(2, '0')
  const ampm = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12
  hours = hours === 0 ? 12 : hours
  return `${month}/${day}/${year} ${hours}:${minutes} ${ampm}`
}
