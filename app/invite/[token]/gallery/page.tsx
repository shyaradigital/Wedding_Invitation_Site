'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import PageTransition from '@/components/PageTransition'
import InvitationPageLayout from '@/components/InvitationPageLayout'
import PhoneVerificationForm from '@/components/PhoneVerificationForm'
import AccessRestrictedPopup from '@/components/AccessRestrictedPopup'
import { useGuestAccess } from '@/lib/use-guest-access'

// High-quality wedding-themed images from Unsplash
const galleryImages = [
  {
    id: 1,
    url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80',
    alt: 'Wedding flowers',
  },
  {
    id: 2,
    url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80',
    alt: 'Wedding rings',
  },
  {
    id: 3,
    url: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=800&q=80',
    alt: 'Wedding decoration',
  },
  {
    id: 4,
    url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&q=80',
    alt: 'Wedding mandap',
  },
  {
    id: 5,
    url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80',
    alt: 'Floral arrangements',
  },
  {
    id: 6,
    url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80',
    alt: 'Wedding details',
  },
  {
    id: 7,
    url: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=800&q=80',
    alt: 'Bridal accessories',
  },
  {
    id: 8,
    url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&q=80',
    alt: 'Wedding venue',
  },
  {
    id: 9,
    url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80',
    alt: 'Wedding flowers',
  },
  {
    id: 10,
    url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80',
    alt: 'Wedding rings',
  },
  {
    id: 11,
    url: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=800&q=80',
    alt: 'Wedding decoration',
  },
  {
    id: 12,
    url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&q=80',
    alt: 'Wedding mandap',
  },
  {
    id: 13,
    url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80',
    alt: 'Floral arrangements',
  },
  {
    id: 14,
    url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80',
    alt: 'Wedding details',
  },
  {
    id: 15,
    url: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=800&q=80',
    alt: 'Bridal accessories',
  },
  {
    id: 16,
    url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&q=80',
    alt: 'Wedding venue',
  },
  {
    id: 17,
    url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80',
    alt: 'Wedding flowers',
  },
  {
    id: 18,
    url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80',
    alt: 'Wedding rings',
  },
]

export default function GalleryPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string
  const [selectedImage, setSelectedImage] = useState<number | null>(null)
  const [isVerifyingPhone, setIsVerifyingPhone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Use the shared access check hook
  const {
    accessState,
    guest,
    error: accessError,
    handlePhoneSubmit,
    showRestrictedPopup,
    setShowRestrictedPopup,
  } = useGuestAccess(token)

  const handlePhoneVerification = async (phone: string) => {
    setIsVerifyingPhone(true)
    setError(null)
    const success = await handlePhoneSubmit(phone)
    setIsVerifyingPhone(false)
    if (!success) {
      setError(accessError || 'Phone verification failed')
    }
  }

  const openLightbox = (id: number) => {
    setSelectedImage(id)
  }

  const closeLightbox = () => {
    setSelectedImage(null)
  }

  const goToNext = () => {
    if (selectedImage !== null) {
      const currentIndex = galleryImages.findIndex((img) => img.id === selectedImage)
      const nextIndex = (currentIndex + 1) % galleryImages.length
      setSelectedImage(galleryImages[nextIndex].id)
    }
  }

  const goToPrev = () => {
    if (selectedImage !== null) {
      const currentIndex = galleryImages.findIndex((img) => img.id === selectedImage)
      const prevIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length
      setSelectedImage(galleryImages[prevIndex].id)
    }
  }

  const currentImage = selectedImage
    ? galleryImages.find((img) => img.id === selectedImage)
    : null

  // Show loading state
  if (accessState === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-wedding-cream">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wedding-gold mx-auto mb-4"></div>
          <p className="text-wedding-navy">Loading...</p>
        </div>
      </div>
    )
  }

  // Show phone verification form
  if (accessState === 'phone-required' || accessState === 'phone-verification') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-wedding p-4">
        <PhoneVerificationForm
          onSubmit={handlePhoneVerification}
          isLoading={isVerifyingPhone}
        />
        {error && (
          <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}
        <AccessRestrictedPopup
          isOpen={showRestrictedPopup}
          onClose={() => setShowRestrictedPopup(false)}
          onTryAgain={() => setShowRestrictedPopup(false)}
        />
      </div>
    )
  }

  // Show access denied or wait for guest
  if (accessState === 'access-denied' || accessState !== 'granted' || !guest) {
    if (accessState === 'access-denied') {
      router.push(`/invite/${token}`)
      return null
    }
    return (
      <div className="min-h-screen flex items-center justify-center bg-wedding-cream">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wedding-gold mx-auto mb-4"></div>
          <p className="text-wedding-navy">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <InvitationPageLayout
      token={token}
      eventAccess={guest.eventAccess}
      guestName={guest.name}
    >
      <PageTransition>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 md:py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="wedding-card rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 lg:p-12"
          >
            <div className="text-center mb-6 sm:mb-8 md:mb-12">
              <div className="flex justify-center mb-3 sm:mb-4">
                <span className="text-3xl sm:text-4xl md:text-5xl">📸</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display text-wedding-navy mb-3 sm:mb-4">
                Our Gallery
              </h1>
              <div className="wedding-divider-thick max-w-md mx-auto"></div>
              <p className="text-sm sm:text-base md:text-lg text-gray-600 mt-4 sm:mt-6">
                Beautiful moments from our celebrations
              </p>
            </div>

            {/* Gallery Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 md:gap-6">
              {galleryImages.map((image, index) => (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.4 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative aspect-square rounded-lg sm:rounded-xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-shadow touch-manipulation"
                  onClick={() => openLightbox(image.id)}
                >
                  <Image
                    src={image.url}
                    alt={image.alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/10 active:bg-black/20 transition-colors" />
                </motion.div>
              ))}
            </div>

        </motion.div>
        </div>

        {/* Lightbox Modal */}
        <AnimatePresence>
          {selectedImage !== null && currentImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
              onClick={closeLightbox}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="relative max-w-6xl w-full max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <button
                  onClick={closeLightbox}
                  className="absolute top-4 right-4 z-10 bg-white/20 hover:bg-white/30 active:bg-white/40 text-white rounded-full p-3 transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
                  aria-label="Close"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>

                {/* Previous Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    goToPrev()
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 active:bg-white/40 text-white rounded-full p-3 transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
                  aria-label="Previous"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>

                {/* Next Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    goToNext()
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 active:bg-white/40 text-white rounded-full p-3 transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
                  aria-label="Next"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>

                {/* Image */}
                <div className="relative w-full h-[90vh] rounded-lg overflow-hidden">
                  <Image
                    src={currentImage.url}
                    alt={currentImage.alt}
                    fill
                    className="object-contain"
                    priority
                  />
                </div>

                {/* Image Counter */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/20 text-white px-4 py-2 rounded-full text-sm">
                  {galleryImages.findIndex((img) => img.id === selectedImage) + 1} /{' '}
                  {galleryImages.length}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </PageTransition>
    </InvitationPageLayout>
  )
}

