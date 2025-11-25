'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import PageTransition from '@/components/PageTransition'
import InvitationPageLayout from '@/components/InvitationPageLayout'

const eventInfo: Record<
  string,
  { title: string; icon: string; color: string }
> = {
  mehndi: {
    title: 'Mehndi & Pithi Ceremony',
    icon: '🎨',
    color: 'wedding-rose',
  },
  wedding: {
    title: 'Hindu Wedding',
    icon: '💒',
    color: 'wedding-gold',
  },
  reception: {
    title: 'Reception',
    icon: '🎉',
    color: 'wedding-burgundy',
  },
}

// Default content functions
function getDefaultDescription(slug: string): string {
  switch (slug) {
    case 'mehndi':
      return 'A vibrant celebration filled with colors, music, fun, and beautiful traditions. Join us as we begin the wedding festivities with mehndi, haldi, laughter, and joyful rituals.'
    case 'wedding':
      return 'Join us as Ankita Brijesh Sharma and Jay Bhavan Mehta tie the knot in a traditional Hindu ceremony surrounded by family, friends, mantras, blessings, and love.'
    case 'reception':
      return 'An evening filled with celebration, music, good food, dancing, and unforgettable memories. We can\'t wait to celebrate our happiness with you!'
    default:
      return ''
  }
}

function getDefaultDate(slug: string): string | null {
  switch (slug) {
    case 'mehndi':
      return 'March 20, 2026'
    case 'wedding':
      return 'March 21, 2026'
    case 'reception':
      return 'March 21, 2026'
    default:
      return null
  }
}

function getDefaultTime(slug: string): string | null {
  switch (slug) {
    case 'mehndi':
      return '6:00 PM'
    case 'wedding':
      return '10:00 AM'
    case 'reception':
      return '5:30 PM'
    default:
      return null
  }
}

function getDefaultVenue(slug: string): string | null {
  switch (slug) {
    case 'mehndi':
      return 'DoubleTree by Hilton Hotel Irvine - Spectrum'
    case 'wedding':
      return 'DoubleTree by Hilton Hotel Irvine - Spectrum'
    case 'reception':
      return 'DoubleTree by Hilton Hotel Irvine - Spectrum'
    default:
      return null
  }
}

function getDefaultAddress(slug: string): string | null {
  switch (slug) {
    case 'mehndi':
      return '90 Pacifica, Irvine, CA 92618'
    case 'wedding':
      return '90 Pacifica, Irvine, CA 92618'
    case 'reception':
      return '90 Pacifica, Irvine, CA 92618'
    default:
      return null
  }
}

function getDefaultDressCode(slug: string): string | null {
  switch (slug) {
    case 'mehndi':
      return 'Bright, festive, and colorful traditional wear.'
    case 'wedding':
      return 'Traditional Indian wear — ethnic, elegant, and graceful.'
    case 'reception':
      return 'Formal / Indo-western evening wear.'
    default:
      return null
  }
}

function getDefaultNotes(slug: string): string | null {
  switch (slug) {
    case 'mehndi':
      return 'Light snacks will be served.\nOpen dance floor for friends & family!'
    case 'wedding':
      return 'Breakfast will be served after the ceremony.'
    case 'reception':
      return 'Live music & dinner will be served.\nPhotography booth available for guests.'
    default:
      return null
  }
}

