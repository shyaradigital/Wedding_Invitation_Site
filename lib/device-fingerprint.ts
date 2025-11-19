/**
 * Device Fingerprinting Utility
 * Generates a stable device ID based on browser characteristics
 */

export interface FingerprintData {
  userAgent: string
  screenResolution: string
  timezone: string
  platform: string
  canvasHash: string
  localStorageId: string
}

export async function generateDeviceFingerprint(): Promise<string> {
  if (typeof window === 'undefined') {
    throw new Error('Device fingerprinting can only be done in the browser')
  }

  const data: Partial<FingerprintData> = {
    userAgent: navigator.userAgent,
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    platform: navigator.platform,
  }

  // Generate canvas fingerprint
  try {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.textBaseline = 'top'
      ctx.font = '14px Arial'
      ctx.fillText('Device fingerprint 🎨', 2, 2)
      data.canvasHash = canvas.toDataURL()
    }
  } catch (e) {
    data.canvasHash = 'canvas-not-supported'
  }

  // Get or create localStorage ID
  const storageKey = 'device_fingerprint_id'
  let localStorageId = localStorage.getItem(storageKey)
  if (!localStorageId) {
    localStorageId = generateRandomId()
    localStorage.setItem(storageKey, localStorageId)
  }
  data.localStorageId = localStorageId

  // Hash all the data together
  const fingerprintString = JSON.stringify(data)
  return await hashString(fingerprintString)
}

async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(str)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

function generateRandomId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

