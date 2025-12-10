'use client'

import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import PageTransition from '@/components/PageTransition'
import InvitationPageLayout from '@/components/InvitationPageLayout'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import FloatingPetals from '@/components/FloatingPetals'
import OrnamentalDivider from '@/components/OrnamentalDivider'

const eventData = {
  mehndi: {
    name: 'Mehendi',
    date: '20th Day of March',
    time: 'Six O\'Clock in the evening',
    icon: '🎨',
    slug: 'mehndi',
  },
  wedding: {
    name: 'Hindu Wedding Ceremony',
    date: '21st Day of March',
    time: 'Ten O\'Clock in the morning',
    icon: '💒',
    slug: 'wedding',
  },
  reception: {
    name: 'Reception',
    date: '21st Day of March',
    time: 'Five O\'Clock in the evening',
    icon: '🎉',
    slug: 'reception',
  },
}

export default function SaveTheDatePage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)
  const [guest, setGuest] = useState<any>(null)

  useEffect(() => {
    fetch('/api/verify-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.guest) {
          setHasAccess(true)
          setGuest(data.guest)
        } else {
          setHasAccess(false)
        }
      })
      .catch(() => {
        setHasAccess(false)
      })
  }, [token])

  if (hasAccess === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-wedding-cream">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wedding-gold mx-auto mb-4"></div>
          <p className="text-wedding-navy">Loading...</p>
        </div>
      </div>
    )
  }

  if (hasAccess === false) {
    router.push(`/invite/${token}`)
    return null
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

  // Filter events based on guest access
  const events = guest.eventAccess
    .map((slug: string) => eventData[slug as keyof typeof eventData])
    .filter(Boolean)

  // Sort events by date
  const sortedEvents = events.sort((a, b) => {
    const dateOrder: Record<string, number> = {
      'mehndi': 1,
      'wedding': 2,
      'reception': 3,
    }
    return (dateOrder[a.slug] || 0) - (dateOrder[b.slug] || 0)
  })

  return (
    <InvitationPageLayout
      token={token}
      eventAccess={guest.eventAccess}
      guestName={guest.name}
    >
      <FloatingPetals />
      <PageTransition>
        <div className="min-h-screen bg-gradient-rose-cream relative">
          <div className="max-w-[640px] mx-auto px-4 sm:px-6 md:px-12 py-8 sm:py-12 md:py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Header */}
              <div className="text-center mb-8 sm:mb-12">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-script text-wedding-navy mb-4 sm:mb-6">
                  Save the Date
                </h1>
                <OrnamentalDivider variant="ornate" className="mb-4 sm:mb-6" />
                <p className="text-xl sm:text-2xl md:text-3xl font-script text-wedding-gold">
                  20th & 21st Day of March, 2026
                </p>
              </div>

              {/* Vertical Timeline */}
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-6 sm:left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-wedding-gold via-wedding-gold to-wedding-gold"></div>

                {/* Event Items */}
                <div className="space-y-8 sm:space-y-12">
                  {sortedEvents.map((event, index) => (
                    <motion.div
                      key={event.slug}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + index * 0.1 }}
                      className="relative pl-16 sm:pl-20"
                    >
                      {/* Gold dot on timeline */}
                      <div className="absolute left-3 sm:left-5 top-2 w-6 h-6 sm:w-8 sm:h-8 bg-wedding-gold rounded-full border-4 border-white shadow-lg transform -translate-x-1/2"></div>

                      {/* Event Card */}
                      <div className="bg-white/80 rounded-2xl p-6 sm:p-8 border-2 border-wedding-gold/30 shadow-lg">
                        <div className="flex items-start gap-4 sm:gap-6">
                          <div className="text-4xl sm:text-5xl md:text-6xl flex-shrink-0">
                            {event.icon}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl sm:text-2xl md:text-3xl font-script text-wedding-navy mb-3 sm:mb-4">
                              {event.name}
                            </h3>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="text-wedding-gold text-lg sm:text-xl">📆</span>
                                <p className="text-base sm:text-lg md:text-xl font-serif text-gray-700">
                                  {event.date}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-wedding-gold text-lg sm:text-xl">🕐</span>
                                <p className="text-base sm:text-lg md:text-xl font-serif text-gray-700">
                                  at {event.time}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Venue & Map Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-12 sm:mt-16"
              >
                <div className="bg-white/80 rounded-2xl p-6 sm:p-8 border-2 border-wedding-gold/30 shadow-lg">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-script text-wedding-navy mb-4 sm:mb-6 text-center">
                    Venue
                  </h2>
                  <OrnamentalDivider variant="simple" className="mb-4 sm:mb-6" />
                  <div className="text-center mb-4 sm:mb-6">
                    <p className="text-base sm:text-lg md:text-xl font-serif font-semibold text-gray-800 mb-2">
                      DoubleTree by Hilton Hotel Irvine – Spectrum
                    </p>
                    <p className="text-sm sm:text-base md:text-lg font-serif text-gray-700">
                      90 Pacifica, Irvine, CA 92618
                    </p>
                  </div>
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
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </PageTransition>
    </InvitationPageLayout>
  )
}
