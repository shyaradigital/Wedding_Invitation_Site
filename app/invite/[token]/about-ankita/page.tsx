'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import PageTransition from '@/components/PageTransition'
import InvitationPageLayout from '@/components/InvitationPageLayout'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AboutAnkitaPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)
  const [guest, setGuest] = useState<any>(null)

  useEffect(() => {
    // Verify access
    fetch('/api/verify-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.guest) {
          setHasAccess(true)
          setGuest(data.guest)
        } else {
          setHasAccess(false)
        }
      })
      .catch(() => {
        setHasAccess(false)
      })
  }, [token])

  if (hasAccess === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-wedding-cream">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wedding-gold mx-auto mb-4"></div>
          <p className="text-wedding-navy">Loading...</p>
        </div>
      </div>
    )
  }

  if (hasAccess === false) {
    router.push(`/invite/${token}`)
    return null
  }

  if (!guest) return null

  return (
    <InvitationPageLayout
      token={token}
      eventAccess={guest.eventAccess}
      guestName={guest.name}
    >
      <PageTransition>
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

          </motion.div>
        </div>
      </PageTransition>
    </InvitationPageLayout>
  )
}

