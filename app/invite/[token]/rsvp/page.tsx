'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import PageTransition from '@/components/PageTransition'
import InvitationPageLayout from '@/components/InvitationPageLayout'
import OrnamentalDivider from '@/components/OrnamentalDivider'
import FloatingPetals from '@/components/FloatingPetals'

export default function RSVPPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)
  const [guest, setGuest] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [existingRsvp, setExistingRsvp] = useState<any>(null)
  const [formData, setFormData] = useState({
    rsvpStatus: {} as Record<string, 'yes' | 'no' | 'pending'>,
    menuPreference: '' as 'veg' | 'non-veg' | 'both' | '',
    dietaryRestrictions: '',
    additionalInfo: '',
  })

  // Event name mapping
  const eventNames: Record<string, string> = {
    mehndi: 'Mehndi & Pithi',
    wedding: 'Hindu Wedding',
    reception: 'Reception',
  }

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
          // Check if preferences have already been submitted
          return fetch(`/api/guest/preferences?token=${token}`)
        } else {
          setHasAccess(false)
          return null
        }
      })
      .then((res) => {
        if (res) {
          return res.json()
        }
        return null
      })
      .then((data) => {
        if (data && data.preferencesSubmitted) {
          setSubmitted(true)
          if (data.rsvpStatus) {
            setExistingRsvp(data.rsvpStatus)
          }
          // Pre-populate form with existing data
          if (data.preferences) {
            setFormData(prev => ({
              ...prev,
              menuPreference: data.preferences.menuPreference || '',
              dietaryRestrictions: data.preferences.dietaryRestrictions || '',
              additionalInfo: data.preferences.additionalInfo || '',
              rsvpStatus: data.rsvpStatus || {},
            }))
          }
        } else if (data && data.rsvpStatus) {
          // RSVP already submitted but show existing status
          setExistingRsvp(data.rsvpStatus)
          setFormData(prev => ({
            ...prev,
            rsvpStatus: data.rsvpStatus || {},
          }))
        }
      })
      .catch((err) => {
        console.error('Error checking preferences:', err)
        setHasAccess(false)
      })
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate RSVP status for all accessible events
    const eventAccess = guest?.eventAccess || []
    const missingRsvp = eventAccess.filter((event: string) => !formData.rsvpStatus[event])
    
    if (missingRsvp.length > 0) {
      setError(`Please provide RSVP status for all events: ${missingRsvp.map((e: string) => eventNames[e] || e).join(', ')}`)
      return
    }

    if (!formData.menuPreference) {
      setError('Please select a menu preference')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/guest/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          rsvpStatus: formData.rsvpStatus,
          menuPreference: formData.menuPreference,
          dietaryRestrictions: formData.dietaryRestrictions.trim() || undefined,
          additionalInfo: formData.additionalInfo.trim() || undefined,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSubmitted(true)
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

  if (!guest) {
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
      <FloatingPetals />
      <PageTransition>
        <div className="min-h-screen bg-gradient-wedding relative">
          <div className="max-w-[640px] mx-auto px-4 sm:px-6 md:px-12 py-8 sm:py-12 md:py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {submitted ? (
                <div className="wedding-card rounded-3xl p-8 sm:p-12 text-center">
                  <div className="text-5xl sm:text-6xl mb-4 sm:mb-6">✅</div>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-script text-wedding-navy mb-4 sm:mb-6">
                    Thank You!
                  </h1>
                  <OrnamentalDivider variant="ornate" className="mb-6 sm:mb-8" />
                  <p className="text-base sm:text-lg md:text-xl text-gray-700 font-serif mb-4">
                    Your preferences have been saved successfully.
                  </p>
                  <p className="text-sm sm:text-base text-gray-600 font-serif">
                    We look forward to celebrating with you!
                  </p>
                </div>
              ) : (
                <div className="wedding-card rounded-3xl p-6 sm:p-8 md:p-12">
                  {/* Header */}
                  <div className="text-center mb-6 sm:mb-8">
                    <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">💌</div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-script text-wedding-navy mb-3 sm:mb-4">
                      RSVP
                    </h1>
                    <OrnamentalDivider variant="ornate" className="mb-4 sm:mb-6" />
                    <p className="text-base sm:text-lg md:text-xl text-gray-700 font-serif">
                      Hi {guest.name}! Please share your preferences so we can make your experience special.
                    </p>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
                    {/* RSVP Section - Dynamic based on eventAccess */}
                    {guest.eventAccess && guest.eventAccess.length > 0 && (
                      <div>
                        <label className="block text-lg sm:text-xl font-display text-wedding-navy mb-4">
                          Will you be attending? <span className="text-red-500">*</span>
                        </label>
                        <OrnamentalDivider variant="simple" className="mb-4" />
                        <div className="space-y-6">
                          {guest.eventAccess.map((eventSlug: string) => {
                            const eventName = eventNames[eventSlug] || eventSlug
                            const currentStatus = formData.rsvpStatus[eventSlug] || (existingRsvp?.[eventSlug] || '')
                            
                            return (
                              <div key={eventSlug} className="border-2 border-wedding-gold/30 rounded-xl p-4 sm:p-5 bg-white/50">
                                <h3 className="text-base sm:text-lg font-display text-wedding-navy mb-3 sm:mb-4">
                                  {eventName}
                                </h3>
                                <div className="space-y-2">
                                  <label className="flex items-center p-3 sm:p-4 border-2 border-wedding-gold/30 rounded-lg cursor-pointer hover:bg-wedding-cream/30 active:bg-wedding-cream/40 transition-colors touch-manipulation bg-white/70">
                                    <input
                                      type="radio"
                                      name={`rsvp-${eventSlug}`}
                                      value="yes"
                                      checked={currentStatus === 'yes'}
                                      onChange={() =>
                                        setFormData({
                                          ...formData,
                                          rsvpStatus: { ...formData.rsvpStatus, [eventSlug]: 'yes' },
                                        })
                                      }
                                      className="mr-3 sm:mr-4 w-5 h-5 sm:w-6 sm:h-6 text-wedding-gold focus:ring-wedding-gold touch-manipulation"
                                    />
                                    <span className="text-base sm:text-lg font-serif text-gray-700">✓ Attending</span>
                                  </label>
                                  <label className="flex items-center p-3 sm:p-4 border-2 border-wedding-gold/30 rounded-lg cursor-pointer hover:bg-wedding-cream/30 active:bg-wedding-cream/40 transition-colors touch-manipulation bg-white/70">
                                    <input
                                      type="radio"
                                      name={`rsvp-${eventSlug}`}
                                      value="no"
                                      checked={currentStatus === 'no'}
                                      onChange={() =>
                                        setFormData({
                                          ...formData,
                                          rsvpStatus: { ...formData.rsvpStatus, [eventSlug]: 'no' },
                                        })
                                      }
                                      className="mr-3 sm:mr-4 w-5 h-5 sm:w-6 sm:h-6 text-wedding-gold focus:ring-wedding-gold touch-manipulation"
                                    />
                                    <span className="text-base sm:text-lg font-serif text-gray-700">✗ Not Attending</span>
                                  </label>
                                  <label className="flex items-center p-3 sm:p-4 border-2 border-wedding-gold/30 rounded-lg cursor-pointer hover:bg-wedding-cream/30 active:bg-wedding-cream/40 transition-colors touch-manipulation bg-white/70">
                                    <input
                                      type="radio"
                                      name={`rsvp-${eventSlug}`}
                                      value="pending"
                                      checked={currentStatus === 'pending'}
                                      onChange={() =>
                                        setFormData({
                                          ...formData,
                                          rsvpStatus: { ...formData.rsvpStatus, [eventSlug]: 'pending' },
                                        })
                                      }
                                      className="mr-3 sm:mr-4 w-5 h-5 sm:w-6 sm:h-6 text-wedding-gold focus:ring-wedding-gold touch-manipulation"
                                    />
                                    <span className="text-base sm:text-lg font-serif text-gray-700">⏳ Pending</span>
                                  </label>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Menu Preference */}
                    <div>
                      <label className="block text-lg sm:text-xl font-display text-wedding-navy mb-4">
                        Menu Preference <span className="text-red-500">*</span>
                      </label>
                      <OrnamentalDivider variant="simple" className="mb-4" />
                      <div className="space-y-3">
                        <label className="flex items-center p-4 sm:p-5 border-2 border-wedding-gold/30 rounded-xl cursor-pointer hover:bg-wedding-cream/30 active:bg-wedding-cream/40 transition-colors touch-manipulation min-h-[56px] bg-white/50">
                          <input
                            type="radio"
                            name="menuPreference"
                            value="veg"
                            checked={formData.menuPreference === 'veg'}
                            onChange={(e) =>
                              setFormData({ ...formData, menuPreference: e.target.value as 'veg' })
                            }
                            className="mr-4 w-5 h-5 sm:w-6 sm:h-6 text-wedding-gold focus:ring-wedding-gold touch-manipulation"
                          />
                          <span className="text-base sm:text-lg font-serif text-gray-700">Vegetarian</span>
                        </label>
                        <label className="flex items-center p-4 sm:p-5 border-2 border-wedding-gold/30 rounded-xl cursor-pointer hover:bg-wedding-cream/30 active:bg-wedding-cream/40 transition-colors touch-manipulation min-h-[56px] bg-white/50">
                          <input
                            type="radio"
                            name="menuPreference"
                            value="non-veg"
                            checked={formData.menuPreference === 'non-veg'}
                            onChange={(e) =>
                              setFormData({ ...formData, menuPreference: e.target.value as 'non-veg' })
                            }
                            className="mr-4 w-5 h-5 sm:w-6 sm:h-6 text-wedding-gold focus:ring-wedding-gold touch-manipulation"
                          />
                          <span className="text-base sm:text-lg font-serif text-gray-700">Non-Vegetarian</span>
                        </label>
                        <label className="flex items-center p-4 sm:p-5 border-2 border-wedding-gold/30 rounded-xl cursor-pointer hover:bg-wedding-cream/30 active:bg-wedding-cream/40 transition-colors touch-manipulation min-h-[56px] bg-white/50">
                          <input
                            type="radio"
                            name="menuPreference"
                            value="both"
                            checked={formData.menuPreference === 'both'}
                            onChange={(e) =>
                              setFormData({ ...formData, menuPreference: e.target.value as 'both' })
                            }
                            className="mr-4 w-5 h-5 sm:w-6 sm:h-6 text-wedding-gold focus:ring-wedding-gold touch-manipulation"
                          />
                          <span className="text-base sm:text-lg font-serif text-gray-700">Both (No Preference)</span>
                        </label>
                      </div>
                    </div>

                    {/* Dietary Restrictions */}
                    <div>
                      <label className="block text-lg sm:text-xl font-display text-wedding-navy mb-4">
                        Dietary Restrictions or Allergies (Optional)
                      </label>
                      <OrnamentalDivider variant="simple" className="mb-4" />
                      <textarea
                        value={formData.dietaryRestrictions}
                        onChange={(e) =>
                          setFormData({ ...formData, dietaryRestrictions: e.target.value })
                        }
                        rows={4}
                        className="w-full px-4 sm:px-6 py-3 sm:py-4 text-base sm:text-lg border-2 border-wedding-gold/30 rounded-xl focus:ring-2 focus:ring-wedding-gold focus:border-wedding-gold touch-manipulation bg-white/70 font-serif"
                        placeholder="e.g., Nut allergy, Gluten-free, etc."
                      />
                    </div>

                    {/* Additional Info */}
                    <div>
                      <label className="block text-lg sm:text-xl font-display text-wedding-navy mb-4">
                        Additional Information (Optional)
                      </label>
                      <OrnamentalDivider variant="simple" className="mb-4" />
                      <textarea
                        value={formData.additionalInfo}
                        onChange={(e) =>
                          setFormData({ ...formData, additionalInfo: e.target.value })
                        }
                        rows={4}
                        className="w-full px-4 sm:px-6 py-3 sm:py-4 text-base sm:text-lg border-2 border-wedding-gold/30 rounded-xl focus:ring-2 focus:ring-wedding-gold focus:border-wedding-gold touch-manipulation bg-white/70 font-serif"
                        placeholder="Any other information you'd like to share..."
                      />
                    </div>

                    {/* Error Message */}
                    {error && (
                      <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 sm:px-6 py-3 sm:py-4 rounded-xl text-sm sm:text-base">
                        {error}
                      </div>
                    )}

                    {/* Submit Button */}
                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-wedding-gold to-wedding-gold-light text-white px-8 py-4 rounded-xl font-semibold text-lg sm:text-xl hover:shadow-xl active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation min-h-[56px]"
                      >
                        {isSubmitting ? 'Saving...' : 'Submit RSVP'}
                      </button>
                    </div>

                    <p className="text-xs sm:text-sm text-gray-500 text-center font-serif">
                      This form can only be submitted once. Please review your information before submitting.
                    </p>
                  </form>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </PageTransition>
    </InvitationPageLayout>
  )
}

