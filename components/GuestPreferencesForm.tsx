'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface GuestPreferencesFormProps {
  token: string
  guestName: string
  onSubmitted: () => void
}

export default function GuestPreferencesForm({
  token,
  guestName,
  onSubmitted,
}: GuestPreferencesFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    menuPreference: '' as 'veg' | 'non-veg' | 'both' | '',
    dietaryRestrictions: '',
    additionalInfo: '',
  })

  useEffect(() => {
    // Check if preferences have already been submitted
    fetch(`/api/guest/preferences?token=${token}`, { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (!data.preferencesSubmitted) {
          setIsOpen(true)
        }
      })
      .catch((err) => {
        console.error('Error checking preferences:', err)
        // Still show form if check fails
        setIsOpen(true)
      })
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.menuPreference) {
      setError('Please select a menu preference')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/guest/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify({
          token,
          menuPreference: formData.menuPreference,
          dietaryRestrictions: formData.dietaryRestrictions.trim() || undefined,
          additionalInfo: formData.additionalInfo.trim() || undefined,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsOpen(false)
        onSubmitted()
      } else {
        setError(data.error || 'Failed to save preferences. Please try again.')
      }
    } catch (err) {
      console.error('Error submitting preferences:', err)
      setError('An error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) {
    return null
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => {}} // Prevent closing on backdrop click
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-5 sm:p-6 md:p-8">
                {/* Header */}
                <div className="text-center mb-5 sm:mb-6">
                  <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">🍽️</div>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-display text-wedding-navy mb-2">
                    Help Us Plan Better
                  </h2>
                  <p className="text-gray-600 text-sm sm:text-base">
                    Hi {guestName}! Please share your preferences so we can make your experience special.
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                  {/* Menu Preference */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Menu Preference <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center p-3 sm:p-3.5 border border-gray-300 rounded-lg cursor-pointer hover:bg-wedding-cream/30 active:bg-wedding-cream/40 transition-colors touch-manipulation min-h-[48px]">
                        <input
                          type="radio"
                          name="menuPreference"
                          value="veg"
                          checked={formData.menuPreference === 'veg'}
                          onChange={(e) =>
                            setFormData({ ...formData, menuPreference: e.target.value as 'veg' })
                          }
                          className="mr-3 w-5 h-5 text-wedding-gold focus:ring-wedding-gold touch-manipulation"
                        />
                        <span className="text-sm sm:text-base text-gray-700">Vegetarian</span>
                      </label>
                      <label className="flex items-center p-3 sm:p-3.5 border border-gray-300 rounded-lg cursor-pointer hover:bg-wedding-cream/30 active:bg-wedding-cream/40 transition-colors touch-manipulation min-h-[48px]">
                        <input
                          type="radio"
                          name="menuPreference"
                          value="non-veg"
                          checked={formData.menuPreference === 'non-veg'}
                          onChange={(e) =>
                            setFormData({ ...formData, menuPreference: e.target.value as 'non-veg' })
                          }
                          className="mr-3 w-5 h-5 text-wedding-gold focus:ring-wedding-gold touch-manipulation"
                        />
                        <span className="text-sm sm:text-base text-gray-700">Non-Vegetarian</span>
                      </label>
                      <label className="flex items-center p-3 sm:p-3.5 border border-gray-300 rounded-lg cursor-pointer hover:bg-wedding-cream/30 active:bg-wedding-cream/40 transition-colors touch-manipulation min-h-[48px]">
                        <input
                          type="radio"
                          name="menuPreference"
                          value="both"
                          checked={formData.menuPreference === 'both'}
                          onChange={(e) =>
                            setFormData({ ...formData, menuPreference: e.target.value as 'both' })
                          }
                          className="mr-3 w-5 h-5 text-wedding-gold focus:ring-wedding-gold touch-manipulation"
                        />
                        <span className="text-sm sm:text-base text-gray-700">Both (No Preference)</span>
                      </label>
                    </div>
                  </div>

                  {/* Dietary Restrictions */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dietary Restrictions or Allergies (Optional)
                    </label>
                    <textarea
                      value={formData.dietaryRestrictions}
                      onChange={(e) =>
                        setFormData({ ...formData, dietaryRestrictions: e.target.value })
                      }
                      rows={3}
                      className="w-full px-4 py-2.5 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-wedding-gold focus:border-wedding-gold touch-manipulation"
                      placeholder="e.g., Nut allergy, Gluten-free, etc."
                    />
                  </div>

                  {/* Additional Info */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Information (Optional)
                    </label>
                    <textarea
                      value={formData.additionalInfo}
                      onChange={(e) =>
                        setFormData({ ...formData, additionalInfo: e.target.value })
                      }
                      rows={3}
                      className="w-full px-4 py-2.5 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-wedding-gold focus:border-wedding-gold touch-manipulation"
                      placeholder="Any other information you'd like to share..."
                    />
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 bg-gradient-gold text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation min-h-[48px]"
                    >
                      {isSubmitting ? 'Saving...' : 'Submit Preferences'}
                    </button>
                  </div>

                  <p className="text-xs text-gray-500 text-center">
                    This form can only be submitted once. Please review your information before submitting.
                  </p>
                </form>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

