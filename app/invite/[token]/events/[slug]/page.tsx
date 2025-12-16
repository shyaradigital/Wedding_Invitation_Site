'use client'

export const dynamic = 'force-dynamic'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import PageTransition from '@/components/PageTransition'
import InvitationPageLayout from '@/components/InvitationPageLayout'
import OrnamentalDivider from '@/components/OrnamentalDivider'
import FloatingPetals from '@/components/FloatingPetals'
import StarParticles from '@/components/StarParticles'
import PhoneVerificationForm from '@/components/PhoneVerificationForm'
import AccessRestrictedPopup from '@/components/AccessRestrictedPopup'
import { useGuestAccess } from '@/lib/use-guest-access'
import { formatWrittenDate, formatWrittenTime, formatWrittenDateFromString } from '@/lib/date-formatter'

const eventInfo: Record<
  string,
  { title: string; icon: string; color: string }
> = {
  mehndi: {
    title: 'Mehndi',
    icon: '/icons/mehndi-icon.png',
    color: 'wedding-rose',
  },
  wedding: {
    title: 'Hindu Wedding Ceremony',
    icon: '/icons/wedding-icon.png',
    color: 'wedding-gold',
  },
  reception: {
    title: 'Reception',
    icon: '/icons/reception-icon.png',
    color: 'wedding-burgundy',
  },
}

// Event-specific content
const eventContent: Record<string, {
  date: string
  time: string
  programNote?: string
  note?: string
  attire: string
  venue: string
  venueDetails?: string
  address: string
  additionalInfo?: string
  cocktailHour?: string
  pherasDescription?: string
  baraatDescription?: string
  baraatTime?: string
}> = {
  mehndi: {
    date: '20th Day of March, 2026',
    time: 'Six O\'Clock in the Evening',
    attire: 'Casual',
    venue: 'DoubleTree by Hilton Hotel Irvine – Spectrum',
    venueDetails: 'Bridal lounge, DoubleTree',
    address: '90 Pacifica, Irvine, CA 92618',
    additionalInfo: 'Indian boxed vegetarian dinner will be served',
  },
  wedding: {
    date: '21st Day of March, 2026',
    time: 'Ten O\'Clock in the Morning',
    note: 'Lunch to be served after photo session',
    attire: 'Formal Indian Attire',
    venue: 'DoubleTree by Hilton Hotel Irvine – Spectrum',
    venueDetails: 'Poolside patio, DoubleTree',
    address: '90 Pacifica, Irvine, CA 92618',
    pherasDescription: 'The Wedding Ceremony unites two souls spiritually, mentally and physically. The bond of matrimony is sacred and the ceremony of marriage is conducted according to Vedic traditions.',
    baraatDescription: 'Baraat is an Indian wedding ceremony where the groom accompanied by his family and friends dance all the way to the bride\'s doorstep or wedding venue.',
    baraatTime: '30 minutes past 9 O\'Clock in the Morning',
    additionalInfo: 'No boxed gifts/registry',
  },
  reception: {
    date: '21st Day of March, 2026',
    time: 'Five O\'Clock in the Evening',
    note: 'Note: No boxed gifts / registry',
    attire: 'Formal Indian/Western Attire',
    venue: 'DoubleTree by Hilton Hotel Irvine – Spectrum',
    venueDetails: 'Ballroom, DoubleTree',
    address: '90 Pacifica, Irvine, CA 92618',
    cocktailHour: 'Half past Five O\'Clock in the Evening to Half past Six O\'Clock in the Evening',
  },
}

