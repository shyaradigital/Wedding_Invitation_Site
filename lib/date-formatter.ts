/**
 * Utility functions for formatting dates and times in written style
 * as specified for the wedding invitation pages
 */

/**
 * Converts a date to written format: "20th Day of March, 2026"
 */
export function formatWrittenDate(date: Date): string {
  const day = date.getDate()
  const month = date.toLocaleDateString('en-US', { month: 'long' })
  const year = date.getFullYear()

  // Get ordinal suffix (st, nd, rd, th)
  const ordinal = getOrdinalSuffix(day)
  const dayWithOrdinal = `${day}${ordinal}`

  return `${dayWithOrdinal} Day of ${month}, ${year}`
}

/**
 * Converts a time string to written format:
 * "6 PM" → "Six O'Clock in the evening"
 * "10 AM" → "Ten O'Clock in the morning"
 * "5 PM" → "Five O'Clock in the evening"
 */
export function formatWrittenTime(time: string): string {
  // Normalize time string (remove spaces, convert to uppercase)
  const normalized = time.trim().toUpperCase().replace(/\s+/g, '')

  // Extract hour and period (AM/PM)
  const match = normalized.match(/^(\d{1,2})(AM|PM)$/)
  if (!match) {
    // If format doesn't match, return original
    return time
  }

  const hour = parseInt(match[1], 10)
  const period = match[2]

  // Convert hour to words
  const hourWords = numberToWords(hour)

  // Determine time of day
  const timeOfDay = period === 'AM' ? 'morning' : 'evening'

  return `${hourWords} O'Clock in the ${timeOfDay}`
}

/**
 * Gets ordinal suffix for a number (st, nd, rd, th)
 */
function getOrdinalSuffix(num: number): string {
  const j = num % 10
  const k = num % 100

  if (j === 1 && k !== 11) return 'st'
  if (j === 2 && k !== 12) return 'nd'
  if (j === 3 && k !== 13) return 'rd'
  return 'th'
}

/**
 * Converts a number (1-12) to words
 */
function numberToWords(num: number): string {
  const words = [
    'Zero',
    'One',
    'Two',
    'Three',
    'Four',
    'Five',
    'Six',
    'Seven',
    'Eight',
    'Nine',
    'Ten',
    'Eleven',
    'Twelve',
  ]

  if (num >= 0 && num <= 12) {
    return words[num]
  }

  // Fallback for numbers outside range
  return num.toString()
}

/**
 * Formats a date string (like "March 20, 2026") to written format
 */
export function formatWrittenDateFromString(dateString: string): string {
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      return dateString
    }
    return formatWrittenDate(date)
  } catch {
    return dateString
  }
}

