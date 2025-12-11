'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import EventCard from './EventCard'
import Link from 'next/link'
import InvitationNavigation from './InvitationNavigation'
import FloatingPetals from './FloatingPetals'
import OrnamentalDivider from './OrnamentalDivider'

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

interface GuestInviteLayoutProps {
  guest: Guest
  token: string
}

const eventSlugs: Record<string, { title: string; slug: string }> = {
  mehndi: { title: 'Mehendi', slug: 'mehndi' },
  wedding: { title: 'Hindu Wedding Ceremony', slug: 'wedding' },
  reception: { title: 'Reception', slug: 'reception' },
}

export default function GuestInviteLayout({
  guest,
  token,
}: GuestInviteLayoutProps) {
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null)

  const availableEvents = guest.eventAccess
    .map((slug) => eventSlugs[slug])
    .filter(Boolean)

  return (
    <div className="min-h-screen bg-gradient-to-br from-wedding-rose-pastel via-wedding-cream to-wedding-gold-light relative overflow-hidden">
      <FloatingPetals />
      {/* Navigation */}
      <InvitationNavigation token={token} eventAccess={guest.eventAccess} guestName={guest.name} />

      {/* Main Content */}
      <main className="relative z-10">
        <div className="max-w-[640px] mx-auto px-4 sm:px-6 md:px-12 py-8 sm:py-12 md:py-16">
          {/* Main Invitation Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="wedding-card rounded-3xl p-6 sm:p-8 md:p-12 relative"
            style={{
              background: 'linear-gradient(135deg, #FFFEF7 0%, #FAF9F6 100%)',
              border: '2px solid rgba(212, 175, 55, 0.3)',
            }}
            >
            {/* Floral border decoration - corners */}
            <div className="absolute top-0 left-0 w-16 h-16 opacity-30">
              <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M32 8C20 8 12 16 12 28C12 40 20 48 32 48C44 48 52 40 52 28C52 16 44 8 32 8Z" fill="#D4AF37" opacity="0.3"/>
              </svg>
            </div>
            <div className="absolute top-0 right-0 w-16 h-16 opacity-30 transform rotate-90">
              <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M32 8C20 8 12 16 12 28C12 40 20 48 32 48C44 48 52 40 52 28C52 16 44 8 32 8Z" fill="#D4AF37" opacity="0.3"/>
              </svg>
            </div>
            <div className="absolute bottom-0 left-0 w-16 h-16 opacity-30 transform -rotate-90">
              <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M32 8C20 8 12 16 12 28C12 40 20 48 32 48C44 48 52 40 52 28C52 16 44 8 32 8Z" fill="#D4AF37" opacity="0.3"/>
              </svg>
            </div>
            <div className="absolute bottom-0 right-0 w-16 h-16 opacity-30 transform rotate-180">
              <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M32 8C20 8 12 16 12 28C12 40 20 48 32 48C44 48 52 40 52 28C52 16 44 8 32 8Z" fill="#D4AF37" opacity="0.3"/>
              </svg>
            </div>

            {/* Couple Image */}
            <div className="mb-6 sm:mb-8">
              <div className="relative w-full max-w-lg mx-auto rounded-2xl overflow-hidden shadow-lg">
                <Image
                  src="/about-jay-ankita.jpeg"
                  alt="Jay and Ankita"
                  width={800}
                  height={600}
                  className="w-full h-auto object-cover"
                  priority
                />
              </div>
            </div>

            <OrnamentalDivider variant="ornate" className="mb-6 sm:mb-8" />

            {/* Love Story Write-up */}
            <div className="mb-6 sm:mb-8">
              <div className="text-center mb-4 sm:mb-6">
                <p className="text-base sm:text-lg md:text-xl text-wedding-navy italic font-serif leading-relaxed">
                  "True love sees the soul, embraces the uniqueness in one another and transcends geographical borders".
                </p>
              </div>
              
              <div className="text-left space-y-4 sm:space-y-5">
                <p className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed font-serif">
                  Even though Ankita was raised in India and Jay was raised in US, they exemplify the essence of true love. Our love story originated thousands of miles away from each other, Ankita in Michigan and Jay in California, and quickly transpired into an inseparable bond based on love, trust and understanding.
                </p>
                <p className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed font-serif">
                  Combining Indian and American values Jay and Ankita created an everlasting bond and committed to spending the rest of their lives together.
                </p>
              </div>
            </div>

            <OrnamentalDivider variant="ornate" className="mb-6 sm:mb-8" />

            {/* Sanskrit Shloka */}
            <div className="text-center mb-6 sm:mb-8">
              <div className="text-xs sm:text-sm md:text-base text-wedding-navy/80 leading-relaxed font-serif">
                <p className="mb-2">श्री गणेशाय नमः</p>
                <p className="mb-1">वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ ।</p>
                <p>निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा ॥</p>
              </div>
            </div>

            <OrnamentalDivider variant="ornate" className="mb-6 sm:mb-8" />

            {/* Welcome Message */}
            <div className="text-center mb-6 sm:mb-8">
              <p className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed font-serif">
                Your presence will make our celebration even more memorable.
              </p>
              <p className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed font-serif mt-2">
                We look forward to having you with us on this wonderful occasion.
              </p>
            </div>

            <OrnamentalDivider variant="ornate" className="mb-6 sm:mb-8" />

            {/* Names with Parents */}
            <div className="text-center mb-6 sm:mb-8">
              <div className="mb-4 sm:mb-6">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-script text-wedding-navy mb-2 sm:mb-3 font-bold">
                  Jay Bhavan Mehta
                </h1>
                <p className="text-xs sm:text-sm md:text-base text-gray-600 font-serif italic">
                  Son of Mr. Bhavan Vidyut Mehta & Mrs. Nina Bhavan Mehta
                </p>
              </div>

              {/* "With" divider */}
              <div className="flex items-center justify-center my-4 sm:my-6">
                <div className="flex items-center w-full max-w-xs">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent to-wedding-gold"></div>
                  <span className="mx-3 sm:mx-4 text-wedding-gold font-script text-xl sm:text-2xl md:text-3xl">With</span>
                  <div className="flex-1 h-px bg-gradient-to-l from-transparent to-wedding-gold"></div>
                </div>
              </div>

              <div className="mt-4 sm:mt-6">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-script text-wedding-navy mb-2 sm:mb-3 font-bold">
                  Ankita Brijesh Sharma
                </h1>
                <p className="text-xs sm:text-sm md:text-base text-gray-600 font-serif italic">
                  Daughter of Mr. Brijesh Kumar Sharma & Mrs. Ruchira Sharma
                </p>
              </div>
            </div>

            <OrnamentalDivider variant="ornate" className="mb-6 sm:mb-8" />

            {/* Date */}
            <div className="text-center">
              <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-script text-wedding-gold font-semibold">
                21st Day of March 2026
              </p>
            </div>
          </motion.div>

          {/* Event Cards Section */}
          {availableEvents.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-8 sm:mt-12 md:mt-16"
            >
              <div className="text-center mb-6 sm:mb-8">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-script text-wedding-navy mb-3 sm:mb-4">
                  Our Celebrations
                </h2>
                <OrnamentalDivider variant="simple" className="max-w-xs mx-auto" />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:gap-6 md:gap-8">
                {availableEvents.map((event, index) => (
                  <motion.div
                    key={event.slug}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                  >
                    <Link href={`/invite/${token}/events/${event.slug}`}>
                      <EventCard
                        slug={event.slug}
                        title={event.title}
                        onClick={() => setSelectedEvent(event.slug)}
                      />
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-wedding-navy to-wedding-navy-light text-white py-6 sm:py-8 md:py-12 mt-8 sm:mt-12 md:mt-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <div className="flex justify-center mb-3 sm:mb-4">
            <span className="text-2xl sm:text-3xl">💛</span>
          </div>
          <p className="text-base sm:text-lg md:text-xl mb-2 sm:mb-3 font-script text-wedding-gold-light">
            Made with love for our special day
          </p>
          <p className="text-sm sm:text-base md:text-lg mb-4 sm:mb-6">
            Thank you for being a part of our celebration.
          </p>
          <div className="wedding-divider max-w-xs mx-auto mb-4 sm:mb-6 opacity-30"></div>
          <p className="text-xs sm:text-sm opacity-75">
            © {new Date().getFullYear()} Ankita Brijesh Sharma & Jay Bhavan Mehta
          </p>
        </div>
      </footer>
    </div>
  )
}