export default function EventDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string
  const slug = params.slug as string

  const [guest, setGuest] = useState<any>(null)
  const [event, setEvent] = useState<any>(null)

  useEffect(() => {
    // Verify access
    fetch('/api/verify-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.guest) {
          setGuest(data.guest)
          // Check if guest has access to this event
          if (!data.guest.eventAccess.includes(slug)) {
            router.push(`/invite/${token}`)
          }
        }
      })
      .catch((err) => {
        console.error('Error verifying access:', err)
        router.push(`/invite/${token}`)
      })

    // Fetch event details
    fetch(`/api/events/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.event) {
          setEvent({
            ...eventInfo[slug],
            ...data.event,
          })
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

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-wedding-cream">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wedding-gold mx-auto mb-4"></div>
          <p className="text-wedding-navy">Loading...</p>
        </div>
      </div>
    )
  }

  if (!guest) {
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
      <PageTransition>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
          <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="wedding-card rounded-2xl p-6 sm:p-8 md:p-12"
        >
          <div className="text-center mb-8 sm:mb-10">
            <div className="text-5xl sm:text-6xl md:text-7xl mb-4 sm:mb-5">{event.icon}</div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-display text-wedding-navy mb-4 sm:mb-5 font-bold">
              {event.title}
            </h1>
            <div className="wedding-divider-thick max-w-md mx-auto"></div>
          </div>

          {/* Event Image Placeholder */}
          <div className="mb-8 sm:mb-10">
            <div className={`relative w-full h-48 sm:h-64 md:h-80 rounded-xl overflow-hidden ${
              slug === 'mehndi' ? 'bg-gradient-to-br from-wedding-rose-pastel to-wedding-rose' :
              slug === 'wedding' ? 'bg-gradient-to-br from-wedding-gold-light to-wedding-gold' :
              'bg-gradient-to-br from-wedding-burgundy-light to-wedding-burgundy'
            }`}>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="text-6xl sm:text-7xl md:text-8xl mb-3">{event.icon}</div>
                  <p className="text-sm sm:text-base opacity-80 italic">Event Photo Placeholder</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8 sm:space-y-10">
            {/* Event Description */}
            {((event as any).description || getDefaultDescription(slug)) && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-wedding-cream-light/50 rounded-xl p-6 sm:p-8 border border-wedding-gold/20"
              >
                <p className="text-base sm:text-lg md:text-xl text-gray-700 leading-relaxed text-center">
                  {(event as any).description || getDefaultDescription(slug)}
                </p>
              </motion.section>
            )}

            {/* Date & Time */}
            {((event as any).date || (event as any).time || getDefaultDate(slug) || getDefaultTime(slug)) && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/60 rounded-xl p-6 sm:p-8 border border-wedding-rose/20"
              >
                <div className="flex items-center mb-4">
                  <span className="text-2xl mr-3">📅</span>
                  <h2 className="text-2xl sm:text-3xl font-display text-wedding-navy">
                    Date & Time
                  </h2>
                </div>
                <div className="wedding-divider mb-6"></div>
                <div className="space-y-3">
                  {((event as any).date || getDefaultDate(slug)) && (
                    <div className="flex items-start">
                      <span className="text-wedding-gold mr-3 text-xl">📆</span>
                      <div>
                        <p className="text-sm sm:text-base text-gray-600 mb-1">Date</p>
                        <p className="text-lg sm:text-xl font-semibold text-wedding-navy">
                          {(event as any).date
                            ? new Date((event as any).date).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })
                            : getDefaultDate(slug)}
                        </p>
                      </div>
                    </div>
                  )}
                  {((event as any).time || getDefaultTime(slug)) && (
                    <div className="flex items-start">
                      <span className="text-wedding-gold mr-3 text-xl">🕐</span>
                      <div>
                        <p className="text-sm sm:text-base text-gray-600 mb-1">Time</p>
                        <p className="text-lg sm:text-xl font-semibold text-wedding-navy">
                          {(event as any).time || getDefaultTime(slug)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.section>
            )}

            {/* Venue */}
            {((event as any).venue || (event as any).address || getDefaultVenue(slug) || getDefaultAddress(slug)) && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white/60 rounded-xl p-6 sm:p-8 border border-wedding-gold/20"
              >
                <div className="flex items-center mb-4">
                  <span className="text-2xl mr-3">📍</span>
                  <h2 className="text-2xl sm:text-3xl font-display text-wedding-navy">
                    Venue
                  </h2>
                </div>
                <div className="wedding-divider mb-6"></div>
                {((event as any).venue || getDefaultVenue(slug)) && (
                  <p className="text-xl sm:text-2xl font-display font-semibold text-wedding-navy mb-2">
                    {(event as any).venue || getDefaultVenue(slug)}
                  </p>
                )}
                {((event as any).address || getDefaultAddress(slug)) && (
                  <p className="text-base sm:text-lg text-gray-700 mb-6">
                    {(event as any).address || getDefaultAddress(slug)}
                  </p>
                )}
                {(event as any).mapEmbedUrl ? (
                  <div
                    className="bg-gradient-to-br from-wedding-cream to-wedding-rose-pastel rounded-xl p-2 sm:p-4 h-48 sm:h-64 overflow-hidden border border-wedding-gold/20"
                    dangerouslySetInnerHTML={{
                      __html: (event as any).mapEmbedUrl,
                    }}
                  />
                ) : (
                  <div className="bg-gradient-to-br from-wedding-cream to-wedding-rose-pastel rounded-xl p-4 h-48 sm:h-64 flex items-center justify-center border border-wedding-gold/20">
                    <div className="text-center">
                      <span className="text-4xl mb-2 block">🗺️</span>
                      <p className="text-sm sm:text-base text-gray-600">(Insert map embed)</p>
                    </div>
                  </div>
                )}
              </motion.section>
            )}

            {/* Dress Code */}
            {((event as any).dressCode || getDefaultDressCode(slug)) && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-wedding-rose-pastel/30 rounded-xl p-6 sm:p-8 border border-wedding-rose/20"
              >
                <div className="flex items-center mb-4">
                  <span className="text-2xl mr-3">👗</span>
                  <h2 className="text-2xl sm:text-3xl font-display text-wedding-navy">
                    Dress Code
                  </h2>
                </div>
                <div className="wedding-divider mb-6"></div>
                <p className="text-base sm:text-lg md:text-xl text-gray-700">
                  {(event as any).dressCode || getDefaultDressCode(slug)}
                </p>
              </motion.section>
            )}

            {/* Additional Notes */}
            {getDefaultNotes(slug) && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-wedding-gold-light/20 rounded-xl p-6 sm:p-8 border border-wedding-gold/20"
              >
                <div className="flex items-center mb-4">
                  <span className="text-2xl mr-3">📝</span>
                  <h2 className="text-2xl sm:text-3xl font-display text-wedding-navy">
                    Additional Notes
                  </h2>
                </div>
                <div className="wedding-divider mb-6"></div>
                <p className="text-base sm:text-lg md:text-xl text-gray-700 whitespace-pre-line leading-relaxed">
                  {getDefaultNotes(slug)}
                </p>
              </motion.section>
            )}
          </div>

        </motion.div>
      </div>
      </PageTransition>
    </InvitationPageLayout>
  )
}

