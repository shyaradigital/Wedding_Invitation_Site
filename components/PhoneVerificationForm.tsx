'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface PhoneVerificationFormProps {
  onSubmit: (phone: string) => Promise<void>
  isLoading?: boolean
}

export default function PhoneVerificationForm({
  onSubmit,
  isLoading = false,
}: PhoneVerificationFormProps) {
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Basic validation
    const digitsOnly = phone.replace(/\D/g, '')
    if (digitsOnly.length < 8 || digitsOnly.length > 15) {
      setError('Please enter a valid phone number (8-15 digits)')
      return
    }

    try {
      await onSubmit(digitsOnly)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-md w-full mx-auto wedding-card rounded-2xl shadow-xl p-6 sm:p-8"
    >
      <div className="text-center mb-6">
        <div className="text-5xl mb-4">📱</div>
        <h2 className="text-2xl sm:text-3xl font-display text-wedding-navy mb-3">
          Enter Your Phone Number
        </h2>
        <div className="wedding-divider max-w-32 mx-auto mb-4"></div>
        <p className="text-base sm:text-lg text-gray-600 px-2">
          Please enter your phone number to continue
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone Number"
            className="w-full px-4 py-3 text-base sm:text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-wedding-gold focus:border-transparent"
            disabled={isLoading}
            autoFocus
            autoComplete="tel"
          />
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-gold text-white py-3.5 sm:py-4 rounded-full font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-base sm:text-lg"
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

