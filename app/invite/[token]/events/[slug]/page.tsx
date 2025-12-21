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
import InteractiveFloatingHearts from '@/components/InteractiveFloatingHearts'
import PhoneVerificationForm from '@/components/PhoneVerificationForm'
import AccessRestrictedPopup from '@/components/AccessRestrictedPopup'
import { useGuestAccess } from '@/lib/use-guest-access'
import { formatWrittenDate, formatWrittenTime, formatWrittenDateFromString } from '@/lib/date-formatter'

const ADMIN_CONTACT = process.env.NEXT_PUBLIC_ADMIN_CONTACT || '---'

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
    venueDetails: 'Bridal Lounge, DoubleTree',
    address: '90 Pacifica, Irvine, CA 92618',
    additionalInfo: 'Boxed Punjabi Chhole and Rice Dinner will be served',
  },
  wedding: {
    date: '21st Day of March, 2026',
    time: 'Ten O\'Clock in the Morning',
    note: 'Lunch to be served after photo session',
    attire: 'Formal Indian Attire',
    venue: 'DoubleTree by Hilton Hotel Irvine – Spectrum',
    venueDetails: 'Poolside Patio, DoubleTree',
    address: '90 Pacifica, Irvine, CA 92618',
    pherasDescription: 'The Wedding Ceremony unites two souls spiritually, mentally and physically. The bond of matrimony is sacred and the ceremony of marriage is conducted according to Vedic traditions.',
    baraatDescription: 'Baraat is an Indian wedding ceremony where the groom accompanied by his family and friends dance all the way to the bride\'s doorstep or wedding venue.',
    baraatTime: 'Thirty Minutes past 9 O\'Clock in the Morning',
    additionalInfo: 'No Boxed Gifts/Registry',
  },
  reception: {
    date: '21st Day of March, 2026',
    time: 'Five O\'Clock in the Evening',
    note: 'No Boxed Gifts/Registry',
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

  // Check if guest has access to this specific event
  const hasEventAccess = accessState === 'granted' && guest && guest.eventAccess.includes(slug)
  const isValidEventSlug = eventInfo[slug] !== undefined

  useEffect(() => {
    // Only fetch event details if guest has access to this event
    if (hasEventAccess && isValidEventSlug && !event) {
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
    }
  }, [hasEventAccess, isValidEventSlug, slug, event])

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

  // Show access denied for invalid token
  if (accessState === 'access-denied' || (accessState !== 'granted' && accessState !== 'loading')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-wedding-cream">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wedding-gold mx-auto mb-4"></div>
          <p className="text-wedding-navy">Loading...</p>
        </div>
      </div>
    )
  }

  // Show error for invalid event slug or unauthorized event access
  if (accessState === 'granted' && guest) {
    // Check if event slug is valid
    if (!isValidEventSlug) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-wedding p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-md w-full wedding-card rounded-2xl shadow-2xl p-6 sm:p-8 text-center"
          >
            <div className="text-5xl sm:text-6xl mb-4">🔍</div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-display text-wedding-navy mb-4">
              Page Not Found
            </h1>
            <div className="wedding-divider max-w-32 mx-auto mb-6"></div>
            <p className="text-base sm:text-lg text-gray-700 mb-6 leading-relaxed">
              The event page you&apos;re looking for doesn&apos;t exist.
            </p>
            <button
              onClick={() => router.push(`/invite/${token}`)}
              className="px-6 py-3 bg-wedding-gold text-white rounded-lg font-semibold hover:bg-wedding-gold/90 transition-colors"
            >
              Return to Home
            </button>
          </motion.div>
        </div>
      )
    }

    // Check if guest has access to this specific event - CRITICAL: Check BEFORE rendering content
    if (!guest.eventAccess.includes(slug)) {
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
              This Page Is Not Available
            </h1>
            <div className="wedding-divider max-w-32 mx-auto mb-6"></div>
            <p className="text-base sm:text-lg text-gray-700 mb-4 leading-relaxed">
              This event page is not available for your invitation.
            </p>
            <p className="text-base sm:text-lg text-gray-700 mb-6 leading-relaxed">
              Please return to your invitation home page to see the events you&apos;re invited to.
            </p>
            <button
              onClick={() => router.push(`/invite/${token}`)}
              className="px-6 py-3 bg-wedding-gold text-white rounded-lg font-semibold hover:bg-wedding-gold/90 transition-colors mb-4"
            >
              Return to Home
            </button>
            <div className="bg-wedding-rose-pastel/30 rounded-lg p-4 border border-wedding-rose/20">
              <p className="text-sm sm:text-base text-gray-600 mb-2">
                Questions? Contact:
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
  }

  // Show loading while event data is being fetched (only if guest has access)
  if (!event && hasEventAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-wedding-cream">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wedding-gold mx-auto mb-4"></div>
          <p className="text-wedding-navy">Loading event details...</p>
        </div>
      </div>
    )
  }

  // Safety check: Don't render if we don't have a guest or event data
  if (!guest || !event) {
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
    ? 'bg-gradient-mehendi' // Warm gradient with rose and cream tones
    : isWedding
    ? 'bg-gradient-wedding-teal'
    : 'bg-gradient-reception'

  return (
    <InvitationPageLayout
      token={token}
      eventAccess={guest.eventAccess}
      guestName={guest.name}
    >
      {isReception && <StarParticles count={75} />}
      {isWedding && <InteractiveFloatingHearts />}
      {!isReception && !isWedding && <FloatingPetals />}
      <PageTransition>
        <div 
          className={`min-h-screen relative ${backgroundClass}`}
        >
          {/* Mehndi repeating background pattern */}
          {isMehendi && (
            <div 
              className="absolute inset-0 pointer-events-none z-[1]"
              style={{
                backgroundImage: 'url(/images/mehndi-background-2.svg)',
                backgroundSize: '400px 400px',
                backgroundRepeat: 'repeat',
                backgroundPosition: '0 0',
                opacity: 0.35,
              }}
            />
          )}
          <div className={`max-w-[640px] mx-auto px-4 sm:px-6 md:px-12 py-8 sm:py-12 md:py-16 relative z-20 ${isMehendi ? 'overflow-visible' : ''}`}>
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
                  className={`rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 shadow-md ${isMehendi ? 'bg-white' : 'bg-white/60'} border border-wedding-gold/20 relative overflow-hidden event-card-pattern`}
                >
                  <p 
                    className={`text-base sm:text-lg md:text-xl font-serif leading-relaxed max-w-prose mx-auto relative z-10 ${
                      isReception ? 'text-wedding-gold-light' : 'text-gray-700'
                    }`}
                    style={
                      isReception
                        ? {
                            filter: 'brightness(1.2)',
                          }
                        : {}
                    }
                  >
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
                    {/* Baraat Image */}
                    <div className="mt-6 sm:mt-8 w-full flex justify-center overflow-hidden" style={{ height: 'auto', maxHeight: '450px' }}>
                      <img 
                        src="/images/baraat-image.svg" 
                        alt=""
                        className="w-full h-auto"
                        style={{
                          width: '100%',
                          maxHeight: '500px',
                          objectFit: 'contain',
                          objectPosition: 'center',
                        }}
                      />
                    </div>
                  </div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.12 }}
                    className="mb-6 sm:mb-8"
                  >
                    <div className="rounded-xl p-4 sm:p-6 bg-white/60 border border-wedding-gold/20 relative overflow-hidden event-card-pattern">
                      <p className="text-base sm:text-lg md:text-xl font-serif text-gray-700 leading-relaxed max-w-prose mx-auto relative z-10">
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
                      className="rounded-2xl p-6 sm:p-8 mb-6 sm:mb-8 bg-white/70 border border-wedding-gold/30 relative overflow-hidden event-card-pattern"
                    >
                      <div className="text-center relative z-10">
                        <p className="text-lg sm:text-xl md:text-2xl font-serif text-gray-700 leading-relaxed">
                          On {content.date} at {content.baraatTime}
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {/* Baraat Venue */}
                  {isWedding && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.16 }}
                      className="rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 bg-white/80 border-2 border-wedding-gold/30 relative overflow-hidden event-card-pattern"
                    >
                      <div className="relative z-10">
                        <h2 className="flex items-center justify-center gap-2 sm:gap-3 text-lg sm:text-xl md:text-2xl font-display mb-3 sm:mb-4 text-wedding-navy">
                          <span className="text-xl sm:text-2xl">📍</span>
                          <span>Venue</span>
                        </h2>
                        <OrnamentalDivider variant="simple" className="mb-3 sm:mb-4" />
                        <p
                          className="text-base sm:text-lg md:text-xl font-serif font-semibold mb-2 leading-relaxed text-gray-800"
                        >
                          DoubleTree by Hilton Hotel Irvine – Spectrum
                        </p>
                        <p
                          className="text-sm sm:text-base md:text-lg font-serif mb-2 leading-relaxed text-gray-700"
                        >
                          Upper Parking Area Behind Poolside Patio
                        </p>
                        <p
                          className="text-sm sm:text-base md:text-lg font-serif mb-4 leading-relaxed text-gray-700"
                        >
                          90 Pacifica, Irvine, CA 92618
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
                    {/* Wedding Hand Image */}
                    <div className="mt-6 sm:mt-8 w-full flex justify-center overflow-hidden" style={{ height: 'auto', maxHeight: '250px' }}>
                      <img 
                        src="/images/wedding-hand.svg" 
                        alt=""
                        className="w-full h-auto"
                        style={{
                          width: '100%',
                          maxHeight: '300px',
                          objectFit: 'cover',
                          objectPosition: 'center',
                        }}
                      />
                    </div>
                  </div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="mb-6 sm:mb-8"
                  >
                    <div className="rounded-xl p-4 sm:p-6 bg-white/60 border border-wedding-gold/20 relative overflow-hidden event-card-pattern">
                      <p className="text-base sm:text-lg md:text-xl font-serif text-gray-700 leading-relaxed max-w-prose mx-auto relative z-10">
                        {content.pherasDescription}
                      </p>
                    </div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.17 }}
                    className="mb-6 sm:mb-8"
                  >
                    <div className="rounded-xl p-4 sm:p-6 bg-white/60 border border-wedding-gold/20 text-center relative overflow-hidden event-card-pattern">
                      <div className="relative z-10">
                        <h2 className="flex items-center justify-center gap-2 sm:gap-3 text-lg sm:text-xl md:text-2xl font-display mb-3 sm:mb-4 text-wedding-navy">
                          <span className="text-xl sm:text-2xl">🍽️</span>
                          <span>Lunch</span>
                        </h2>
                        <OrnamentalDivider variant="simple" className="mb-3 sm:mb-4" />
                        <p className="text-base sm:text-lg md:text-xl font-serif text-gray-700 leading-relaxed">
                          Gujarati Vegetarian Lunch to be served After Photo Session
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </>
              )}

              {/* Date & Time */}
              <div className="relative mb-6 sm:mb-8">
                {/* Mehndi Girl Image - positioned to the left of Date & Time box, outside the box, touching the edge */}
                {isMehendi && (
                  <div 
                    className="absolute right-full top-0 bottom-0 flex items-center pointer-events-none z-[2]"
                  >
                    <img 
                      src="/images/mehndi-girl-image.svg" 
                      alt=""
                      className="h-full w-auto"
                      style={{
                        height: '100%',
                        width: 'auto',
                      }}
                    />
                  </div>
                )}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className={`rounded-2xl p-6 sm:p-8 relative overflow-hidden event-card-pattern shadow-md ${
                    isReception
                      ? 'bg-wedding-gold/20 border-2 border-wedding-gold/40'
                      : isMehendi
                      ? 'bg-white border border-wedding-gold/30'
                      : 'bg-white/70 border border-wedding-gold/30'
                  }`}
                  style={{
                    position: 'relative',
                  }}
                >
                  <div className="text-center space-y-3 relative z-10">
                    <p
                      className={`text-lg sm:text-xl md:text-2xl font-serif leading-relaxed ${
                        isReception ? 'text-wedding-gold-light' : 'text-gray-700'
                      }`}
                      style={
                        isReception
                          ? {
                              filter: 'brightness(1.2)',
                            }
                          : {}
                      }
                    >
                      On {content.date}
                    </p>
                    <p
                      className={`text-lg sm:text-xl md:text-2xl font-serif leading-relaxed ${
                        isReception ? 'text-wedding-gold-light' : 'text-gray-700'
                      }`}
                      style={
                        isReception
                          ? {
                              filter: 'brightness(1.2)',
                            }
                          : {}
                      }
                    >
                      at {content.time}
                    </p>
                  </div>
                </motion.div>
              </div>

              {/* Additional Info for Wedding - Right after Date & Time */}
              {isWedding && content.additionalInfo && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 bg-white/60 border border-wedding-gold/20 text-center relative overflow-hidden event-card-pattern"
                >
                  <p className="text-base sm:text-lg md:text-xl font-serif text-gray-700 relative z-10">
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
                  className="rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 text-center bg-wedding-gold/10 border border-wedding-gold/30 relative overflow-hidden event-card-pattern"
                >
                  <p 
                    className="text-base sm:text-lg md:text-xl font-serif text-wedding-gold-light leading-relaxed relative z-10"
                    style={{
                      filter: 'brightness(1.2)',
                    }}
                  >
                    <span 
                      className="font-semibold"
                      style={{
                        filter: 'brightness(1.3)',
                      }}
                    >
                      Cocktail hour:
                    </span> {content.cocktailHour}
                  </p>
                </motion.div>
              )}


              {/* Note (Reception only) */}
              {isReception && content.note && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 text-center bg-wedding-gold/10 border border-wedding-gold/30 relative overflow-hidden event-card-pattern"
                >
                  <p 
                    className="text-base sm:text-lg md:text-xl font-serif text-wedding-gold-light leading-relaxed relative z-10"
                    style={{
                      filter: 'brightness(1.2)',
                    }}
                  >
                    {content.note}
                  </p>
                </motion.div>
              )}

              {/* Attire */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className={`rounded-xl ${(isMehendi || isWedding) ? 'p-3 sm:p-4' : 'p-4 sm:p-6'} mb-6 sm:mb-8 relative overflow-hidden event-card-pattern shadow-md ${
                  isWedding
                    ? 'bg-white/80 border-2 border-wedding-gold/40'
                    : isReception
                    ? 'bg-wedding-gold/10 border border-wedding-gold/30'
                    : isMehendi
                    ? 'bg-white border border-wedding-gold/20'
                    : 'bg-white/60 border border-wedding-gold/20'
                }`}
              >
                <div className="relative z-10">
                <h2
                  className={`flex items-center justify-center gap-2 sm:gap-3 text-lg sm:text-xl md:text-2xl font-display mb-3 sm:mb-4 ${
                    isReception ? 'text-wedding-gold' : isWedding ? 'text-wedding-navy' : 'text-wedding-navy'
                  }`}
                  style={
                    isReception
                      ? {
                          filter: 'brightness(1.3)',
                        }
                      : {}
                  }
                >
                  <span className="text-xl sm:text-2xl">👗</span>
                  <span>Attire</span>
                </h2>
                <OrnamentalDivider variant="simple" className="mb-3 sm:mb-4" />
                <p
                  className={`text-base sm:text-lg md:text-xl font-serif whitespace-pre-line leading-relaxed ${
                    isReception ? 'text-wedding-gold-light text-center max-w-prose mx-auto' : 'text-gray-700'
                  } ${isMehendi || isWedding ? 'text-center max-w-prose mx-auto' : ''}`}
                  style={
                    isReception
                      ? {
                          filter: 'brightness(1.2)',
                        }
                      : {}
                  }
                >
                  {content.attire}
                </p>
                </div>
              </motion.div>

              {/* Dinner (Reception only) - After Attire */}
              {isReception && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                  className="rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 bg-wedding-gold/10 border border-wedding-gold/30 relative overflow-hidden event-card-pattern"
                >
                  <div className="relative z-10">
                    <h2 
                      className="flex items-center justify-center gap-2 sm:gap-3 text-lg sm:text-xl md:text-2xl font-display mb-3 sm:mb-4 text-wedding-gold"
                      style={{
                        filter: 'brightness(1.3)',
                      }}
                    >
                      <span className="text-xl sm:text-2xl">🍽️</span>
                      <span>Dinner</span>
                    </h2>
                    <OrnamentalDivider variant="simple" className="mb-3 sm:mb-4" />
                    <p 
                      className="text-base sm:text-lg md:text-xl font-serif text-wedding-gold-light leading-relaxed text-center"
                      style={{
                        filter: 'brightness(1.2)',
                      }}
                    >
                      Dinner to be served
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Dinner (Mehndi only) - After Attire, before Venue */}
              {isMehendi && content.additionalInfo && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                  className={`rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 shadow-md ${isMehendi ? 'bg-white' : 'bg-white/60'} border border-wedding-gold/20 relative overflow-hidden event-card-pattern`}
                >
                  <div className="relative z-10">
                    <h2 className="flex items-center justify-center gap-2 sm:gap-3 text-lg sm:text-xl md:text-2xl font-display mb-3 sm:mb-4 text-wedding-navy">
                      <span className="text-xl sm:text-2xl">🍽️</span>
                      <span>Dinner</span>
                    </h2>
                    <OrnamentalDivider variant="simple" className="mb-3 sm:mb-4" />
                    <p className="text-base sm:text-lg md:text-xl font-serif text-gray-700 leading-relaxed max-w-prose mx-auto">
                      {content.additionalInfo}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Venue */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className={`rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 relative overflow-hidden event-card-pattern shadow-md ${
                  isReception
                    ? 'bg-wedding-gold/20 border-2 border-wedding-gold/40'
                    : isMehendi
                    ? 'bg-white border-2 border-wedding-gold/30'
                    : 'bg-white/80 border-2 border-wedding-gold/30'
                }`}
              >
                <div className="relative z-10">
                  <h2
                    className={`flex items-center justify-center gap-2 sm:gap-3 text-lg sm:text-xl md:text-2xl font-display mb-3 sm:mb-4 ${
                      isReception ? 'text-wedding-gold' : 'text-wedding-navy'
                    }`}
                    style={
                      isReception
                        ? {
                            filter: 'brightness(1.3)',
                          }
                        : {}
                    }
                  >
                    <span className="text-xl sm:text-2xl">📍</span>
                    <span>Venue</span>
                  </h2>
                  <OrnamentalDivider variant="simple" className="mb-3 sm:mb-4" />
                  <p
                    className={`text-base sm:text-lg md:text-xl font-serif font-semibold mb-2 leading-relaxed ${
                      isReception ? 'text-wedding-gold-light' : 'text-gray-800'
                    }`}
                    style={
                      isReception
                        ? {
                            filter: 'brightness(1.2)',
                          }
                        : {}
                    }
                  >
                    {content.venue}
                  </p>
                  {content.venueDetails && (
                    <p
                      className={`text-sm sm:text-base md:text-lg font-serif mb-2 leading-relaxed ${
                        isReception ? 'text-wedding-gold-light/90' : 'text-gray-700'
                      }`}
                      style={
                        isReception
                          ? {
                              filter: 'brightness(1.2)',
                            }
                          : {}
                      }
                    >
                      {content.venueDetails}
                    </p>
                  )}
                  <p
                    className={`text-sm sm:text-base md:text-lg font-serif mb-4 leading-relaxed ${
                      isReception ? 'text-wedding-gold-light/90' : 'text-gray-700'
                    }`}
                    style={
                      isReception
                        ? {
                            filter: 'brightness(1.2)',
                          }
                        : {}
                    }
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
                    referrerPolicy="no-referrer"
                    className="w-full"
                    title="Venue Location"
                  ></iframe>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </PageTransition>
    </InvitationPageLayout>
  )
}
