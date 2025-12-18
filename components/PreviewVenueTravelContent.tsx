'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import PageTransition from './PageTransition'
import PreviewBanner from './PreviewBanner'

export default function PreviewVenueTravelContent({ token }: { token: string }) {
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
              <div className="text-center mb-8 sm:mb-12">
                <div className="flex justify-center mb-4">
                  <span className="text-4xl sm:text-5xl">📍</span>
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-display text-wedding-navy mb-4">
                  Travel & Venue Information
                </h1>
                <div className="wedding-divider-thick max-w-md mx-auto"></div>
              </div>

              <div className="space-y-6 sm:space-y-8">
                {/* Airport Information */}
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-wedding-rose-pastel/30 rounded-xl p-6 sm:p-8 border border-wedding-rose/20"
                >
                  <div className="flex items-center mb-4">
                    <span className="text-2xl mr-3">✈️</span>
                    <h2 className="text-2xl sm:text-3xl font-display text-wedding-navy">
                      Airport Information
                    </h2>
                  </div>
                  <div className="wedding-divider mb-4"></div>
                  <p className="text-base sm:text-lg md:text-xl text-gray-700 leading-relaxed">
                    Nearest Airport is John Wayne Airport (SNA) and nearest International Airport is Los Angeles International Airport (LAX)
                  </p>
                </motion.section>

                {/* Venue Information */}
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-wedding-rose-pastel/30 rounded-xl p-6 sm:p-8 border border-wedding-rose/20"
                >
                  <div className="flex items-center mb-4">
                    <span className="text-2xl mr-3">🏨</span>
                    <h2 className="text-2xl sm:text-3xl font-display text-wedding-navy">
                      Venue
                    </h2>
                  </div>
                  <div className="wedding-divider mb-4"></div>
                  <p className="text-base sm:text-lg md:text-xl text-gray-700 leading-relaxed mb-4">
                    <span className="font-semibold">Venue:</span> DoubleTree by Hilton Hotel Irvine – Spectrum provides complimentary shuttle. Guests are requested to call 949-471-8888 upon arrival.
                  </p>
                  <p className="text-xl sm:text-2xl font-display font-semibold text-wedding-navy mb-2">
                    DoubleTree by Hilton Hotel Irvine - Spectrum
                  </p>
                  <p className="text-base sm:text-lg text-gray-700 mb-4">
                    90 Pacifica, Irvine, CA 92618
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
                </motion.section>

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
