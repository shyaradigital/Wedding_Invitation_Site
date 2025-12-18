import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { generateDeviceFingerprint } from './device-fingerprint'
import { getStoredPhone, setStoredPhone, clearStoredPhone, setAdminPreview, isAdminPreview } from './storage'
import { normalizePhoneNumber, validateEmail } from './utils'

interface Guest {
  id: string
  name: string
  phone: string | null
  email: string | null
  eventAccess: string[]
  allowedDevices: string[]
  hasPhone: boolean
  hasEmail?: boolean
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
  handlePhoneSubmit: (phoneOrEmail: string) => Promise<boolean>
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
      // Special handling for admin-preview token
      if (token === 'admin-preview') {
        // Check if admin preview is already set in localStorage
        if (isAdminPreview(token)) {
          // Grant immediate access for admin preview
          setGuest({
            id: 'admin-preview',
            name: 'Admin Preview',
            phone: null,
            email: null,
            eventAccess: ['mehndi', 'wedding', 'reception'],
            allowedDevices: [],
            hasPhone: false,
            hasEmail: false,
            tokenUsedFirstTime: null,
            maxDevicesAllowed: 999,
          })
          setAccessState('granted')
          return
        }

        // First time accessing admin-preview - verify with API
        // This ensures admin is authenticated on initial access
        const verifyResponse = await fetch('/api/verify-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store',
          body: JSON.stringify({ token }),
        })

        if (!verifyResponse.ok) {
          const data = await verifyResponse.json()
          setError(data.error || 'Admin preview access denied. Please log in as admin.')
          setAccessState('access-denied')
          return
        }

        const { guest: guestData } = await verifyResponse.json()
        
        // Verify this is the admin-preview guest
        if (guestData.id === 'admin-preview') {
          // Set admin preview flag in localStorage for future access
          setAdminPreview(token)
          setGuest(guestData)
          setAccessState('granted')
          return
        }
      }

      // Verify token for regular guests
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

      // If no phone and no email, require phone/email input
      if (!guestData.hasPhone && !guestData.hasEmail) {
        setAccessState('phone-required')
        return
      }

      // First, check localStorage for stored phone or email
      const storedPhoneOrEmail = getStoredPhone(token)
      if (storedPhoneOrEmail) {
        // Phone or email is stored in localStorage - check if it matches guest's phone or email
        const isStoredEmail = validateEmail(storedPhoneOrEmail)
        const normalizedStored = isStoredEmail 
          ? storedPhoneOrEmail.trim().toLowerCase()
          : normalizePhoneNumber(storedPhoneOrEmail)
        
        const normalizedGuestPhone = guestData.phone ? normalizePhoneNumber(guestData.phone) : null
        const normalizedGuestEmail = guestData.email ? guestData.email.trim().toLowerCase() : null

        const phoneMatches = normalizedGuestPhone && !isStoredEmail && normalizedStored === normalizedGuestPhone
        const emailMatches = normalizedGuestEmail && isStoredEmail && normalizedStored === normalizedGuestEmail

        if (phoneMatches || emailMatches) {
          // Stored phone/email matches guest's phone/email - grant access
          setAccessState('granted')
          return
        } else {
          // Stored phone/email doesn't match database - clear localStorage and require re-verification
          // This handles the case where admin updated the guest's phone/email
          clearStoredPhone(token)
          // Require phone/email verification (will verify against database)
          setAccessState('phone-verification')
          return
        }
      }

      // No stored phone/email - check device fingerprint
      try {
        const fingerprint = await generateDeviceFingerprint()
        const allowedDevices = Array.isArray(guestData.allowedDevices)
          ? guestData.allowedDevices
          : []

        if (allowedDevices.includes(fingerprint)) {
          // Device is allowed - store phone or email for future access
          if (guestData.phone) {
            setStoredPhone(token, guestData.phone)
          } else if (guestData.email) {
            setStoredPhone(token, guestData.email)
          }
          setAccessState('granted')
        } else {
          // New device - require phone/email verification
          setAccessState('phone-verification')
        }
      } catch (err) {
        console.error('Error generating fingerprint:', err)
        // Fallback to phone/email verification
        setAccessState('phone-verification')
      }
    } catch (err) {
      console.error('Error checking access:', err)
      setError('An error occurred. Please try again.')
      setAccessState('access-denied')
    }
  }

  const handlePhoneSubmit = async (phoneOrEmail: string): Promise<boolean> => {
    try {
      // Verify phone or email matches guest's phone or email in database
      const verifyResponse = await fetch('/api/verify-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify({ token, phoneOrEmail }),
      })

      if (!verifyResponse.ok) {
        const data = await verifyResponse.json()
        setError(data.error || 'Phone or email verification failed')
        return false
      }

      const { success, isFirstTime } = await verifyResponse.json()

      if (!success) {
        // Phone/email doesn't match database - show restricted popup
        setShowRestrictedPopup(true)
        setError('Phone number or email does not match. Please contact Ankita for your invitation link.')
        return false
      }

      // Phone/email verified - save device fingerprint
      try {
        const fingerprint = await generateDeviceFingerprint()
        const saveDeviceResponse = await fetch('/api/save-device', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store',
          body: JSON.stringify({ token, phoneOrEmail, fingerprint }),
        })

        if (!saveDeviceResponse.ok) {
          const data = await saveDeviceResponse.json()
          if (data.error?.includes('limit')) {
            setError('Device limit reached for this invitation')
            return false
          }
        }

        // Store phone or email for future access
        setStoredPhone(token, phoneOrEmail)

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
      console.error('Error verifying phone or email:', err)
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

