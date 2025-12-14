'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import Image from 'next/image'
import PageTransition from './PageTransition'
import PreviewBanner from './PreviewBanner'

const eventInfo: Record<string, { title: string; icon: string; color: string }> = {
  mehndi: { title: 'Mehndi', icon: '/icons/mehndi-icon.png', color: 'wedding-rose' },
  wedding: { title: 'Hindu Wedding', icon: '/icons/wedding-icon.png', color: 'wedding-gold' },
  reception: { title: 'Reception', icon: '/icons/reception-icon.png', color: 'wedding-burgundy' },
}

function getDefaultDescription(slug: string): string {
  switch (slug) {
    case 'mehndi': return 'A vibrant celebration filled with colors, music, fun, and beautiful traditions.'
    case 'wedding': return 'Join us as Ankita and Jay tie the knot in a traditional Hindu ceremony.'
    case 'reception': return 'An evening filled with celebration, music, good food, dancing, and unforgettable memories.'
    default: return ''
  }
}

function getDefaultDate(slug: string): string | null {
  switch (slug) {
    case 'mehndi': return '12th December 2025'
    case 'wedding': return '13th December 2025'
    case 'reception': return '14th December 2025'
    default: return null
  }
}

function getDefaultTime(slug: string): string | null {
  switch (slug) {
    case 'mehndi': return '4:00 PM onwards'
    case 'wedding': return '7:15 AM'
    case 'reception': return '7:30 PM onwards'
    default: return null
  }
}

function getDefaultVenue(slug: string): string | null {
  switch (slug) {
    case 'mehndi': return 'The Garden Courtyard'
    case 'wedding': return 'The Grand Lotus Palace'
    case 'reception': return 'Royal Orchid Ballroom'
    default: return null
  }
}

function getDefaultAddress(slug: string): string | null {
  switch (slug) {
    case 'mehndi': return 'Sunrise Boulevard, Ahmedabad'
    case 'wedding': return 'Ring Road, Ahmedabad'
    case 'reception': return 'Near Riverfront, Ahmedabad'
    default: return null
  }
}

function getDefaultDressCode(slug: string): string | null {
  switch (slug) {
    case 'mehndi': return 'Bright, festive, and colorful traditional wear.'
    case 'wedding': return 'Traditional Indian wear — ethnic, elegant, and graceful.'
    case 'reception': return 'Formal / Indo-western evening wear.'
    default: return null
  }
}

export default function PreviewEventContent({ token, slug }: { token: string; slug: string }) {
  const [event, setEvent] = useState<any>(null)

  useEffect(() => {
    fetch(`/api/events/${slug}?t=${Date.now()}`, { cache: 'no-store', headers: { 'Cache-Control': 'no-cache' } })
      .then((res) => res.json())
      .then((data) => {
        if (data.event) {
          setEvent({ ...eventInfo[slug], ...data.event })
        } else {
          setEvent(eventInfo[slug])
        }
      })
      .catch(() => setEvent(eventInfo[slug]))
  }, [slug])

  if (!event) {
    return (
      <>
        <PreviewBanner />
        <div className="min-h-screen flex items-center justify-center bg-wedding-cream">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wedding-gold mx-auto mb-4"></div>
            <p className="text-wedding-navy">Loading...</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <PreviewBanner />
      <PageTransition>
        <div className="min-h-screen bg-gradient-wedding">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="wedding-card rounded-2xl p-6 sm:p-8 md:p-12"
            >
              <div className="text-center mb-8 sm:mb-10">
                <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 mx-auto mb-4 sm:mb-5 relative">
                  <Image
                    src={event.icon}
                    alt={event.title}
                    width={128}
                    height={128}
                    className="w-full h-full object-contain"
                  />
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-display text-wedding-navy mb-4 sm:mb-5 font-bold">
                  {event.title}
                </h1>
                <div className="wedding-divider-thick max-w-md mx-auto"></div>
              </div>

              <div className="space-y-8 sm:space-y-10">
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

                {((event as any).date || (event as any).time || getDefaultDate(slug) || getDefaultTime(slug)) && (
                  <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white/60 rounded-xl p-6 sm:p-8 border border-wedding-rose/20"
                  >
                    <div className="flex items-center mb-4">
                      <span className="text-2xl mr-3">📅</span>
                      <h2 className="text-2xl sm:text-3xl font-display text-wedding-navy">Date & Time</h2>
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

                {((event as any).venue || (event as any).address || getDefaultVenue(slug) || getDefaultAddress(slug)) && (
                  <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white/60 rounded-xl p-6 sm:p-8 border border-wedding-gold/20"
                  >
                    <div className="flex items-center mb-4">
                      <span className="text-2xl mr-3">📍</span>
                      <h2 className="text-2xl sm:text-3xl font-display text-wedding-navy">Venue</h2>
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
                  </motion.section>
                )}

                {((event as any).dressCode || getDefaultDressCode(slug)) && (
                  <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-wedding-rose-pastel/30 rounded-xl p-6 sm:p-8 border border-wedding-rose/20"
                  >
                    <div className="flex items-center mb-4">
                      <span className="text-2xl mr-3">👗</span>
                      <h2 className="text-2xl sm:text-3xl font-display text-wedding-navy">Dress Code</h2>
                    </div>
                    <div className="wedding-divider mb-6"></div>
                    <p className="text-base sm:text-lg md:text-xl text-gray-700">
                      {(event as any).dressCode || getDefaultDressCode(slug)}
                    </p>
                  </motion.section>
                )}
              </div>

              <div className="mt-10 sm:mt-12 text-center">
                <Link
                  href={`/admin/preview/${token}`}
                  className="inline-flex items-center bg-gradient-gold text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold hover:shadow-lg transition-all duration-300 text-base sm:text-lg"
                >
                  <span className="mr-2">←</span> Return Home
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </PageTransition>
    </>
  )
}

