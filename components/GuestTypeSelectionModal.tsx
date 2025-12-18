'use client'

import { motion, AnimatePresence } from 'framer-motion'

interface GuestTypeSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (type: 'all-events' | 'reception-only') => void
}

export default function GuestTypeSelectionModal({
  isOpen,
  onClose,
  onSelect,
}: GuestTypeSelectionModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-md w-full p-5 sm:p-6 md:p-8 mx-4">
              <div className="text-center mb-4">
                <div className="text-4xl sm:text-5xl mb-2 sm:mb-3">👁️</div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-display text-wedding-navy mb-2 sm:mb-3">
                  Select Guest Type
                </h2>
                <div className="wedding-divider max-w-32 mx-auto mb-3 sm:mb-4"></div>
              </div>
              <p className="text-sm sm:text-base text-gray-700 mb-6 leading-relaxed text-center">
                Choose how you want to preview the website:
              </p>
              
              <div className="space-y-3 mb-6">
                <button
                  onClick={() => {
                    onSelect('all-events')
                    onClose()
                  }}
                  className="w-full bg-gradient-to-br from-wedding-gold to-wedding-gold/90 text-white py-4 px-6 rounded-xl font-semibold hover:shadow-lg active:scale-95 transition-all text-base sm:text-lg flex items-center justify-center gap-3"
                >
                  <span className="text-2xl">🎉</span>
                  <span>All Events</span>
                </button>
                
                <button
                  onClick={() => {
                    onSelect('reception-only')
                    onClose()
                  }}
                  className="w-full bg-gradient-to-br from-wedding-rose to-wedding-rose/90 text-white py-4 px-6 rounded-xl font-semibold hover:shadow-lg active:scale-95 transition-all text-base sm:text-lg flex items-center justify-center gap-3"
                >
                  <span className="text-2xl">🍽️</span>
                  <span>Reception Only</span>
                </button>
              </div>

              <button
                onClick={onClose}
                className="w-full bg-gray-200 text-gray-800 py-3 sm:py-2.5 rounded-lg font-semibold hover:bg-gray-300 active:scale-95 transition-colors text-sm sm:text-base touch-manipulation min-h-[44px]"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
