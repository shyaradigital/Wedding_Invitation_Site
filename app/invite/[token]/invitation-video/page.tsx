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
import YouTubeVideoPlayer from '@/components/YouTubeVideoPlayer'
import WistiaVideoPlayer from '@/components/WistiaVideoPlayer'

export default function InvitationVideoPage() {
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

  // Determine which video to show based on guest type
  const isAllEvents =
    guest.eventAccess.includes('mehndi') &&
    guest.eventAccess.includes('wedding') &&
    guest.eventAccess.includes('reception')

  // Get YouTube video ID for reception-only guests
  // Demo video ID as fallback
  const receptionOnlyVideoId = process.env.NEXT_PUBLIC_YOUTUBE_RECEPTION_ONLY_VIDEO_ID || 'dQw4w9WgXcQ' // Demo: Replace with actual video ID

  return (
    <InvitationPageLayout
      token={token}
      eventAccess={guest.eventAccess}
      guestName={guest.name}
    >
      <FloatingPetals />
      <PageTransition>
        <div className="min-h-screen bg-gradient-rose-cream relative">
          <div className="max-w-[900px] mx-auto px-4 sm:px-6 md:px-12 py-8 sm:py-12 md:py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Header Section */}
              <div className="text-center mb-8 sm:mb-12">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="mb-6"
                >
                  <span className="text-5xl sm:text-6xl md:text-7xl">🎬</span>
                </motion.div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-script text-wedding-navy mb-4 sm:mb-6">
                  Our Invitation
                </h1>
                <OrnamentalDivider variant="ornate" className="mb-4 sm:mb-6" />
                <p className="text-lg sm:text-xl md:text-2xl font-serif text-gray-700 leading-relaxed max-w-2xl mx-auto">
                  A special message from Jay and Ankita
                </p>
              </div>

              {/* Message Section - Moved above video player */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-center mb-8"
              >
                <div className="wedding-card rounded-2xl p-6 sm:p-8 border-2 border-wedding-gold/30">
                  <p className="text-base sm:text-lg md:text-xl font-serif text-gray-700 leading-relaxed">
                    We are thrilled to share this moment with you and look forward to celebrating
                    together on our special day.
                  </p>
                  <OrnamentalDivider variant="simple" className="my-6" />
                  <p className="text-lg sm:text-xl md:text-2xl font-script text-wedding-gold">
                    With Love,
                  </p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-script text-wedding-navy mt-2">
                    Jay & Ankita
                  </p>
                </div>
              </motion.div>

              {/* Video Player Card */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="wedding-card rounded-3xl p-4 sm:p-6 md:p-8 lg:p-12"
                style={{
                  background: 'linear-gradient(135deg, #FFFEF7 0%, #FAF9F6 100%)',
                  border: '2px solid rgba(212, 175, 55, 0.3)',
                }}
              >
                {/* Decorative corners */}
                <div className="absolute top-0 left-0 w-16 h-16 opacity-30">
                  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M32 8C20 8 12 16 12 28C12 40 20 48 32 48C44 48 52 40 52 28C52 16 44 8 32 8Z"
                      fill="#D4AF37"
                      opacity="0.3"
                    />
                  </svg>
                </div>
                <div className="absolute top-0 right-0 w-16 h-16 opacity-30 transform rotate-90">
                  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M32 8C20 8 12 16 12 28C12 40 20 48 32 48C44 48 52 40 52 28C52 16 44 8 32 8Z"
                      fill="#D4AF37"
                      opacity="0.3"
                    />
                  </svg>
                </div>
                <div className="absolute bottom-0 left-0 w-16 h-16 opacity-30 transform -rotate-90">
                  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M32 8C20 8 12 16 12 28C12 40 20 48 32 48C44 48 52 40 52 28C52 16 44 8 32 8Z"
                      fill="#D4AF37"
                      opacity="0.3"
                    />
                  </svg>
                </div>
                <div className="absolute bottom-0 right-0 w-16 h-16 opacity-30 transform rotate-180">
                  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M32 8C20 8 12 16 12 28C12 40 20 48 32 48C44 48 52 40 52 28C52 16 44 8 32 8Z"
                      fill="#D4AF37"
                      opacity="0.3"
                    />
                  </svg>
                </div>

                {/* Video Player */}
                <div className="relative z-10 w-full">
                  {isAllEvents ? (
                    <WistiaVideoPlayer />
                  ) : (
                    <YouTubeVideoPlayer videoId={receptionOnlyVideoId} />
                  )}
                </div>

                {/* Instructions */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="mt-6 sm:mt-8 text-center"
                >
                  <p className="text-sm sm:text-base text-gray-600 font-serif italic">
                    Click the play button to watch our special invitation
                  </p>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </PageTransition>
    </InvitationPageLayout>
  )
}

