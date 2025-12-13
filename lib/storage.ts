/**
 * LocalStorage utility functions for storing guest phone numbers or emails
 * Key format: guest_phone_${token}
 */

/**
 * Get stored phone number or email for a given token
 * @param token - Guest invitation token
 * @returns Stored phone number or email, or null if not found
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
 * Store phone number or email for a given token
 * @param token - Guest invitation token
 * @param phoneOrEmail - Phone number or email to store
 */
export function setStoredPhone(token: string, phoneOrEmail: string): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    const key = `guest_phone_${token}`
    localStorage.setItem(key, phoneOrEmail)
  } catch (error) {
    console.error('Error writing to localStorage:', error)
  }
}

/**
 * Clear stored phone number or email for a given token
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

/**
 * Set admin preview flag for a given token
 * @param token - Guest invitation token (should be 'admin-preview')
 */
export function setAdminPreview(token: string): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    const key = `admin_preview_${token}`
    const expiryTime = Date.now() + (24 * 60 * 60 * 1000) // 24 hours from now
    localStorage.setItem(key, expiryTime.toString())
  } catch (error) {
    console.error('Error writing admin preview to localStorage:', error)
  }
}

/**
 * Check if token is in admin preview mode
 * @param token - Guest invitation token
 * @returns true if admin preview is active and not expired, false otherwise
 */
export function isAdminPreview(token: string): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  try {
    const key = `admin_preview_${token}`
    const stored = localStorage.getItem(key)
    
    if (!stored) {
      return false
    }

    const expiryTime = parseInt(stored, 10)
    const now = Date.now()

    // Check if expired
    if (now > expiryTime) {
      localStorage.removeItem(key)
      return false
    }

    return true
  } catch (error) {
    console.error('Error reading admin preview from localStorage:', error)
    return false
  }
}

/**
 * Clear admin preview flag for a given token
 * @param token - Guest invitation token
 */
export function clearAdminPreview(token: string): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    const key = `admin_preview_${token}`
    localStorage.removeItem(key)
  } catch (error) {
    console.error('Error clearing admin preview from localStorage:', error)
  }
}

