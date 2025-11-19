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
        className="text-center max-w-2xl"
      >
        <div className="mb-6">
          <span className="text-6xl sm:text-7xl mb-4 block">💍</span>
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-display text-wedding-navy mb-4 sm:mb-6 font-bold">
          Wedding Invitation Website
        </h1>
        <div className="wedding-divider-thick max-w-md mx-auto mb-6"></div>
        <p className="text-lg sm:text-xl md:text-2xl text-gray-700 mb-8 sm:mb-10">
          Access your invitation using your unique link
        </p>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 sm:p-8 shadow-lg border border-wedding-gold/20">
          <p className="text-sm sm:text-base text-gray-600 mb-4">
            Admin Access
          </p>
          <Link
            href="/admin/login"
            className="inline-flex items-center bg-gradient-gold text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold hover:shadow-lg transition-all duration-300 text-base sm:text-lg"
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

