'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import PageTransition from '@/components/PageTransition'
import InvitationPageLayout from '@/components/InvitationPageLayout'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SaveTheDatePage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)
  const [guest, setGuest] = useState<any>(null)

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
  const isAllEvents = guest.eventAccess.includes('mehndi') && guest.eventAccess.includes('wedding') && guest.eventAccess.includes('reception')
  
  const allEvents = [
    {
      name: 'Mehndi',
      date: 'March 20, 2026',
      time: '6:00 PM',
      icon: '🎨',
    },
    {
      name: 'Hindu Wedding Ceremony',
      date: 'March 21, 2026',
      time: '10:00 AM',
      icon: '💒',
    },
    {
      name: 'Wedding Reception',
      date: 'March 21, 2026',
      time: '5:30 PM',
      icon: '🎉',
    },
  ]

  const events = isAllEvents ? allEvents : allEvents.filter(e => e.name === 'Wedding Reception')

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
            <div className="text-center mb-8 sm:mb-12">
              <div className="flex justify-center mb-4">
                <span className="text-4xl sm:text-5xl">📅</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-display text-wedding-navy mb-4">
                Save the Date
              </h1>
              <div className="wedding-divider-thick max-w-md mx-auto"></div>
              <p className="text-xl sm:text-2xl font-display text-wedding-gold mt-6 mb-4">
                Ankita Brijesh Sharma
              </p>
              <p className="text-2xl sm:text-3xl font-display text-wedding-gold mb-2">
                &
              </p>
              <p className="text-xl sm:text-2xl font-display text-wedding-gold mb-6">
                Jay Bhavan Mehta
              </p>
            </div>

            {/* Main Date Display */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-10 sm:mb-12"
            >
              <div className="bg-gradient-to-br from-wedding-rose-pastel via-wedding-cream to-wedding-gold-light rounded-2xl p-8 sm:p-12 border-2 border-wedding-gold/30 shadow-xl">
                <p className="text-3xl sm:text-4xl md:text-5xl font-display text-wedding-navy mb-4 font-bold">
                  March 20-21, 2026
                </p>
                <p className="text-xl sm:text-2xl text-wedding-gold font-script">
                  Join us for our special celebrations
                </p>
              </div>
            </motion.div>

            {/* Events Timeline */}
            <div className="space-y-6 sm:space-y-8 mb-10 sm:mb-12">
              {events.map((event, index) => (
                <motion.div
                  key={event.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="bg-white/60 rounded-xl p-6 sm:p-8 border border-wedding-gold/20"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="text-5xl sm:text-6xl">{event.icon}</div>
                    <div className="flex-1">
                      <h3 className="text-xl sm:text-2xl font-display text-wedding-navy mb-2">
                        {event.name}
                      </h3>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                        <div className="flex items-center">
                          <span className="text-wedding-gold mr-2">📆</span>
                          <p className="text-base sm:text-lg text-gray-700 font-semibold">
                            {event.date}
                          </p>
                        </div>
                        <div className="flex items-center">
                          <span className="text-wedding-gold mr-2">🕐</span>
                          <p className="text-base sm:text-lg text-gray-700 font-semibold">
                            {event.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Venue Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-wedding-rose-pastel/20 rounded-xl p-6 sm:p-8 border border-wedding-rose/20 mb-8"
            >
              <div className="flex items-center mb-4">
                <span className="text-2xl mr-3">📍</span>
                <h2 className="text-2xl sm:text-3xl font-display text-wedding-navy">
                  Venue
                </h2>
              </div>
              <div className="wedding-divider mb-4"></div>
              <p className="text-lg sm:text-xl font-semibold text-wedding-navy mb-2">
                DoubleTree by Hilton Hotel Irvine - Spectrum
              </p>
              <p className="text-base sm:text-lg text-gray-700">
                90 Pacifica, Irvine, CA 92618
              </p>
            </motion.div>

            {/* Additional Information Placeholder */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-wedding-gold-light/20 rounded-xl p-6 sm:p-8 border border-wedding-gold/20 mb-8"
            >
              <div className="flex items-center mb-4">
                <span className="text-2xl mr-3">💌</span>
                <h2 className="text-2xl sm:text-3xl font-display text-wedding-navy">
                  [Placeholder: Additional Information]
                </h2>
              </div>
              <div className="wedding-divider mb-4"></div>
              <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                [Placeholder: This section can include RSVP information, dress code reminders, special instructions, or any other important details for guests to know in advance.]
              </p>
            </motion.div>

          </motion.div>
        </div>
      </PageTransition>
    </InvitationPageLayout>
  )
}

