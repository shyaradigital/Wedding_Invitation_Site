'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { generateDeviceFingerprint } from '@/lib/device-fingerprint'
import { getStoredPhone, setStoredPhone } from '@/lib/storage'
import { normalizePhoneNumber } from '@/lib/utils'
import PhoneVerificationForm from '@/components/PhoneVerificationForm'
import AccessRestrictedPopup from '@/components/AccessRestrictedPopup'
import GuestInviteLayout from '@/components/GuestInviteLayout'

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

const ADMIN_CONTACT = process.env.NEXT_PUBLIC_ADMIN_CONTACT || '---'

export default function InvitePage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string

  const [accessState, setAccessState] = useState<AccessState>('loading')
  const [guest, setGuest] = useState<Guest | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showRestrictedPopup, setShowRestrictedPopup] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)

  useEffect(() => {
    checkAccess()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])


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
          // Stored phone matches guest's phone - grant unlimited access
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

  const handlePhoneSubmit = async (phone: string) => {
    setIsVerifying(true)
    try {
      // Verify phone
      const verifyResponse = await fetch('/api/verify-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, phone }),
      })

      if (!verifyResponse.ok) {
        const data = await verifyResponse.json()
        if (verifyResponse.status === 403) {
          // Wrong phone number
          setShowRestrictedPopup(true)
          return
        }
        throw new Error(data.error || 'Phone verification failed')
      }

      const { success, isFirstTime } = await verifyResponse.json()

      if (success) {
        // Store phone in localStorage for future access
        setStoredPhone(token, phone)

        // Save device fingerprint
        try {
          const fingerprint = await generateDeviceFingerprint()
          const saveDeviceResponse = await fetch('/api/save-device', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, phone, fingerprint }),
          })

          if (!saveDeviceResponse.ok) {
            const data = await saveDeviceResponse.json()
            if (saveDeviceResponse.status === 403 && data.error === 'Device limit reached') {
              setError('Device limit reached. Please open from your original device.')
              setShowRestrictedPopup(true)
              return
            }
            throw new Error(data.error || 'Failed to save device')
          }

          // Update guest state
          if (guest) {
            setGuest({
              ...guest,
              phone,
              hasPhone: true,
            })
          }

          // Grant access
          setAccessState('granted')
        } catch (err) {
          console.error('Error saving device:', err)
          // Still grant access if phone is verified (phone is already stored in localStorage)
          setAccessState('granted')
        }
      }
    } catch (err) {
      console.error('Error verifying phone:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsVerifying(false)
    }
  }

  if (accessState === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-wedding-cream">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wedding-gold mx-auto mb-4"></div>
          <p className="text-wedding-navy">Loading...</p>
        </div>
      </div>
    )
  }

  if (accessState === 'access-denied') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-wedding p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full wedding-card rounded-2xl shadow-2xl p-6 sm:p-8 text-center"
        >
          <div className="text-5xl sm:text-6xl mb-4">🔒</div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-display text-wedding-navy mb-4">
            This Invitation Link is Not Valid
          </h1>
          <div className="wedding-divider max-w-32 mx-auto mb-6"></div>
          <p className="text-base sm:text-lg text-gray-700 mb-4 leading-relaxed">
            It looks like this link is invalid, expired, or already used on another device.
          </p>
          <p className="text-base sm:text-lg text-gray-700 mb-6 leading-relaxed">
            Please contact Ankita for a fresh invitation link.
          </p>
          <div className="bg-wedding-rose-pastel/30 rounded-lg p-4 border border-wedding-rose/20">
            <p className="text-sm sm:text-base text-gray-600 mb-2">
              Contact:
            </p>
            <a
              href={`tel:${ADMIN_CONTACT}`}
              className="text-lg sm:text-xl font-semibold text-wedding-gold hover:text-wedding-gold/80 transition-colors inline-flex items-center"
            >
              <span className="mr-2">📞</span>
              {ADMIN_CONTACT}
            </a>
          </div>
        </motion.div>
      </div>
    )
  }

  if (
    accessState === 'phone-required' ||
    accessState === 'phone-verification'
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-wedding-cream p-4">
        <PhoneVerificationForm onSubmit={handlePhoneSubmit} isLoading={isVerifying} />
        <AccessRestrictedPopup
          isOpen={showRestrictedPopup}
          onClose={() => setShowRestrictedPopup(false)}
          onTryAgain={() => setShowRestrictedPopup(false)}
          contactPhone={ADMIN_CONTACT}
        />
      </div>
    )
  }

  if (accessState === 'granted' && guest) {
    return <GuestInviteLayout guest={guest} token={token} />
  }

  return null
}

