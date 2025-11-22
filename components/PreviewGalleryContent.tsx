'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import PageTransition from './PageTransition'
import PreviewBanner from './PreviewBanner'

const galleryImages = [
  { id: 1, url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80', alt: 'Wedding flowers' },
  { id: 2, url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80', alt: 'Wedding rings' },
  { id: 3, url: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=800&q=80', alt: 'Wedding decoration' },
  { id: 4, url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&q=80', alt: 'Wedding mandap' },
  { id: 5, url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80', alt: 'Floral arrangements' },
  { id: 6, url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80', alt: 'Wedding details' },
  { id: 7, url: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=800&q=80', alt: 'Bridal accessories' },
  { id: 8, url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&q=80', alt: 'Wedding venue' },
  { id: 9, url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80', alt: 'Wedding flowers' },
  { id: 10, url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80', alt: 'Wedding rings' },
  { id: 11, url: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=800&q=80', alt: 'Wedding decoration' },
  { id: 12, url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&q=80', alt: 'Wedding mandap' },
  { id: 13, url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80', alt: 'Floral arrangements' },
  { id: 14, url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80', alt: 'Wedding details' },
  { id: 15, url: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=800&q=80', alt: 'Bridal accessories' },
  { id: 16, url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&q=80', alt: 'Wedding venue' },
  { id: 17, url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80', alt: 'Wedding flowers' },
  { id: 18, url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80', alt: 'Wedding rings' },
]

export default function PreviewGalleryContent({ token }: { token: string }) {
  const [selectedImage, setSelectedImage] = useState<number | null>(null)

  const currentImage = selectedImage ? galleryImages.find((img) => img.id === selectedImage) : null

  return (
    <>
      <PreviewBanner />
      <PageTransition>
        <div className="min-h-screen bg-gradient-wedding">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="wedding-card rounded-2xl p-6 sm:p-8 md:p-12"
            >
              <div className="text-center mb-8 sm:mb-12">
                <div className="flex justify-center mb-4">
                  <span className="text-4xl sm:text-5xl">📸</span>
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-display text-wedding-navy mb-4">
                  Our Gallery
                </h1>
                <div className="wedding-divider-thick max-w-md mx-auto"></div>
                <p className="text-base sm:text-lg text-gray-600 mt-6">
                  Beautiful moments from our celebrations
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {galleryImages.map((image, index) => (
                  <motion.div
                    key={image.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.4 }}
                    whileHover={{ scale: 1.02 }}
                    className="relative aspect-square rounded-xl overflow-hidden cursor-pointer shadow-lg hover:shadow-xl transition-shadow"
                    onClick={() => setSelectedImage(image.id)}
                  >
                    <Image
                      src={image.url}
                      alt={image.alt}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors" />
                  </motion.div>
                ))}
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

          <AnimatePresence>
            {selectedImage !== null && currentImage && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
                onClick={() => setSelectedImage(null)}
              >
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="relative max-w-6xl w-full max-h-[90vh]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => setSelectedImage(null)}
                    className="absolute top-4 right-4 z-10 bg-white/20 hover:bg-white/30 text-white rounded-full p-3 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <div className="relative w-full h-[90vh] rounded-lg overflow-hidden">
                    <Image src={currentImage.url} alt={currentImage.alt} fill className="object-contain" priority />
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </PageTransition>
    </>
  )
}

