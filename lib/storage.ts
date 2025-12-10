/**
 * LocalStorage utility functions for storing guest phone numbers
 * Key format: guest_phone_${token}
 */

/**
 * Get stored phone number for a given token
 * @param token - Guest invitation token
 * @returns Stored phone number or null if not found
 */
export function getStoredPhone(token: string): string | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const key = `guest_phone_${token}`
    const stored = localStorage.getItem(key)
    return stored || null
  } catch (error) {
    console.error('Error reading from localStorage:', error)
    return null
  }
}

/**
 * Store phone number for a given token
 * @param token - Guest invitation token
 * @param phone - Phone number to store
 */
export function setStoredPhone(token: string, phone: string): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    const key = `guest_phone_${token}`
    localStorage.setItem(key, phone)
  } catch (error) {
    console.error('Error writing to localStorage:', error)
  }
}

/**
 * Clear stored phone number for a given token
 * @param token - Guest invitation token
 */
export function clearStoredPhone(token: string): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    const key = `guest_phone_${token}`
    localStorage.removeItem(key)
  } catch (error) {
    console.error('Error clearing localStorage:', error)
  }
}