export default function EventDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string
  const slug = params.slug as string

  const [event, setEvent] = useState<any>(null)
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

  useEffect(() => {
    // Check if guest has access to this event
    if (accessState === 'granted' && guest) {
      if (!guest.eventAccess.includes(slug)) {
        router.push(`/invite/${token}`)
      }
    }
  }, [accessState, guest, slug, router, token])

  useEffect(() => {
    // Fetch event details with cache-busting to ensure fresh data
    fetch(`/api/events/${slug}?t=${Date.now()}`, { cache: 'no-store', headers: { 'Cache-Control': 'no-cache' } })
      .then((res) => res.json())
      .then((data) => {
        if (data.event) {
          const mergedEvent = {
            ...eventInfo[slug],
            ...data.event,
          }
          setEvent(mergedEvent)
        } else {
          // Fallback to default info
          const eventData = eventInfo[slug]
          if (eventData) {
            setEvent(eventData)
          }
        }
      })
      .catch((err) => {
        console.error('Error fetching event:', err)
        // Fallback to default info
        const eventData = eventInfo[slug]
        if (eventData) {
          setEvent(eventData)
        }
      })
  }, [token, slug, router])

  // Show loading state
  if (accessState === 'loading' || !event) {
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

  // Show access denied
  if (accessState === 'access-denied' || accessState !== 'granted' || !guest) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-wedding-cream">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wedding-gold mx-auto mb-4"></div>
          <p className="text-wedding-navy">Loading...</p>
        </div>
      </div>
    )
  }

  // Merge database event data with fallback content, prioritizing database values
  const fallbackContent = eventContent[slug] || eventContent.mehndi
  const isReception = slug === 'reception'
  const isMehendi = slug === 'mehndi'
  const isWedding = slug === 'wedding'
  
  const content = {
    ...fallbackContent,
    // Override with database values when they exist (not null/undefined/empty)
    date: event?.date ? formatWrittenDateFromString(event.date) : fallbackContent.date,
    time: event?.time || fallbackContent.time,
    venue: event?.venue || fallbackContent.venue,
    address: event?.address || fallbackContent.address,
    attire: event?.dressCode || fallbackContent.attire,
    // For Mehndi: keep additionalInfo (dinner info) separate from description
    // For Reception: remove additionalInfo since description is now at top
    // For Wedding: keep additionalInfo (no boxed gifts)
    additionalInfo: isReception 
      ? null 
      : fallbackContent.additionalInfo,
  }
  
  // Get description from database for Mehndi and Reception (display at top)
  const eventDescription = (isMehendi || isReception) ? (event?.description || null) : null

  // Theme-specific background classes
  const backgroundClass = isMehendi
    ? 'bg-gradient-mehendi'
    : isWedding
    ? 'bg-gradient-wedding-teal'
    : 'bg-gradient-reception'

  return (
    <InvitationPageLayout
      token={token}
      eventAccess={guest.eventAccess}
      guestName={guest.name}
    >
      {isReception && <StarParticles count={12} />}
      {!isReception && <FloatingPetals />}
      <PageTransition>
        <div className={`min-h-screen ${backgroundClass} relative`}>
          <div className="max-w-[640px] mx-auto px-4 sm:px-6 md:px-12 py-8 sm:py-12 md:py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              {/* Title - For non-wedding pages */}
              {!isWedding && (
                <div className="text-center mb-6 sm:mb-8">
                  <h1
                    className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-script mb-4 sm:mb-6 ${
                      isReception
                        ? 'text-wedding-gold drop-shadow-lg'
                        : isMehendi
                        ? 'text-wedding-forest-green'
                        : 'text-wedding-navy'
                    }`}
                    style={
                      isReception
                        ? {
                            textShadow: '0 0 10px rgba(212, 175, 55, 0.5), 0 0 20px rgba(212, 175, 55, 0.3)',
                          }
                        : {}
                    }
                  >
                    {event.title}
                  </h1>
                  <OrnamentalDivider variant="ornate" />
                </div>
              )}

              {/* Description (Mehndi and Reception only) - At the top after title */}
              {eventDescription && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 bg-white/60 border border-wedding-gold/20"
                >
                  <p className="text-base sm:text-lg md:text-xl font-serif text-gray-700 leading-relaxed">
                    {eventDescription}
                  </p>
                </motion.div>
              )}

              {/* Baraat Section (Wedding only) - First section for wedding */}
              {isWedding && content.baraatDescription && (
                <>
                  <div className="text-center mb-6 sm:mb-8">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-script mb-4 sm:mb-6 text-wedding-navy">
                      Baraat
                    </h1>
                    <OrnamentalDivider variant="ornate" />
                  </div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.12 }}
                    className="mb-6 sm:mb-8"
                  >
                    <div className="rounded-xl p-4 sm:p-6 bg-white/60 border border-wedding-gold/20">
                      <p className="text-base sm:text-lg md:text-xl font-serif text-gray-700 leading-relaxed">
                        {content.baraatDescription}
                      </p>
                    </div>
                  </motion.div>
                  
                  {/* Baraat Time - Separate box in Date & Time format */}
                  {isWedding && content.baraatTime && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.14 }}
                      className="rounded-2xl p-6 sm:p-8 mb-6 sm:mb-8 bg-white/70 border border-wedding-gold/30"
                    >
                      <div className="text-center">
                        <p className="text-lg sm:text-xl md:text-2xl font-serif text-gray-700">
                          On {content.date} at {content.baraatTime}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </>
              )}

              {/* Hindu Wedding Section (Wedding only) - After Baraat */}
              {isWedding && content.pherasDescription && (
                <>
                  <div className="text-center mb-6 sm:mb-8">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-script mb-4 sm:mb-6 text-wedding-navy">
                      Hindu Wedding
                    </h1>
                    <OrnamentalDivider variant="ornate" />
                  </div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="mb-6 sm:mb-8"
                  >
                    <div className="rounded-xl p-4 sm:p-6 bg-white/60 border border-wedding-gold/20">
                      <p className="text-base sm:text-lg md:text-xl font-serif text-gray-700 leading-relaxed">
                        {content.pherasDescription}
                      </p>
                    </div>
                  </motion.div>
                </>
              )}

              {/* Date & Time */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={`rounded-2xl p-6 sm:p-8 mb-6 sm:mb-8 ${
                  isReception
                    ? 'bg-wedding-gold/20 border-2 border-wedding-gold/40'
                    : 'bg-white/70 border border-wedding-gold/30'
                }`}
              >
                <div className="text-center space-y-3">
                  <p
                    className={`text-lg sm:text-xl md:text-2xl font-serif ${
                      isReception ? 'text-wedding-gold-light' : 'text-gray-700'
                    }`}
                  >
                    On {content.date}
                  </p>
                  <p
                    className={`text-lg sm:text-xl md:text-2xl font-serif ${
                      isReception ? 'text-wedding-gold-light' : 'text-gray-700'
                    }`}
                  >
                    at {content.time}
                  </p>
                </div>
              </motion.div>

              {/* Additional Info for Wedding - Right after Date & Time */}
              {isWedding && content.additionalInfo && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 bg-white/60 border border-wedding-gold/20 text-center"
                >
                  <p className="text-base sm:text-lg md:text-xl font-serif text-gray-700">
                    {content.additionalInfo}
                  </p>
                </motion.div>
              )}

              {/* Cocktail Hour (Reception only) */}
              {content.cocktailHour && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 text-center bg-wedding-gold/10 border border-wedding-gold/30"
                >
                  <p className="text-base sm:text-lg md:text-xl font-serif text-wedding-gold-light">
                    <span className="font-semibold">Cocktail hour:</span> {content.cocktailHour}
                  </p>
                </motion.div>
              )}


              {/* Note (Reception only) */}
              {isReception && content.note && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 text-center bg-wedding-gold/10 border border-wedding-gold/30"
                >
                  <p className="text-base sm:text-lg md:text-xl font-serif italic text-wedding-gold-light">
                    {content.note}
                  </p>
                </motion.div>
              )}

              {/* Attire */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className={`rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 ${
                  isWedding
                    ? 'bg-white/80 border-2 border-wedding-gold/40'
                    : isReception
                    ? 'bg-wedding-gold/10 border border-wedding-gold/30'
                    : 'bg-white/60 border border-wedding-gold/20'
                }`}
              >
                <h2
                  className={`text-lg sm:text-xl md:text-2xl font-display mb-3 sm:mb-4 ${
                    isReception ? 'text-wedding-gold' : isWedding ? 'text-wedding-navy' : 'text-wedding-navy'
                  }`}
                >
                  Attire
                </h2>
                <OrnamentalDivider variant="simple" className="mb-3 sm:mb-4" />
                <p
                  className={`text-base sm:text-lg md:text-xl font-serif whitespace-pre-line ${
                    isReception ? 'text-wedding-gold-light' : 'text-gray-700'
                  }`}
                >
                  {content.attire}
                </p>
              </motion.div>

              {/* Additional Info (Mehndi only - dinner info) - After Attire, before Venue */}
              {isMehendi && content.additionalInfo && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                  className="rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 bg-white/60 border border-wedding-gold/20"
                >
                  <p className="text-base sm:text-lg md:text-xl font-serif text-gray-700">
                    {content.additionalInfo}
                  </p>
                </motion.div>
              )}

              {/* Venue */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className={`rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 ${
                  isReception
                    ? 'bg-wedding-gold/20 border-2 border-wedding-gold/40'
                    : 'bg-white/80 border-2 border-wedding-gold/30'
                }`}
              >
                <h2
                  className={`text-lg sm:text-xl md:text-2xl font-display mb-3 sm:mb-4 ${
                    isReception ? 'text-wedding-gold' : 'text-wedding-navy'
                  }`}
                >
                  Venue
                </h2>
                <OrnamentalDivider variant="simple" className="mb-3 sm:mb-4" />
                <p
                  className={`text-base sm:text-lg md:text-xl font-serif font-semibold mb-2 ${
                    isReception ? 'text-wedding-gold-light' : 'text-gray-800'
                  }`}
                >
                  {content.venue}
                </p>
                {content.venueDetails && (
                  <p
                    className={`text-sm sm:text-base md:text-lg font-serif mb-2 ${
                      isReception ? 'text-wedding-gold-light/90' : 'text-gray-700'
                    }`}
                  >
                    {content.venueDetails}
                  </p>
                )}
                <p
                  className={`text-sm sm:text-base md:text-lg font-serif mb-4 ${
                    isReception ? 'text-wedding-gold-light/90' : 'text-gray-700'
                  }`}
                >
                  {content.address}
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
                    referrerPolicy="no-referrer-when-downgrade"
                    className="w-full"
                    title="Venue Location"
                  ></iframe>
                </div>
              </motion.div>

              {/* Botanical/Decorative elements for Mehendi */}
              {isMehendi && (
                <div className="absolute bottom-0 left-0 right-0 h-24 opacity-20 pointer-events-none">
                  <svg viewBox="0 0 400 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M50 80 Q75 40, 100 80 T150 80 T200 80 T250 80 T300 80 T350 80"
                      stroke="#006400"
                      strokeWidth="2"
                      fill="none"
                    />
                    <circle cx="100" cy="80" r="4" fill="#006400" />
                    <circle cx="200" cy="80" r="4" fill="#006400" />
                    <circle cx="300" cy="80" r="4" fill="#006400" />
                  </svg>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </PageTransition>
    </InvitationPageLayout>
  )
}
