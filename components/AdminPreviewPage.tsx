'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import EventCard from './EventCard'
import Link from 'next/link'

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

interface AdminPreviewPageProps {
  guest: Guest
  token: string
}

const eventSlugs: Record<string, { title: string; slug: string }> = {
  mehndi: { title: 'Mehndi & Pithi', slug: 'mehndi' },
  wedding: { title: 'Hindu Wedding', slug: 'wedding' },
  reception: { title: 'Reception', slug: 'reception' },
}

export default function AdminPreviewPage({
  guest,
  token,
}: AdminPreviewPageProps) {
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null)

  const availableEvents = guest.eventAccess
    .map((slug) => eventSlugs[slug])
    .filter(Boolean)

  return (
    <div className="min-h-screen bg-gradient-wedding">
      {/* Admin Preview Banner */}
      <div className="bg-yellow-500 text-yellow-900 px-4 py-3 text-center font-semibold shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
          <span className="text-xl">👁️</span>
          <span>ADMIN PREVIEW MODE - This view does not count as a device</span>
          <Link
            href="/admin"
            className="ml-4 px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors text-sm"
          >
            Back to Admin
          </Link>
        </div>
      </div>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-wedding-gold/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-display text-wedding-navy text-center">
            Welcome, {guest.name}! 💐
          </h1>
        </div>
      </header>

      {/* Hero Image Placeholder */}
      <div className="relative w-full h-64 sm:h-80 md:h-96 bg-gradient-to-br from-wedding-rose-pastel via-wedding-cream to-wedding-gold-light overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center z-10">
            <div className="text-6xl sm:text-7xl md:text-8xl mb-4">💑</div>
            <p className="text-wedding-navy/60 text-sm sm:text-base italic">Photo Placeholder</p>
          </div>
        </div>
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23D4AF37' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat'
          }}
        ></div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Welcome Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-16"
        >
          <div className="flex justify-center mb-4">
            <span className="text-3xl sm:text-4xl">💍</span>
          </div>
          <h2 className="text-5xl sm:text-6xl md:text-7xl font-display text-wedding-navy mb-4 sm:mb-6 font-bold">
            Ankita <span className="text-wedding-gold">&</span> Jay
          </h2>
          <div className="wedding-divider-thick max-w-md mx-auto mb-6"></div>
          <p className="text-xl sm:text-2xl md:text-3xl text-wedding-gold mb-6 sm:mb-8 px-2 font-script">
            Celebrating Love, Laughter, and a Lifetime Together
          </p>
          <div className="mb-8 sm:mb-10">
            <div className="inline-block bg-wedding-rose-pastel/50 px-6 py-3 rounded-full border border-wedding-gold/30">
              <p className="text-xl sm:text-2xl md:text-3xl font-display text-wedding-navy">
                14th December 2025
              </p>
            </div>
          </div>
          <div className="max-w-3xl mx-auto px-4 space-y-4">
            <p className="text-base sm:text-lg md:text-xl text-gray-700 leading-relaxed">
              Welcome to our wedding website!
            </p>
            <p className="text-base sm:text-lg md:text-xl text-gray-700 leading-relaxed">
              We are so excited to celebrate this beautiful journey with all our family and friends.
            </p>
            <p className="text-base sm:text-lg md:text-xl text-gray-700 leading-relaxed">
              Here you will find all the details about our ceremonies, venues, timings, and travel information.
            </p>
            <p className="text-base sm:text-lg md:text-xl text-wedding-navy font-medium leading-relaxed">
              We can&apos;t wait to make memories with you!
            </p>
          </div>
        </motion.section>

        {/* Event Cards */}
        <section className="mb-10 sm:mb-16">
          <div className="text-center mb-8 sm:mb-12">
            <div className="flex justify-center mb-4">
              <span className="text-2xl sm:text-3xl">🌸</span>
            </div>
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-display text-wedding-navy mb-4 px-2">
              Our Celebrations
            </h3>
            <div className="wedding-divider max-w-xs mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {availableEvents.map((event, index) => (
              <motion.div
                key={event.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={`/admin/preview/${token}/events/${event.slug}`}>
                  <EventCard
                    slug={event.slug}
                    title={event.title}
                    onClick={() => setSelectedEvent(event.slug)}
                  />
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Navigation Links */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-10 sm:mb-16">
          <Link href={`/admin/preview/${token}/about`}>
            <motion.div
              whileHover={{ scale: 1.03, y: -4 }}
              whileTap={{ scale: 0.98 }}
              className="wedding-card rounded-xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-300 hover:shadow-xl"
            >
              <div className="text-4xl mb-4">💑</div>
              <h3 className="text-2xl sm:text-3xl font-display text-wedding-navy mb-3">
                Our Story
              </h3>
              <div className="wedding-divider max-w-24 mx-auto mb-3"></div>
              <p className="text-sm sm:text-base text-gray-600">Learn more about Ankita & Jay</p>
            </motion.div>
          </Link>

          <Link href={`/admin/preview/${token}/venue-travel`}>
            <motion.div
              whileHover={{ scale: 1.03, y: -4 }}
              whileTap={{ scale: 0.98 }}
              className="wedding-card rounded-xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-300 hover:shadow-xl"
            >
              <div className="text-4xl mb-4">📍</div>
              <h3 className="text-2xl sm:text-3xl font-display text-wedding-navy mb-3">
                Venue & Travel
              </h3>
              <div className="wedding-divider max-w-24 mx-auto mb-3"></div>
              <p className="text-sm sm:text-base text-gray-600">Location details and directions</p>
            </motion.div>
          </Link>

          <Link href={`/admin/preview/${token}/gallery`}>
            <motion.div
              whileHover={{ scale: 1.03, y: -4 }}
              whileTap={{ scale: 0.98 }}
              className="wedding-card rounded-xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-300 hover:shadow-xl"
            >
              <div className="text-4xl mb-4">📸</div>
              <h3 className="text-2xl sm:text-3xl font-display text-wedding-navy mb-3">
                Gallery
              </h3>
              <div className="wedding-divider max-w-24 mx-auto mb-3"></div>
              <p className="text-sm sm:text-base text-gray-600">Beautiful moments from our celebrations</p>
            </motion.div>
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-wedding-navy to-wedding-navy-light text-white py-8 sm:py-12 mt-12 sm:mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <div className="flex justify-center mb-4">
            <span className="text-3xl">💛</span>
          </div>
          <p className="text-lg sm:text-xl mb-3 font-script text-wedding-gold-light">
            Made with love for our special day
          </p>
          <p className="text-base sm:text-lg mb-6">
            Thank you for being a part of our celebration.
          </p>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-6">
            <Link
              href={`/admin/preview/${token}/about`}
              className="text-sm sm:text-base text-wedding-gold-light hover:text-wedding-gold transition-colors"
            >
              Our Story
            </Link>
            <Link
              href={`/admin/preview/${token}/venue-travel`}
              className="text-sm sm:text-base text-wedding-gold-light hover:text-wedding-gold transition-colors"
            >
              Venue & Travel
            </Link>
            <Link
              href={`/admin/preview/${token}/gallery`}
              className="text-sm sm:text-base text-wedding-gold-light hover:text-wedding-gold transition-colors"
            >
              Gallery
            </Link>
          </div>
          <div className="wedding-divider max-w-xs mx-auto mb-6 opacity-30"></div>
          <p className="text-xs sm:text-sm opacity-75">
            © {new Date().getFullYear()} Ankita & Jay
          </p>
        </div>
      </footer>
    </div>
  )
}

