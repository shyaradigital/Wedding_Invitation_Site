'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { validatePhoneNumber, validateEmail } from '@/lib/utils'

interface PhoneOrEmailVerificationFormProps {
  onSubmit: (phoneOrEmail: string) => Promise<void>
  isLoading?: boolean
}

export default function PhoneOrEmailVerificationForm({
  onSubmit,
  isLoading = false,
}: PhoneOrEmailVerificationFormProps) {
  const [phoneOrEmail, setPhoneOrEmail] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Determine if input is phone or email
    const isEmail = validateEmail(phoneOrEmail)
    const isPhone = validatePhoneNumber(phoneOrEmail)

    if (!isEmail && !isPhone) {
      setError('Please enter a valid phone number (8-15 digits) or email address')
      return
    }

    // Normalize phone number (remove non-digits) or keep email as-is
    const normalizedInput = isPhone ? phoneOrEmail.replace(/\D/g, '') : phoneOrEmail.trim()

    try {
      await onSubmit(normalizedInput)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-md w-full mx-auto wedding-card rounded-xl sm:rounded-2xl shadow-xl p-5 sm:p-6 md:p-8"
    >
      <div className="text-center mb-5 sm:mb-6">
        <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">📱</div>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-display text-wedding-navy mb-2 sm:mb-3">
          Enter Your Phone Number or Email
        </h2>
        <div className="wedding-divider max-w-32 mx-auto mb-3 sm:mb-4"></div>
        <p className="text-sm sm:text-base md:text-lg text-gray-600 px-2">
          Please enter your phone number or email to continue
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            value={phoneOrEmail}
            onChange={(e) => setPhoneOrEmail(e.target.value)}
            placeholder="Phone Number or Email"
            className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-wedding-gold focus:border-transparent touch-manipulation"
            disabled={isLoading}
            autoFocus
            autoComplete="tel email"
          />
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-gold text-white py-3.5 sm:py-4 rounded-full font-semibold hover:shadow-lg active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-base sm:text-lg touch-manipulation min-h-[48px]"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Verifying...
            </span>
          ) : (
            'Proceed'
          )}
        </button>
      </form>
    </motion.div>
  )
}

