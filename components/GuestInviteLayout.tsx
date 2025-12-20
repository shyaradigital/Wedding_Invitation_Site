'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import InvitationNavigation from './InvitationNavigation'
import FloatingPetals from './FloatingPetals'
import FloatingHearts from './FloatingHearts'
import OrnamentalDivider from './OrnamentalDivider'
import AdminPreviewBanner from './AdminPreviewBannerNew'
import VimeoVideoPlayer from './VimeoVideoPlayer'

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
  mehndi: { title: 'Mehndi', slug: 'mehndi' },
  wedding: { title: 'Hindu Wedding Ceremony', slug: 'wedding' },
  reception: { title: 'Reception', slug: 'reception' },
}

export default function GuestInviteLayout({
  guest,
  token,
}: GuestInviteLayoutProps) {
  const isAdminPreview = token === 'admin-preview'

  // Determine which video to show based on guest type
  const isAllEvents =
    guest.eventAccess.includes('mehndi') &&
    guest.eventAccess.includes('wedding') &&
    guest.eventAccess.includes('reception')

  // Vimeo video IDs
  const weddingVideoId = '1148319858' // All events guests
  const receptionVideoId = '1148320401' // Reception-only guests

  return (
    <div className="min-h-screen bg-gradient-to-br from-wedding-rose-pastel via-wedding-cream to-wedding-gold-light relative overflow-hidden">
      {/* Admin Preview Banner - Show only in admin preview mode */}
      {isAdminPreview && <AdminPreviewBanner />}
      
      <FloatingPetals />
      <FloatingHearts />
      {/* Navigation */}
      <InvitationNavigation token={token} eventAccess={guest.eventAccess} guestName={guest.name} />

      {/* Main Content - Add left margin on desktop to account for sidebar */}
      <main className="relative z-10 md:ml-64">
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

            {/* Ganesh Image and Prayer - At the very top */}
            <div className="text-center mb-8 sm:mb-10 relative z-10">
              {/* Ganesh Image */}
              <div className="mb-4 sm:mb-6">
                <div className="relative w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 mx-auto">
                  <Image
                    src="/images/ganesh.png"
                    alt="Ganesh"
                    width={256}
                    height={256}
                    className="w-full h-full object-contain"
                    priority
                  />
                </div>
              </div>
              <div className="text-sm sm:text-base md:text-lg lg:text-xl text-wedding-navy/80 leading-relaxed font-serif">
                <p className="mb-2">श्री गणेशाय नमः</p>
                <p className="mb-1">वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ ।</p>
                <p>निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा ॥</p>
              </div>
            </div>

            <OrnamentalDivider variant="ornate" className="mb-8 sm:mb-10" />

            {/* Engagement Ceremony Photos Title */}
            <div className="text-center mb-6 sm:mb-8">
              <div className="relative inline-block">
                {/* Decorative golden dots on sides */}
                <div className="absolute left-0 top-1/2 -translate-x-full -translate-y-1/2 hidden sm:block">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-wedding-gold rounded-full"></div>
                    <div className="w-12 h-px bg-gradient-to-r from-wedding-gold to-transparent"></div>
                  </div>
                </div>
                <div className="absolute right-0 top-1/2 translate-x-full -translate-y-1/2 hidden sm:block">
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-px bg-gradient-to-l from-wedding-gold to-transparent"></div>
                    <div className="w-1.5 h-1.5 bg-wedding-gold rounded-full"></div>
                  </div>
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-script text-wedding-navy tracking-wide">
                  Engagement Ceremony Photos
                </h2>
              </div>
            </div>

            {/* Couple Images Side by Side with Moving Hearts */}
            <div className="mb-6 sm:mb-8 relative z-10">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-12 md:gap-16 relative">
                {/* Moving Hearts Container - Behind the images */}
                <div className="absolute left-0 right-0 top-0 bottom-0 pointer-events-none overflow-visible z-0">
                  {/* Hearts flowing from first image to second - Desktop (horizontal) */}
                  <div className="hidden sm:block absolute inset-0">
                    {[...Array(15)].map((_, i) => {
                      const startLeft = '22.5%'
                      const endLeft = '77.5%'
                      const verticalPos = 10 + ((i % 8) * 11)
                      const cycleOffset = Math.floor(i / 8) * 2
                      return (
                        <motion.div
                          key={`desktop-${i}`}
                          className="absolute text-wedding-rose/85"
                          style={{
                            fontSize: 'clamp(18px, 1.8vw, 26px)',
                            left: startLeft,
                            top: `${verticalPos}%`,
                            zIndex: 0,
                          }}
                          animate={{
                            left: [startLeft, endLeft, endLeft],
                            y: [0, Math.sin(i * 0.7) * 15, Math.sin(i * 0.7) * 15],
                            opacity: [0, 0.9, 0],
                            scale: [0.8, 1.3, 0.8],
                          }}
                          transition={{
                            duration: 6 + (i % 3) * 0.8,
                            delay: (i * 0.3) + cycleOffset,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                        >
                          ❤️
                        </motion.div>
                      )
                    })}
                  </div>
                  {/* Hearts flowing from first image to second - Mobile (vertical) */}
                  <div className="block sm:hidden absolute inset-0">
                    {[...Array(12)].map((_, i) => {
                      const startTop = '20%'
                      const endTop = '80%'
                      const horizontalPos = 50 + Math.sin(i) * 8
                      const cycleOffset = Math.floor(i / 6) * 1.5
                      return (
                        <motion.div
                          key={`mobile-${i}`}
                          className="absolute text-wedding-rose/85"
                          style={{
                            fontSize: 'clamp(18px, 4.5vw, 24px)',
                            left: `${horizontalPos}%`,
                            top: startTop,
                            transform: 'translateX(-50%)',
                            zIndex: 0,
                          }}
                          animate={{
                            top: [startTop, endTop, endTop],
                            x: [0, Math.sin(i * 1.2) * 20, Math.sin(i * 1.2) * 20],
                            opacity: [0, 0.9, 0],
                            scale: [0.8, 1.3, 0.8],
                          }}
                          transition={{
                            duration: 5.5 + (i % 3) * 0.6,
                            delay: (i * 0.35) + cycleOffset,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                        >
                          ❤️
                        </motion.div>
                      )
                    })}
                  </div>
                </div>

                {/* First Image - About Jay and Ankita */}
                <div className="relative w-full sm:w-[45%] max-w-md md:max-w-lg z-10">
                  <div className="relative rounded-2xl overflow-hidden shadow-lg">
                    <Image
                      src="/about-jay-ankita.jpeg"
                      alt="Jay and Ankita"
                      width={600}
                      height={750}
                      className="w-full h-auto object-cover"
                      priority
                    />
                  </div>
                </div>

                {/* Second Image - Reception Pic */}
                <div className="relative w-full sm:w-[45%] max-w-md md:max-w-lg z-10">
                  <div className="relative rounded-2xl overflow-hidden shadow-lg">
                    <Image
                      src="/images/reception-pic.jpeg"
                      alt="Jay and Ankita Reception"
                      width={600}
                      height={750}
                      className="w-full h-auto object-cover"
                      priority
                    />
                  </div>
                </div>
              </div>
            </div>

            <OrnamentalDivider variant="ornate" className="mb-6 sm:mb-8" />

            {/* Love Story Write-up */}
            <div className="mb-6 sm:mb-8">
              <div className="text-center mb-4 sm:mb-6">
                <p className="text-base sm:text-lg md:text-xl text-wedding-navy italic font-serif leading-relaxed">
                  &ldquo;True love sees the soul, embraces the uniqueness in one another and transcends geographical borders&rdquo;.
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
          </motion.div>

          {/* Video Player Section - At the end of the page */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="wedding-card rounded-3xl p-4 sm:p-6 md:p-8 lg:p-12 mt-8 sm:mt-12 relative"
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

            {/* Header Section */}
            <div className="text-center mb-6 sm:mb-8 relative z-10">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="mb-4 sm:mb-6"
              >
                <span className="text-5xl sm:text-6xl md:text-7xl">🎬</span>
              </motion.div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-script text-wedding-navy mb-4 sm:mb-6">
                Our Invitation
              </h2>
              <OrnamentalDivider variant="ornate" className="mb-4 sm:mb-6" />
            </div>

            {/* Video Player */}
            <div className="relative z-10 w-full">
              <VimeoVideoPlayer 
                videoId={isAllEvents ? weddingVideoId : receptionVideoId}
                title={isAllEvents ? 'Jay Bhavan & Ankita Brijesh Wedding' : 'Jay Bhavan & Ankita Brijesh Reception'}
              />
            </div>

            {/* Instructions */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-6 sm:mt-8 text-center"
            >
              <p className="text-sm sm:text-base text-gray-600 font-serif italic">
                Click the play button to watch our special invitation
              </p>
            </motion.div>
          </motion.div>

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-wedding-navy to-wedding-navy-light text-white py-6 sm:py-8 md:py-12 mt-8 sm:mt-12 md:mt-16 md:ml-64 relative z-10">
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
