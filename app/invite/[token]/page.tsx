'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { useGuestAccess } from '@/lib/use-guest-access'
import PhoneVerificationForm from '@/components/PhoneVerificationForm'
import AccessRestrictedPopup from '@/components/AccessRestrictedPopup'
import GuestInviteLayout from '@/components/GuestInviteLayout'

const ADMIN_CONTACT = process.env.NEXT_PUBLIC_ADMIN_CONTACT || '---'

export default function InvitePage() {
  const params = useParams()
  const token = params.token as string

  const [isVerifying, setIsVerifying] = useState(false)

  // Use the shared access check hook
  const {
    accessState,
    guest,
    error,
    handlePhoneSubmit,
    showRestrictedPopup,
    setShowRestrictedPopup,
  } = useGuestAccess(token)

  const handlePhoneVerification = async (phoneOrEmail: string) => {
    setIsVerifying(true)
    const success = await handlePhoneSubmit(phoneOrEmail)
    setIsVerifying(false)
    if (!success) {
      // Error is already set by the hook
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
              href="mailto:invites@jayankitawedding.com"
              className="text-lg sm:text-xl font-semibold text-wedding-gold hover:text-wedding-gold/80 transition-colors inline-flex items-center"
            >
              invites@jayankitawedding.com
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
        <PhoneVerificationForm onSubmit={handlePhoneVerification} isLoading={isVerifying} />
        {error && (
          <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}
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

