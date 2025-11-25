'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import PageTransition from './PageTransition'
import PreviewBanner from './PreviewBanner'
import { useEffect, useState } from 'react'

export default function PreviewAboutAnkitaContent({ token }: { token: string }) {
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
                  <span className="text-4xl sm:text-5xl">👰</span>
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-display text-wedding-navy mb-4">
                  About Ankita
                </h1>
                <div className="wedding-divider-thick max-w-md mx-auto"></div>
                <p className="text-xl sm:text-2xl font-display text-wedding-gold mt-4">
                  Ankita Brijesh Sharma
                </p>
              </div>

              {/* Photo Placeholder */}
              <div className="mb-10 sm:mb-12">
                <div className="relative w-full h-64 sm:h-80 md:h-96 bg-gradient-to-br from-wedding-rose-pastel via-wedding-cream to-wedding-gold-light rounded-xl overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-7xl sm:text-8xl md:text-9xl mb-4">👰</div>
                      <p className="text-wedding-navy/60 text-sm sm:text-base italic">Photo Placeholder</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="prose prose-lg max-w-none space-y-8 sm:space-y-10">
                {/* Personal Information */}
                <motion.section
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="relative"
                >
                  <div className="flex items-center mb-4">
                    <span className="text-2xl mr-3">💐</span>
                    <h2 className="text-2xl sm:text-3xl font-display text-wedding-navy">
                      About Ankita
                    </h2>
                  </div>
                  <div className="wedding-divider mb-6"></div>
                  <p className="text-gray-700 text-base sm:text-lg md:text-xl leading-relaxed">
                    [Placeholder: Personal story, background, interests, achievements, and what makes Ankita special. This section can be customized with her story, hobbies, career, and personality.]
                  </p>
                </motion.section>

                {/* Parents */}
                <motion.section
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="relative bg-wedding-rose-pastel/20 rounded-xl p-6 sm:p-8 border border-wedding-rose/20"
                >
                  <div className="flex items-center mb-4">
                    <span className="text-2xl mr-3">👨‍👩‍👧</span>
                    <h2 className="text-2xl sm:text-3xl font-display text-wedding-navy">
                      Parents
                    </h2>
                  </div>
                  <div className="wedding-divider mb-6"></div>
                  <div className="space-y-3">
                    <p className="text-lg sm:text-xl font-semibold text-wedding-navy">
                      Mr. Brijesh Kumar Sharma
                    </p>
                    <p className="text-lg sm:text-xl font-semibold text-wedding-navy">
                      Mrs. Ruchira Sharma
                    </p>
                  </div>
                </motion.section>

                {/* Grandparents */}
                <motion.section
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="relative bg-wedding-gold-light/20 rounded-xl p-6 sm:p-8 border border-wedding-gold/20"
                >
                  <div className="flex items-center mb-4">
                    <span className="text-2xl mr-3">🌳</span>
                    <h2 className="text-2xl sm:text-3xl font-display text-wedding-navy">
                      Grandparents
                    </h2>
                  </div>
                  <div className="wedding-divider mb-6"></div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-base sm:text-lg font-semibold text-wedding-navy mb-2">Paternal Grandparents:</p>
                      <p className="text-gray-700 text-base sm:text-lg">Mr. Chimman Lal Sharma</p>
                      <p className="text-gray-700 text-base sm:text-lg">Late Mrs. Shanti Devi</p>
                    </div>
                    <div>
                      <p className="text-base sm:text-lg font-semibold text-wedding-navy mb-2">Maternal Grandparents:</p>
                      <p className="text-gray-700 text-base sm:text-lg">Late Mr. Naresh Chand Sharma</p>
                      <p className="text-gray-700 text-base sm:text-lg">Mrs. Nirmala Sharma</p>
                    </div>
                  </div>
                </motion.section>

                {/* Additional Information Placeholder */}
                <motion.section
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="relative"
                >
                  <div className="flex items-center mb-4">
                    <span className="text-2xl mr-3">✨</span>
                    <h2 className="text-2xl sm:text-3xl font-display text-wedding-navy">
                      [Placeholder: Additional Section]
                    </h2>
                  </div>
                  <div className="wedding-divider mb-6"></div>
                  <p className="text-gray-700 text-base sm:text-lg md:text-xl leading-relaxed">
                    [Placeholder: This section can be used for additional information such as education, career, hobbies, interests, or any other details you&apos;d like to share about Ankita.]
                  </p>
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

