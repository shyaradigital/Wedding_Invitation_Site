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

