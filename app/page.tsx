'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import PageTransition from '@/components/PageTransition'

export default function Home() {
  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center bg-gradient-wedding p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-2xl w-full"
      >
        <div className="mb-4 sm:mb-6">
          <span className="text-5xl sm:text-6xl md:text-7xl mb-3 sm:mb-4 block">💍</span>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-display text-wedding-navy mb-3 sm:mb-4 md:mb-6 font-bold px-2">
          Wedding Invitation Website
        </h1>
        <div className="wedding-divider-thick max-w-md mx-auto mb-4 sm:mb-6"></div>
        <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-700 mb-6 sm:mb-8 md:mb-10 px-2">
          Access your invitation using your unique link
        </p>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-5 sm:p-6 md:p-8 shadow-lg border border-wedding-gold/20">
          <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
            Admin Access
          </p>
          <Link
            href="/admin/login"
            className="inline-flex items-center bg-gradient-gold text-white px-5 sm:px-6 md:px-8 py-3 sm:py-4 rounded-full font-semibold hover:shadow-lg active:scale-95 transition-all duration-300 text-sm sm:text-base md:text-lg touch-manipulation min-h-[48px]"
          >
            <span className="mr-2">👑</span>
            Admin Login
          </Link>
        </div>
      </motion.div>
    </div>
    </PageTransition>
  )
}

