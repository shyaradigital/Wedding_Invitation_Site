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
                  Venue & Travel Information
                </h1>
                <div className="wedding-divider-thick max-w-md mx-auto"></div>
              </div>

              <div className="space-y-8 sm:space-y-10">
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <p className="text-base sm:text-lg md:text-xl text-gray-700 mb-8 leading-relaxed text-center">
                    We want your travel and stay to be as smooth and comfortable as possible. Below are all the venue details and recommended options to help you plan your visit.
                  </p>
                </motion.section>

                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-wedding-rose-pastel/30 rounded-xl p-6 sm:p-8 border border-wedding-rose/20"
                >
                  <div className="flex items-center mb-4">
                    <span className="text-2xl mr-3">🏨</span>
                    <h2 className="text-2xl sm:text-3xl font-display text-wedding-navy">
                      Main Venue
                    </h2>
                  </div>
                  <div className="wedding-divider mb-6"></div>
                  <p className="text-xl sm:text-2xl font-display font-semibold text-wedding-navy mb-2">
                    DoubleTree by Hilton Hotel Irvine - Spectrum
                  </p>
                  <p className="text-base sm:text-lg text-gray-700 mb-4">
                    90 Pacifica, Irvine, CA 92618
                  </p>
                  
                  {/* Google Maps Embed Placeholder */}
                  <div className="bg-gradient-to-br from-wedding-cream to-wedding-rose-pastel rounded-xl p-4 h-48 sm:h-64 flex items-center justify-center overflow-hidden mb-4 border border-wedding-gold/20">
                    <div className="text-center">
                      <span className="text-4xl mb-2 block">🗺️</span>
                      <p className="text-sm sm:text-base text-gray-600 mb-2">[Placeholder: Google Maps Embed]</p>
                      <a 
                        href="https://www.google.com/maps/search/?api=1&query=DoubleTree+by+Hilton+Hotel+Irvine+Spectrum+90+Pacifica+Irvine+CA+92618"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-wedding-gold hover:text-wedding-gold/80 underline text-sm"
                      >
                        Open in Google Maps
                      </a>
                    </div>
                  </div>

                  <p className="text-sm sm:text-base text-gray-700 italic bg-white/50 p-3 rounded-lg mb-4">
                    <strong>Note:</strong> All ceremonies (Mehndi, Hindu Wedding, and Reception) will be held at this venue.
                  </p>
                </motion.section>

                {/* Navigation Section */}
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-wedding-gold-light/20 rounded-xl p-6 sm:p-8 border border-wedding-gold/20"
                >
                  <div className="flex items-center mb-4">
                    <span className="text-2xl mr-3">🧭</span>
                    <h2 className="text-2xl sm:text-3xl font-display text-wedding-navy">
                      Getting There
                    </h2>
                  </div>
                  <div className="wedding-divider mb-6"></div>
                  
                  <div className="space-y-4">
                    <div className="bg-white/60 p-4 rounded-lg">
                      <p className="text-base sm:text-lg text-gray-800 mb-2">
                        <strong className="text-wedding-navy">From John Wayne Airport (SNA):</strong>
                      </p>
                      <p className="text-base sm:text-lg text-gray-700 mb-2">
                        Approximately 5 miles (10-15 minutes drive)
                      </p>
                      <p className="text-sm text-gray-600">
                        [Placeholder: Detailed directions from airport - Take I-405 N, exit at Jamboree Rd, etc.]
                      </p>
                    </div>

                    <div className="bg-white/60 p-4 rounded-lg">
                      <p className="text-base sm:text-lg text-gray-800 mb-2">
                        <strong className="text-wedding-navy">From Los Angeles International Airport (LAX):</strong>
                      </p>
                      <p className="text-base sm:text-lg text-gray-700 mb-2">
                        Approximately 45 miles (45-60 minutes drive)
                      </p>
                      <p className="text-sm text-gray-600">
                        [Placeholder: Detailed directions from LAX - Take I-405 S, etc.]
                      </p>
                    </div>

                    <div className="bg-white/60 p-4 rounded-lg">
                      <p className="text-base sm:text-lg text-gray-800 mb-2">
                        <strong className="text-wedding-navy">From Other Landmarks:</strong>
                      </p>
                      <p className="text-sm text-gray-600 mb-2">
                        [Placeholder: Directions from major landmarks, hotels, or common starting points]
                      </p>
                      <ul className="text-sm text-gray-600 space-y-1 ml-4 list-disc">
                        <li>[Placeholder: From Disneyland - approximately X miles]</li>
                        <li>[Placeholder: From Newport Beach - approximately X miles]</li>
                        <li>[Placeholder: From other notable locations]</li>
                      </ul>
                    </div>

                    <div className="bg-white/60 p-4 rounded-lg">
                      <p className="text-base sm:text-lg text-gray-800 mb-2">
                        <strong className="text-wedding-navy">Transportation Options:</strong>
                      </p>
                      <ul className="text-base sm:text-lg text-gray-700 space-y-1 ml-4 list-disc">
                        <li>Uber / Lyft</li>
                        <li>Taxi / Cab services</li>
                        <li>Rental car</li>
                        <li>[Placeholder: Shuttle service if available]</li>
                      </ul>
                    </div>
                  </div>
                </motion.section>

                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-wedding-cream-light rounded-xl p-6 sm:p-8 border border-wedding-gold/20"
                >
                  <div className="flex items-center mb-4">
                    <span className="text-2xl mr-3">✈️</span>
                    <h2 className="text-2xl sm:text-3xl font-display text-wedding-navy">
                      Travel & Accommodation
                    </h2>
                  </div>
                  <div className="wedding-divider mb-6"></div>
                  <div className="space-y-4">
                    <div className="bg-white/60 p-4 rounded-lg">
                      <p className="text-base sm:text-lg text-gray-800 mb-1">
                        <strong className="text-wedding-navy">Nearest Airport:</strong>
                      </p>
                      <p className="text-base sm:text-lg text-gray-700">
                        John Wayne Airport (SNA) - 5 miles away
                      </p>
                      <p className="text-base sm:text-lg text-gray-700 mt-1">
                        Los Angeles International Airport (LAX) - 45 miles away
                      </p>
                    </div>
                    <div className="bg-white/60 p-4 rounded-lg">
                      <p className="text-base sm:text-lg text-gray-800 mb-1">
                        <strong className="text-wedding-navy">Best travel options:</strong>
                      </p>
                      <p className="text-base sm:text-lg text-gray-700">
                        Uber, Lyft, Taxi, Rental Car
                      </p>
                    </div>
                    <div className="bg-white/60 p-4 rounded-lg mt-4">
                      <p className="text-base sm:text-lg font-semibold text-wedding-navy mb-4">
                        Recommended Hotels Near Venue:
                      </p>
                      <ul className="space-y-2 text-base sm:text-lg text-gray-700">
                        <li className="flex items-center">
                          <span className="text-wedding-gold mr-2">🏨</span>
                          DoubleTree by Hilton Hotel Irvine - Spectrum (Venue Hotel)
                        </li>
                        <li className="flex items-center">
                          <span className="text-wedding-gold mr-2">🏨</span>
                          [Placeholder: Additional hotel option 1]
                        </li>
                        <li className="flex items-center">
                          <span className="text-wedding-gold mr-2">🏨</span>
                          [Placeholder: Additional hotel option 2]
                        </li>
                        <li className="flex items-center">
                          <span className="text-wedding-gold mr-2">🏨</span>
                          [Placeholder: Additional hotel option 3]
                        </li>
                      </ul>
                      <p className="text-sm text-gray-600 mt-3 italic">
                        [Placeholder: Hotel booking information, group rates, or contact details if available]
                      </p>
                    </div>
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
