'use client'

import { motion, AnimatePresence } from 'framer-motion'

interface AccessRestrictedPopupProps {
  isOpen: boolean
  onClose: () => void
  onTryAgain?: () => void
  contactPhone?: string
}

export default function AccessRestrictedPopup({
  isOpen,
  onClose,
  onTryAgain,
  contactPhone = '---',
}: AccessRestrictedPopupProps) {
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
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-md w-full p-5 sm:p-6 md:p-8 max-h-[90vh] overflow-y-auto mx-4">
              <div className="text-center mb-4">
                <div className="text-4xl sm:text-5xl mb-2 sm:mb-3">🔒</div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-display text-wedding-navy mb-2 sm:mb-3">
                  Access Restricted
                </h2>
                <div className="wedding-divider max-w-32 mx-auto mb-3 sm:mb-4"></div>
              </div>
              <p className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4 md:mb-6 leading-relaxed">
                The phone number you entered does not match the one previously used for this invitation.
              </p>
              <p className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4 md:mb-6 leading-relaxed">
                Please enter the same number you used earlier.
              </p>
              <p className="text-sm sm:text-base text-gray-700 mb-4 sm:mb-6 leading-relaxed">
                If you need assistance or your number has changed, please contact Ankita at{' '}
                <a
                  href={`tel:${contactPhone}`}
                  className="text-wedding-gold hover:underline break-all touch-manipulation"
                >
                  {contactPhone}
                </a>
                .
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                {onTryAgain && (
                  <button
                    onClick={onTryAgain}
                    className="flex-1 bg-wedding-gold text-white py-3 sm:py-2.5 rounded-lg font-semibold hover:bg-opacity-90 active:scale-95 transition-colors text-sm sm:text-base touch-manipulation min-h-[44px]"
                  >
                    Try Again
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 sm:py-2.5 rounded-lg font-semibold hover:bg-gray-300 active:scale-95 transition-colors text-sm sm:text-base touch-manipulation min-h-[44px]"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

