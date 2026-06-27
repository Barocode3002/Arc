/** Format date to readable string */
export function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

/** Format date to short form (e.g., "Jun 26") */
export function formatDateShort(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/** Format time to 12h (e.g., "2:30 PM") */
export function formatTime(timeStr) {
  if (!timeStr) return ''
  const [hours, minutes] = timeStr.split(':')
  const h = parseInt(hours)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  return `${h12}:${minutes} ${ampm}`
}

/** Format currency in EGP */
export function formatCurrency(amount) {
  if (amount == null) return ''
  return `${Number(amount).toFixed(2)} EGP`
}

/** Generate a booking reference (e.g., ARC-A3X7K2) */
export function generateBookingRef() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let ref = ''
  for (let i = 0; i < 6; i++) {
    ref += chars[Math.floor(Math.random() * chars.length)]
  }
  return `ARC-${ref}`
}

/** Merge class names, filtering falsy values */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

/** Get badge color classes for booking status */
export function statusVariant(status) {
  const map = {
    pending: 'warning',
    confirmed: 'success',
    cancelled: 'danger',
    present: 'success',
    absent: 'danger',
    late: 'warning',
  }
  return map[status] || 'neutral'
}

/** Get badge color classes for menu badges */
export function menuBadgeVariant(badge) {
  const map = {
    bestseller: 'success',
    signature: 'info',
    seasonal: 'warning',
  }
  return map[badge] || 'neutral'
}

/** Check if stock is low */
export function isLowStock(currentStock, minStock) {
  return currentStock <= minStock
}

/** Get today's date in YYYY-MM-DD format */
export function getTodayDate() {
  return new Date().toISOString().split('T')[0]
}

/** Capitalize first letter */
export function capitalize(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/** Group array by key */
export function groupBy(arr, key) {
  return arr.reduce((groups, item) => {
    const val = item[key]
    groups[val] = groups[val] || []
    groups[val].push(item)
    return groups
  }, {})
}

/** Default cafe ID for MVP single-tenant mode */
export const DEFAULT_CAFE_ID = '1'
