'use client'

export const dynamic = 'force-dynamic'

import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { motion } from 'framer-motion'
import PageTransition from '@/components/PageTransition'
import InvitationPageLayout from '@/components/InvitationPageLayout'
import OrnamentalDivider from '@/components/OrnamentalDivider'
import FloatingPetals from '@/components/FloatingPetals'
import PhoneVerificationForm from '@/components/PhoneVerificationForm'
import AccessRestrictedPopup from '@/components/AccessRestrictedPopup'
import { useGuestAccess } from '@/lib/use-guest-access'

export default function VenueTravelPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string
  const [isVerifyingPhone, setIsVerifyingPhone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Use the shared access check hook
  const {
    accessState,
    guest,
    error: accessError,
    handlePhoneSubmit,
    showRestrictedPopup,
    setShowRestrictedPopup,
  } = useGuestAccess(token)

  const handlePhoneVerification = async (phone: string) => {
    setIsVerifyingPhone(true)
    setError(null)
    const success = await handlePhoneSubmit(phone)
    setIsVerifyingPhone(false)
    if (!success) {
      setError(accessError || 'Phone verification failed')
    }
  }

  // Show loading state
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

  // Show phone verification form
  if (accessState === 'phone-required' || accessState === 'phone-verification') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-wedding p-4">
        <PhoneVerificationForm
          onSubmit={handlePhoneVerification}
          isLoading={isVerifyingPhone}
        />
        {error && (
          <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}
        <AccessRestrictedPopup
          isOpen={showRestrictedPopup}
          onClose={() => setShowRestrictedPopup(false)}
          onTryAgain={() => setShowRestrictedPopup(false)}
        />
      </div>
    )
  }

  // Show access denied or wait for guest
  if (accessState === 'access-denied' || accessState !== 'granted' || !guest) {
    if (accessState === 'access-denied') {
      router.push(`/invite/${token}`)
      return null
    }
    return (
      <div className="min-h-screen flex items-center justify-center bg-wedding-cream">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wedding-gold mx-auto mb-4"></div>
          <p className="text-wedding-navy">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <InvitationPageLayout
      token={token}
      eventAccess={guest.eventAccess}
      guestName={guest.name}
    >
      <FloatingPetals />
      <PageTransition>
        <div className="min-h-screen bg-gradient-wedding relative">
          <div className="max-w-[640px] mx-auto px-4 sm:px-6 md:px-12 py-8 sm:py-12 md:py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              {/* Header */}
              <div className="text-center mb-8 sm:mb-12">
                <div className="flex justify-center mb-4">
                  <span className="text-4xl sm:text-5xl">📍</span>
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-script text-wedding-navy mb-4 sm:mb-6">
                  Travel & Venue Information
                </h1>
                <OrnamentalDivider variant="ornate" />
              </div>

              {/* Content Sections */}
              <div className="space-y-6 sm:space-y-8">
                {/* Airport Information */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white/80 rounded-xl p-6 sm:p-8 border-2 border-wedding-gold/30 shadow-lg"
                >
                  <div className="flex items-center mb-4">
                    <span className="text-2xl mr-3">✈️</span>
                    <h2 className="text-2xl sm:text-3xl font-display text-wedding-navy">
                      Airport Information
                    </h2>
                  </div>
                  <OrnamentalDivider variant="simple" className="mb-4" />
                  <p className="text-base sm:text-lg md:text-xl font-serif text-gray-700 leading-relaxed">
                    Nearest Airport is John Wayne Airport (SNA) and nearest International Airport is Los Angeles International Airport (LAX)
                  </p>
                </motion.div>

                {/* Shuttle Contact Information */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white/80 rounded-xl p-6 sm:p-8 border-2 border-wedding-gold/30 shadow-lg"
                >
                  <p className="text-base sm:text-lg md:text-xl font-serif text-gray-700 leading-relaxed text-left">
                    DoubleTree by Hilton Hotel Irvine – Spectrum provides complimentary shuttle from John Wayne Airport. Guests are requested to call <span className="font-semibold">949-471-8888</span> upon arrival. Guests arriving at LAX can make their own travel arrangement to come to the hotel.
                  </p>
                </motion.div>

                {/* Venue Information */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="bg-white/80 rounded-xl p-6 sm:p-8 border-2 border-wedding-gold/30 shadow-lg"
                >
                  <div className="flex items-center mb-4">
                    <span className="text-2xl mr-3">🏨</span>
                    <h2 className="text-2xl sm:text-3xl font-display text-wedding-navy">
                      Venue
                    </h2>
                  </div>
                  <OrnamentalDivider variant="simple" className="mb-4" />
                  <p className="text-base sm:text-lg md:text-xl font-serif font-semibold text-gray-800 mb-2">
                    DoubleTree by Hilton Hotel Irvine – Spectrum
                  </p>
                  <p className="text-sm sm:text-base md:text-lg font-serif text-gray-700 mb-4">
                    90 Pacifica, Irvine, CA 92618
                  </p>
                  {/* Google Maps Embed */}
                  <div className="rounded-lg overflow-hidden border-2 border-wedding-gold/30 shadow-lg mt-4">
                    <iframe
                      src="https://www.google.com/maps?q=DoubleTree+by+Hilton+Hotel+Irvine+Spectrum+90+Pacifica+Irvine+CA+92618&output=embed"
                      width="100%"
                      height="240"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="w-full"
                      title="Venue Location"
                    ></iframe>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </PageTransition>
    </InvitationPageLayout>
  )
}
