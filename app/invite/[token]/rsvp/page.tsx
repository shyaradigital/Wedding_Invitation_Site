'use client'

export const dynamic = 'force-dynamic'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import PageTransition from '@/components/PageTransition'
import InvitationPageLayout from '@/components/InvitationPageLayout'
import OrnamentalDivider from '@/components/OrnamentalDivider'
import FloatingPetals from '@/components/FloatingPetals'
import PhoneVerificationForm from '@/components/PhoneVerificationForm'
import AccessRestrictedPopup from '@/components/AccessRestrictedPopup'
import { useGuestAccess } from '@/lib/use-guest-access'

export default function RSVPPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [existingRsvp, setExistingRsvp] = useState<any>(null)
  const [formData, setFormData] = useState({
    rsvpStatus: {} as Record<string, 'yes' | 'no'>,
    menuPreference: '' as 'veg' | 'non-veg' | 'both' | '',
    numberOfAttendeesPerEvent: {} as Record<string, number>,
  })

  // Use the shared access check hook
  const {
    accessState,
    guest,
    error: accessError,
    handlePhoneSubmit,
    showRestrictedPopup,
    setShowRestrictedPopup,
  } = useGuestAccess(token)

  const [isVerifyingPhone, setIsVerifyingPhone] = useState(false)

  // Event name mapping
  const eventNames: Record<string, string> = {
    mehndi: 'Mehndi',
    wedding: 'Hindu Wedding',
    reception: 'Reception',
  }

  // Load preferences when access is granted
  useEffect(() => {
    if (accessState === 'granted' && guest) {
      fetch(`/api/guest/preferences?token=${token}`, { cache: 'no-store' })
        .then((res) => res.json())
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
                rsvpStatus: data.rsvpStatus || {},
                numberOfAttendeesPerEvent: data.numberOfAttendeesPerEvent || {},
              }))
            }
          } else if (data && data.rsvpStatus) {
            // RSVP already submitted but show existing status
            setExistingRsvp(data.rsvpStatus)
            setFormData(prev => ({
              ...prev,
              rsvpStatus: data.rsvpStatus || {},
              numberOfAttendeesPerEvent: data.numberOfAttendeesPerEvent || {},
            }))
          }
        })
        .catch((err) => {
          console.error('Error checking preferences:', err)
        })
    }
  }, [accessState, guest, token])

  const handlePhoneVerification = async (phone: string) => {
    setIsVerifyingPhone(true)
    setError(null)
    const success = await handlePhoneSubmit(phone)
    setIsVerifyingPhone(false)
    if (!success) {
      setError(accessError || 'Phone verification failed')
    }
  }

  // Redirect to home if access denied
  useEffect(() => {
    if (accessState === 'access-denied') {
      router.push(`/invite/${token}`)
    }
  }, [accessState, router, token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate RSVP status for all accessible events - MANDATORY
    const eventAccess = guest?.eventAccess || []
    const missingRsvp = eventAccess.filter((event: string) => {
      const status = formData.rsvpStatus[event]
      return !status
    })
    
    if (missingRsvp.length > 0) {
      const missingEventNames = missingRsvp.map((e: string) => eventNames[e] || e).join(', ')
      setError(`Please provide RSVP status for all events. Missing: ${missingEventNames}`)
      // Scroll to first missing field
      const firstMissing = missingRsvp[0]
      const element = document.querySelector(`[name="rsvp-${firstMissing}"]`)
      if (element) {
        element.closest('.border-2')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      return
    }

    // Validate attendee counts for events where guest is attending
    const missingAttendeeCounts: string[] = []
    for (const eventSlug of eventAccess) {
      if (formData.rsvpStatus[eventSlug] === 'yes') {
        const attendeeCount = formData.numberOfAttendeesPerEvent[eventSlug]
        if (!attendeeCount || attendeeCount < 1) {
          missingAttendeeCounts.push(eventSlug)
        }
      }
    }
    
    if (missingAttendeeCounts.length > 0) {
      const missingEventNames = missingAttendeeCounts.map((e: string) => eventNames[e] || e).join(', ')
      setError(`Please enter the number of guests attending for: ${missingEventNames}`)
      // Scroll to first missing field
      const firstMissing = missingAttendeeCounts[0]
      const element = document.querySelector(`[name="attendees-${firstMissing}"]`)
      if (element) {
        element.closest('.border-2')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      return
    }

    // Validate menu preference - MANDATORY
    if (!formData.menuPreference) {
      setError('Please select a menu preference')
      const element = document.querySelector('[name="menuPreference"]')
      if (element) {
        element.closest('div')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
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
          rsvpStatus: formData.rsvpStatus,
          menuPreference: formData.menuPreference,
          numberOfAttendeesPerEvent: formData.numberOfAttendeesPerEvent,
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

  // Show access denied
  if (accessState === 'access-denied') {
    return null // Will redirect
  }

  // Wait for guest data
  if (accessState !== 'granted' || !guest) {
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
                    <p className="text-base sm:text-lg md:text-xl font-bold text-wedding-burgundy mb-3 sm:mb-4">
                      Please RSVP by January 10, 2026
                    </p>
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
                            const isRequired = !currentStatus
                            
                            return (
                              <div key={eventSlug} className={`border-2 rounded-xl p-4 sm:p-5 bg-white/50 transition-colors ${isRequired ? 'border-red-300 bg-red-50/30' : 'border-wedding-gold/30'}`}>
                                <h3 className="text-base sm:text-lg font-display text-wedding-navy mb-3 sm:mb-4">
                                  {eventName} {isRequired && <span className="text-red-500 text-sm">(Required)</span>}
                                </h3>
                                <div className="space-y-2">
                                  <label 
                                    onClick={() => {
                                      setFormData({
                                        ...formData,
                                        rsvpStatus: { ...formData.rsvpStatus, [eventSlug]: 'yes' },
                                        // Set default attendee count to 1 if not already set
                                        numberOfAttendeesPerEvent: {
                                          ...formData.numberOfAttendeesPerEvent,
                                          [eventSlug]: formData.numberOfAttendeesPerEvent[eventSlug] || 1,
                                        },
                                      })
                                    }}
                                    className={`flex items-center p-4 sm:p-5 border-2 rounded-lg cursor-pointer transition-all touch-manipulation min-h-[56px] select-none ${
                                      currentStatus === 'yes' 
                                        ? 'bg-green-50 border-green-400 shadow-md scale-[1.02]' 
                                        : 'bg-white/70 border-wedding-gold/30 hover:bg-wedding-cream/30 active:bg-wedding-cream/40'
                                    }`}
                                    style={{ WebkitTapHighlightColor: 'transparent' }}
                                  >
                                    <input
                                      type="radio"
                                      name={`rsvp-${eventSlug}`}
                                      value="yes"
                                      checked={currentStatus === 'yes'}
                                      onChange={() =>
                                        setFormData({
                                          ...formData,
                                          rsvpStatus: { ...formData.rsvpStatus, [eventSlug]: 'yes' },
                                          // Set default attendee count to 1 if not already set
                                          numberOfAttendeesPerEvent: {
                                            ...formData.numberOfAttendeesPerEvent,
                                            [eventSlug]: formData.numberOfAttendeesPerEvent[eventSlug] || 1,
                                          },
                                        })
                                      }
                                      onClick={(e) => e.stopPropagation()}
                                      className="mr-3 sm:mr-4 w-5 h-5 sm:w-6 sm:h-6 text-wedding-gold focus:ring-wedding-gold touch-manipulation pointer-events-none"
                                    />
                                    <span className={`text-base sm:text-lg font-serif flex-1 ${
                                      currentStatus === 'yes' 
                                        ? 'text-green-800 font-semibold' 
                                        : 'text-gray-700'
                                    }`}>✓ Attending</span>
                                    {currentStatus === 'yes' && (
                                      <span className="text-green-600 text-xl ml-2">✓</span>
                                    )}
                                  </label>
                                  <label 
                                    onClick={() => {
                                      const newNumberOfAttendees = { ...formData.numberOfAttendeesPerEvent }
                                      delete newNumberOfAttendees[eventSlug]
                                      setFormData({
                                        ...formData,
                                        rsvpStatus: { ...formData.rsvpStatus, [eventSlug]: 'no' },
                                        numberOfAttendeesPerEvent: newNumberOfAttendees,
                                      })
                                    }}
                                    className={`flex items-center p-4 sm:p-5 border-2 rounded-lg cursor-pointer transition-all touch-manipulation min-h-[56px] select-none ${
                                      currentStatus === 'no' 
                                        ? 'bg-red-50 border-red-400 shadow-md scale-[1.02]' 
                                        : 'bg-white/70 border-wedding-gold/30 hover:bg-wedding-cream/30 active:bg-wedding-cream/40'
                                    }`}
                                    style={{ WebkitTapHighlightColor: 'transparent' }}
                                  >
                                    <input
                                      type="radio"
                                      name={`rsvp-${eventSlug}`}
                                      value="no"
                                      checked={currentStatus === 'no'}
                                      onChange={() => {
                                        const newNumberOfAttendees = { ...formData.numberOfAttendeesPerEvent }
                                        delete newNumberOfAttendees[eventSlug]
                                        setFormData({
                                          ...formData,
                                          rsvpStatus: { ...formData.rsvpStatus, [eventSlug]: 'no' },
                                          numberOfAttendeesPerEvent: newNumberOfAttendees,
                                        })
                                      }}
                                      onClick={(e) => e.stopPropagation()}
                                      className="mr-3 sm:mr-4 w-5 h-5 sm:w-6 sm:h-6 text-wedding-gold focus:ring-wedding-gold touch-manipulation pointer-events-none"
                                    />
                                    <span className={`text-base sm:text-lg font-serif flex-1 ${
                                      currentStatus === 'no' 
                                        ? 'text-red-800 font-semibold' 
                                        : 'text-gray-700'
                                    }`}>✗ Not Attending</span>
                                    {currentStatus === 'no' && (
                                      <span className="text-red-600 text-xl ml-2">✗</span>
                                    )}
                                  </label>
                                  
                                  {/* Number of Guests Attending - Only show when "Yes" is selected */}
                                  {currentStatus === 'yes' && (
                                    <div className="mt-4 pt-4 border-t border-wedding-gold/20">
                                      <label className="block text-sm sm:text-base font-display text-wedding-navy mb-2">
                                        Number of Guests Attending <span className="text-red-500">*</span>
                                      </label>
                                      <input
                                        type="number"
                                        name={`attendees-${eventSlug}`}
                                        min="1"
                                        value={formData.numberOfAttendeesPerEvent[eventSlug] || ''}
                                        onChange={(e) => {
                                          const value = e.target.value === '' ? '' : parseInt(e.target.value, 10)
                                          setFormData({
                                            ...formData,
                                            numberOfAttendeesPerEvent: {
                                              ...formData.numberOfAttendeesPerEvent,
                                              [eventSlug]: value === '' ? undefined : (isNaN(value as number) ? undefined : value as number),
                                            },
                                          })
                                        }}
                                        className="w-full px-4 py-3 border-2 border-wedding-gold/30 rounded-lg bg-white/70 text-base sm:text-lg font-serif text-wedding-navy focus:outline-none focus:ring-2 focus:ring-wedding-gold focus:border-wedding-gold transition-all"
                                        placeholder="Enter number"
                                        required
                                      />
                                      <p className="text-xs sm:text-sm text-gray-600 mt-1 font-serif">
                                        Including yourself
                                      </p>
                                    </div>
                                  )}
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
                        Reception Menu Preference <span className="text-red-500">*</span>
                      </label>
                      <OrnamentalDivider variant="simple" className="mb-4" />
                      <div className="space-y-3">
                        <label 
                          onClick={() => setFormData({ ...formData, menuPreference: 'veg' })}
                          className={`flex items-center p-4 sm:p-5 border-2 rounded-xl cursor-pointer transition-all touch-manipulation min-h-[56px] select-none ${
                            formData.menuPreference === 'veg'
                              ? 'bg-green-50 border-green-400 shadow-md scale-[1.02]'
                              : !formData.menuPreference 
                                ? 'bg-white/50 border-red-300 hover:bg-wedding-cream/30 active:bg-wedding-cream/40'
                                : 'bg-white/50 border-wedding-gold/30 hover:bg-wedding-cream/30 active:bg-wedding-cream/40'
                          }`}
                          style={{ WebkitTapHighlightColor: 'transparent' }}
                        >
                          <input
                            type="radio"
                            name="menuPreference"
                            value="veg"
                            checked={formData.menuPreference === 'veg'}
                            onChange={(e) =>
                              setFormData({ ...formData, menuPreference: e.target.value as 'veg' })
                            }
                            onClick={(e) => e.stopPropagation()}
                            className="mr-4 w-5 h-5 sm:w-6 sm:h-6 text-wedding-gold focus:ring-wedding-gold touch-manipulation pointer-events-none"
                          />
                          <span className={`text-base sm:text-lg font-serif flex-1 ${
                            formData.menuPreference === 'veg' 
                              ? 'text-green-800 font-semibold' 
                              : 'text-gray-700'
                          }`}>Vegetarian</span>
                          {formData.menuPreference === 'veg' && (
                            <span className="text-green-600 text-xl ml-2">✓</span>
                          )}
                        </label>
                        <label 
                          onClick={() => setFormData({ ...formData, menuPreference: 'non-veg' })}
                          className={`flex items-center p-4 sm:p-5 border-2 rounded-xl cursor-pointer transition-all touch-manipulation min-h-[56px] select-none ${
                            formData.menuPreference === 'non-veg'
                              ? 'bg-blue-50 border-blue-400 shadow-md scale-[1.02]'
                              : !formData.menuPreference 
                                ? 'bg-white/50 border-red-300 hover:bg-wedding-cream/30 active:bg-wedding-cream/40'
                                : 'bg-white/50 border-wedding-gold/30 hover:bg-wedding-cream/30 active:bg-wedding-cream/40'
                          }`}
                          style={{ WebkitTapHighlightColor: 'transparent' }}
                        >
                          <input
                            type="radio"
                            name="menuPreference"
                            value="non-veg"
                            checked={formData.menuPreference === 'non-veg'}
                            onChange={(e) =>
                              setFormData({ ...formData, menuPreference: e.target.value as 'non-veg' })
                            }
                            onClick={(e) => e.stopPropagation()}
                            className="mr-4 w-5 h-5 sm:w-6 sm:h-6 text-wedding-gold focus:ring-wedding-gold touch-manipulation pointer-events-none"
                          />
                          <span className={`text-base sm:text-lg font-serif flex-1 ${
                            formData.menuPreference === 'non-veg' 
                              ? 'text-blue-800 font-semibold' 
                              : 'text-gray-700'
                          }`}>Non-Vegetarian</span>
                          {formData.menuPreference === 'non-veg' && (
                            <span className="text-blue-600 text-xl ml-2">✓</span>
                          )}
                        </label>
                        <label 
                          onClick={() => setFormData({ ...formData, menuPreference: 'both' })}
                          className={`flex items-center p-4 sm:p-5 border-2 rounded-xl cursor-pointer transition-all touch-manipulation min-h-[56px] select-none ${
                            formData.menuPreference === 'both'
                              ? 'bg-purple-50 border-purple-400 shadow-md scale-[1.02]'
                              : !formData.menuPreference 
                                ? 'bg-white/50 border-red-300 hover:bg-wedding-cream/30 active:bg-wedding-cream/40'
                                : 'bg-white/50 border-wedding-gold/30 hover:bg-wedding-cream/30 active:bg-wedding-cream/40'
                          }`}
                          style={{ WebkitTapHighlightColor: 'transparent' }}
                        >
                          <input
                            type="radio"
                            name="menuPreference"
                            value="both"
                            checked={formData.menuPreference === 'both'}
                            onChange={(e) =>
                              setFormData({ ...formData, menuPreference: e.target.value as 'both' })
                            }
                            onClick={(e) => e.stopPropagation()}
                            className="mr-4 w-5 h-5 sm:w-6 sm:h-6 text-wedding-gold focus:ring-wedding-gold touch-manipulation pointer-events-none"
                          />
                          <span className={`text-base sm:text-lg font-serif flex-1 ${
                            formData.menuPreference === 'both' 
                              ? 'text-purple-800 font-semibold' 
                              : 'text-gray-700'
                          }`}>Both</span>
                          {formData.menuPreference === 'both' && (
                            <span className="text-purple-600 text-xl ml-2">✓</span>
                          )}
                        </label>
                      </div>
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

