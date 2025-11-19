'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import PageTransition from '@/components/PageTransition'

export default function VenueTravelPage() {
  const params = useParams()
  const token = params.token as string

  return (
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
                <span className="text-2xl mr-3">🎨</span>
                <h2 className="text-2xl sm:text-3xl font-display text-wedding-navy">
                  Mehndi & Pithi Venue
                </h2>
              </div>
              <div className="wedding-divider mb-6"></div>
              <p className="text-xl sm:text-2xl font-display font-semibold text-wedding-navy mb-2">
                The Garden Courtyard
              </p>
              <p className="text-base sm:text-lg text-gray-700 mb-4">
                Sunrise Boulevard, Ahmedabad
              </p>
              <div className="bg-gradient-to-br from-wedding-cream to-wedding-rose-pastel rounded-xl p-4 h-48 sm:h-64 flex items-center justify-center overflow-hidden mb-4 border border-wedding-gold/20">
                <div className="text-center">
                  <span className="text-4xl mb-2 block">🗺️</span>
                  <p className="text-sm sm:text-base text-gray-600">Google Maps Link: (Add map embed here)</p>
                </div>
              </div>
              <p className="text-sm sm:text-base text-gray-700 italic bg-white/50 p-3 rounded-lg">
                <strong>Notes:</strong> Open lawns with comfortable seating. Light snacks and refreshments will be served.
              </p>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-wedding-gold-light/20 rounded-xl p-6 sm:p-8 border border-wedding-gold/20"
            >
              <div className="flex items-center mb-4">
                <span className="text-2xl mr-3">💒</span>
                <h2 className="text-2xl sm:text-3xl font-display text-wedding-navy">
                  Hindu Wedding Venue
                </h2>
              </div>
              <div className="wedding-divider mb-6"></div>
              <p className="text-xl sm:text-2xl font-display font-semibold text-wedding-navy mb-2">
                The Grand Lotus Palace
              </p>
              <p className="text-base sm:text-lg text-gray-700 mb-4">
                Ring Road, Ahmedabad
              </p>
              <div className="bg-gradient-to-br from-wedding-cream to-wedding-gold-light rounded-xl p-4 h-48 sm:h-64 flex items-center justify-center overflow-hidden mb-4 border border-wedding-gold/20">
                <div className="text-center">
                  <span className="text-4xl mb-2 block">🗺️</span>
                  <p className="text-sm sm:text-base text-gray-600">Google Maps Link: (Add embed)</p>
                </div>
              </div>
              <p className="text-sm sm:text-base text-gray-700 italic bg-white/50 p-3 rounded-lg">
                <strong>Notes:</strong> Traditional setup with mandap, floral décor, and witnessing areas for guests. Parking available on-site.
              </p>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-wedding-burgundy-light/10 rounded-xl p-6 sm:p-8 border border-wedding-burgundy/20"
            >
              <div className="flex items-center mb-4">
                <span className="text-2xl mr-3">🎉</span>
                <h2 className="text-2xl sm:text-3xl font-display text-wedding-navy">
                  Reception Venue
                </h2>
              </div>
              <div className="wedding-divider mb-6"></div>
              <p className="text-xl sm:text-2xl font-display font-semibold text-wedding-navy mb-2">
                Royal Orchid Ballroom
              </p>
              <p className="text-base sm:text-lg text-gray-700 mb-4">
                Near Riverfront, Ahmedabad
              </p>
              <div className="bg-gradient-to-br from-wedding-cream to-wedding-rose-pastel rounded-xl p-4 h-48 sm:h-64 flex items-center justify-center overflow-hidden mb-4 border border-wedding-gold/20">
                <div className="text-center">
                  <span className="text-4xl mb-2 block">🗺️</span>
                  <p className="text-sm sm:text-base text-gray-600">Google Maps Link: (Add embed)</p>
                </div>
              </div>
              <p className="text-sm sm:text-base text-gray-700 italic bg-white/50 p-3 rounded-lg">
                <strong>Notes:</strong> Elegant indoor banquet with live music, full-course dinner, and dance floor.
              </p>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-wedding-cream-light rounded-xl p-6 sm:p-8 border border-wedding-gold/20"
            >
              <div className="flex items-center mb-4">
                <span className="text-2xl mr-3">✈️</span>
                <h2 className="text-2xl sm:text-3xl font-display text-wedding-navy">
                  Travel Tips
                </h2>
              </div>
              <div className="wedding-divider mb-6"></div>
              <div className="space-y-4">
                <div className="bg-white/60 p-4 rounded-lg">
                  <p className="text-base sm:text-lg text-gray-800 mb-1">
                    <strong className="text-wedding-navy">Nearest Airport:</strong>
                  </p>
                  <p className="text-base sm:text-lg text-gray-700">
                    Ahmedabad International Airport (AMD)
                  </p>
                </div>
                <div className="bg-white/60 p-4 rounded-lg">
                  <p className="text-base sm:text-lg text-gray-800 mb-1">
                    <strong className="text-wedding-navy">Best travel options:</strong>
                  </p>
                  <p className="text-base sm:text-lg text-gray-700">
                    cab, Uber, Ola
                  </p>
                </div>
                <div className="bg-white/60 p-4 rounded-lg mt-4">
                  <p className="text-base sm:text-lg font-semibold text-wedding-navy mb-4">
                    Recommended Hotels (5–15 mins from venues):
                  </p>
                  <ul className="space-y-2 text-base sm:text-lg text-gray-700">
                    <li className="flex items-center">
                      <span className="text-wedding-gold mr-2">🏨</span>
                      Hotel Silver Inn
                    </li>
                    <li className="flex items-center">
                      <span className="text-wedding-gold mr-2">🏨</span>
                      The Lotus Premium
                    </li>
                    <li className="flex items-center">
                      <span className="text-wedding-gold mr-2">🏨</span>
                      Riverfront Residency
                    </li>
                  </ul>
                </div>
              </div>
            </motion.section>
          </div>

          <div className="mt-10 sm:mt-12 text-center">
            <Link
              href={`/invite/${token}`}
              className="inline-flex items-center bg-gradient-gold text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold hover:shadow-lg transition-all duration-300 text-base sm:text-lg"
            >
              <span className="mr-2">←</span> Return Home
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
    </PageTransition>
  )
}

