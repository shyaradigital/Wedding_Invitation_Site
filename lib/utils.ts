import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateSecureToken(): string {
  // Generate a shorter token (12 characters) using alphanumeric characters
  // This provides 62^12 possible combinations (still very secure for invitation links)
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let token = ''
  
  if (typeof window !== 'undefined') {
    // Browser environment
    const array = new Uint8Array(12)
    crypto.getRandomValues(array)
    for (let i = 0; i < array.length; i++) {
      token += chars[array[i] % chars.length]
    }
  } else {
    // Node.js environment
    const crypto = require('crypto')
    const randomBytes = crypto.randomBytes(12)
    for (let i = 0; i < randomBytes.length; i++) {
      token += chars[randomBytes[i] % chars.length]
    }
  }
  
  return token
}

export function normalizePhoneNumber(phone: string): string {
  // Remove all non-digit characters
  return phone.replace(/\D/g, '')
}

export function validatePhoneNumber(phone: string): boolean {
  const normalized = normalizePhoneNumber(phone)
  return normalized.length >= 8 && normalized.length <= 15
}

export function validateEmail(email: string): boolean {
  // Basic email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.trim())
}

/**
 * Formats a phone number for WhatsApp links (wa.me)
 * Handles international numbers correctly, including Indian numbers without country code
 * 
 * @param phone - Phone number in any format (with/without country code, with/without +)
 * @returns Formatted phone number with country code (digits only, no + sign)
 */
export function formatPhoneForWhatsApp(phone: string): string {
  // Remove all non-digit characters
  let digits = phone.replace(/\D/g, '')
  
  if (!digits) {
    return ''
  }

  // Common country codes (1-3 digits)
  const countryCodes = [
    // 1 digit
    '1', // US, Canada
    '7', // Russia, Kazakhstan
    // 2 digits
    '20', '27', '30', '31', '32', '33', '34', '36', '39', '40', '41', '43', '44', '45', '46', '47', '48', '49',
    '51', '52', '53', '54', '55', '56', '57', '58', '60', '61', '62', '63', '64', '65', '66', '81', '82', '84', '86', '90', '91', '92', '93', '94', '95', '98',
    // 3 digits
    '212', '213', '216', '218', '220', '221', '222', '223', '224', '225', '226', '227', '228', '229', '230', '231', '232', '233', '234', '235', '236', '237', '238', '239',
    '240', '241', '242', '243', '244', '245', '246', '248', '249', '250', '251', '252', '253', '254', '255', '256', '257', '258', '260', '261', '262', '263', '264', '265',
    '266', '267', '268', '269', '290', '291', '297', '298', '299', '350', '351', '352', '353', '354', '355', '356', '357', '358', '359', '370', '371', '372', '373', '374',
    '375', '376', '377', '378', '380', '381', '382', '383', '385', '386', '387', '389', '420', '421', '423', '500', '501', '502', '503', '504', '505', '506', '507', '508',
    '509', '590', '591', '592', '593', '594', '595', '596', '597', '598', '599', '670', '672', '673', '674', '675', '676', '677', '678', '679', '680', '681', '682', '683',
    '684', '685', '686', '687', '688', '689', '690', '691', '692', '850', '852', '853', '855', '856', '880', '886', '960', '961', '962', '963', '964', '965', '966', '967',
    '968', '970', '971', '972', '973', '974', '975', '976', '977', '992', '993', '994', '995', '996', '998'
  ]

  // Check if number already starts with a known country code
  for (const code of countryCodes.sort((a, b) => b.length - a.length)) { // Sort by length descending
    if (digits.startsWith(code)) {
      // Check if the remaining digits make sense for that country
      const remaining = digits.substring(code.length)
      // Most countries have 7-15 digits after country code
      if (remaining.length >= 7 && remaining.length <= 15) {
        return digits // Already has country code
      }
    }
  }

  // If no country code detected, try to infer from number format
  // Indian numbers: 10 digits starting with 6, 7, 8, or 9
  if (digits.length === 10 && /^[6-9]/.test(digits)) {
    return '91' + digits // Add India country code
  }

  // US/Canada numbers: 10 digits (without country code)
  if (digits.length === 10 && /^[2-9]/.test(digits)) {
    return '1' + digits // Add US/Canada country code
  }

  // UK numbers: 10 digits starting with 7
  if (digits.length === 10 && /^7/.test(digits)) {
    return '44' + digits // Add UK country code
  }

  // If number is 8-15 digits and doesn't match above patterns, assume it already has country code
  if (digits.length >= 8 && digits.length <= 15) {
    return digits
  }

  // If number is less than 8 digits, it's likely incomplete or missing country code
  // For safety, return as-is (user should provide full number with country code)
  return digits
}

// Helper functions for JSON array handling (SQLite compatibility)
export function parseJsonArray<T>(value: any): T[] {
  if (Array.isArray(value)) return value
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }
  return []
}

export function ensureJsonArray(value: any): any[] {
  if (Array.isArray(value)) return value
  if (typeof value === 'string') {
    try {
      return JSON.parse(value)
    } catch {
      return []
    }
  }
  return []
}

