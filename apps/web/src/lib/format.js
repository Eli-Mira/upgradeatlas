// Locale-aware formatting. Never hardcode a date or number pattern.

const LOCALE_TAG = { ar: 'ar-EG', en: 'en-EG' }

export function localeTag(key) {
  return LOCALE_TAG[key] ?? LOCALE_TAG.en
}

/** EGP money, or null when the value is genuinely unknown (never 0). */
export function formatEgp(value, localeKey) {
  if (value === null || value === undefined || value === '') return null
  const amount = Number(value)
  if (!Number.isFinite(amount)) return null
  return new Intl.NumberFormat(localeTag(localeKey), {
    style: 'currency',
    currency: 'EGP',
    maximumFractionDigits: 2,
  }).format(amount)
}

/** A plain count. Unknown stays unknown. */
export function formatCount(value, localeKey) {
  if (value === null || value === undefined) return null
  const amount = Number(value)
  if (!Number.isFinite(amount)) return null
  return new Intl.NumberFormat(localeTag(localeKey)).format(amount)
}

export function formatDateTime(value, localeKey) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return new Intl.DateTimeFormat(localeTag(localeKey), {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

/**
 * Compatibility outcomes are a closed set. `unknown` must stay visually and
 * textually distinct from a negative answer.
 */
export function outcomeTone(outcome) {
  switch (outcome) {
    case 'supported':
      return 'signal'
    case 'unsupported':
      return 'stop'
    case 'conflicting':
      return 'caution'
    default:
      return 'neutral'
  }
}
