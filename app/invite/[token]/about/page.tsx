'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import PageTransition from '@/components/PageTransition'

export default function AboutPage() {
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
              <span className="text-4xl sm:text-5xl">💑</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-display text-wedding-navy mb-4">
              Our Story
            </h1>
            <div className="wedding-divider-thick max-w-md mx-auto"></div>
          </div>

          {/* Couple Photo Placeholder */}
          <div className="mb-10 sm:mb-12">
            <div className="relative w-full h-64 sm:h-80 md:h-96 bg-gradient-to-br from-wedding-rose-pastel via-wedding-cream to-wedding-gold-light rounded-xl overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-7xl sm:text-8xl md:text-9xl mb-4">👰🤵</div>
                  <p className="text-wedding-navy/60 text-sm sm:text-base italic">Couple Photo Placeholder</p>
                </div>
              </div>
            </div>
          </div>

          <div className="prose prose-lg max-w-none space-y-8 sm:space-y-10">
            <motion.section
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="relative"
            >
              <div className="flex items-center mb-4">
                <span className="text-2xl mr-3">🌱</span>
                <h2 className="text-2xl sm:text-3xl font-display text-wedding-navy">
                  How It All Began
                </h2>
              </div>
              <div className="wedding-divider mb-6"></div>
              <p className="text-gray-700 text-base sm:text-lg md:text-xl leading-relaxed">
                Ankita and Jay met through a common circle of friends, and what started as a casual conversation quietly turned into something much deeper. Their connection grew naturally—through laughter, shared values, long conversations, and a genuine sense of comfort around each other.
              </p>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="relative"
            >
              <div className="flex items-center mb-4">
                <span className="text-2xl mr-3">🌺</span>
                <h2 className="text-2xl sm:text-3xl font-display text-wedding-navy">
                  The Journey
                </h2>
              </div>
              <div className="wedding-divider mb-6"></div>
              <p className="text-gray-700 text-base sm:text-lg md:text-xl leading-relaxed">
                Over the years, they discovered not just compatibility but a partnership built on trust, respect, and endless encouragement. Through good days and difficult ones, they supported each other wholeheartedly, strengthening their bond along the way.
              </p>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="relative"
            >
              <div className="flex items-center mb-4">
                <span className="text-2xl mr-3">💍</span>
                <h2 className="text-2xl sm:text-3xl font-display text-wedding-navy">
                  The Proposal
                </h2>
              </div>
              <div className="wedding-divider mb-6"></div>
              <p className="text-gray-700 text-base sm:text-lg md:text-xl leading-relaxed">
                In a moment filled with emotion and simplicity—just the two of them—Jay asked Ankita the most important question of his life. She said yes with teary eyes and the warmest smile. It was a quiet, intimate moment that perfectly described their love: pure, honest, and deeply meaningful.
              </p>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="relative"
            >
              <div className="flex items-center mb-4">
                <span className="text-2xl mr-3">✨</span>
                <h2 className="text-2xl sm:text-3xl font-display text-wedding-navy">
                  Looking Ahead
                </h2>
              </div>
              <div className="wedding-divider mb-6"></div>
              <p className="text-gray-700 text-base sm:text-lg md:text-xl leading-relaxed">
                Today, they stand at the beginning of a beautiful new chapter. They cannot wait to celebrate this joyous occasion with the people who matter most.
              </p>
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

