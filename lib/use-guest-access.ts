import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { generateDeviceFingerprint } from './device-fingerprint'
import { getStoredPhone, setStoredPhone } from './storage'
import { normalizePhoneNumber } from './utils'

interface Guest {
  id: string
  name: string
  phone: string | null
  eventAccess: string[]
  allowedDevices: string[]
  hasPhone: boolean
  tokenUsedFirstTime: string | null
  maxDevicesAllowed: number
}

type AccessState =
  | 'loading'
  | 'phone-required'
  | 'phone-verification'
  | 'access-denied'
  | 'granted'

interface UseGuestAccessResult {
  accessState: AccessState
  guest: Guest | null
  error: string | null
  checkAccess: () => Promise<void>
  handlePhoneSubmit: (phone: string) => Promise<boolean>
  showRestrictedPopup: boolean
  setShowRestrictedPopup: (show: boolean) => void
}

export function useGuestAccess(token: string): UseGuestAccessResult {
  const router = useRouter()
  const [accessState, setAccessState] = useState<AccessState>('loading')
  const [guest, setGuest] = useState<Guest | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showRestrictedPopup, setShowRestrictedPopup] = useState(false)

  const checkAccess = async () => {
    try {
      // Verify token
      const verifyResponse = await fetch('/api/verify-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })

      if (!verifyResponse.ok) {
        const data = await verifyResponse.json()
        if (verifyResponse.status === 404 || verifyResponse.status === 410) {
          setError('This invitation link is not valid or has expired.')
          setAccessState('access-denied')
        } else {
          setError(data.error || 'Invalid token')
          setAccessState('access-denied')
        }
        return
      }

      const { guest: guestData } = await verifyResponse.json()
      setGuest(guestData)

      // If no phone, require phone input
      if (!guestData.hasPhone) {
        setAccessState('phone-required')
        return
      }

      // First, check localStorage for stored phone number
      const storedPhone = getStoredPhone(token)
      if (storedPhone) {
        // Phone is stored in localStorage - check if it matches guest's phone
        const normalizedStoredPhone = normalizePhoneNumber(storedPhone)
        const normalizedGuestPhone = guestData.phone ? normalizePhoneNumber(guestData.phone) : null

        if (normalizedGuestPhone && normalizedStoredPhone === normalizedGuestPhone) {
          // Stored phone matches guest's phone - grant access
          setAccessState('granted')
          return
        } else {
          // Stored phone doesn't match - someone shared the link with different phone
          // Require phone verification (will verify against database)
          setAccessState('phone-verification')
          return
        }
      }

      // No stored phone - check device fingerprint
      try {
        const fingerprint = await generateDeviceFingerprint()
        const allowedDevices = Array.isArray(guestData.allowedDevices)
          ? guestData.allowedDevices
          : []

        if (allowedDevices.includes(fingerprint)) {
          // Device is allowed - store phone for future access
          if (guestData.phone) {
            setStoredPhone(token, guestData.phone)
          }
          setAccessState('granted')
        } else {
          // New device - require phone verification
          setAccessState('phone-verification')
        }
      } catch (err) {
        console.error('Error generating fingerprint:', err)
        // Fallback to phone verification
        setAccessState('phone-verification')
      }
    } catch (err) {
      console.error('Error checking access:', err)
      setError('An error occurred. Please try again.')
      setAccessState('access-denied')
    }
  }

  const handlePhoneSubmit = async (phone: string): Promise<boolean> => {
    try {
      // Verify phone matches guest's phone in database
      const verifyResponse = await fetch('/api/verify-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, phone }),
      })

      if (!verifyResponse.ok) {
        const data = await verifyResponse.json()
        setError(data.error || 'Phone verification failed')
        return false
      }

      const { success, isFirstTime } = await verifyResponse.json()

      if (!success) {
        // Phone doesn't match database - show restricted popup
        setShowRestrictedPopup(true)
        setError('Phone number does not match our records')
        return false
      }

      // Phone verified - save device fingerprint
      try {
        const fingerprint = await generateDeviceFingerprint()
        const saveDeviceResponse = await fetch('/api/save-device', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, phone, fingerprint }),
        })

        if (!saveDeviceResponse.ok) {
          const data = await saveDeviceResponse.json()
          if (data.error?.includes('limit')) {
            setError('Device limit reached for this invitation')
            return false
          }
        }

        // Store phone for future access
        const normalizedPhone = normalizePhoneNumber(phone)
        setStoredPhone(token, normalizedPhone)

        // Grant access
        setAccessState('granted')
        return true
      } catch (err) {
        console.error('Error saving device:', err)
        // Still grant access if device save fails
        setAccessState('granted')
        return true
      }
    } catch (err) {
      console.error('Error verifying phone:', err)
      setError('An error occurred. Please try again.')
      return false
    }
  }

  useEffect(() => {
    if (token) {
      checkAccess()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  return {
    accessState,
    guest,
    error,
    checkAccess,
    handlePhoneSubmit,
    showRestrictedPopup,
    setShowRestrictedPopup,
  }
}

