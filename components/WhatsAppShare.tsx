'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatPhoneForWhatsApp } from '@/lib/utils'

interface WhatsAppShareProps {
  guestName: string
  guestToken: string
  guestPhone?: string | null
}

export default function WhatsAppShare({
  guestName,
  guestToken,
  guestPhone,
}: WhatsAppShareProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [phone, setPhone] = useState(guestPhone || '')
  const [message, setMessage] = useState(
    `Hi ${guestName}👋,\n\nYou are invited to Ankita & Jay's wedding celebrations!\n\nBelow is your personalized event(s) invitation link:\n${typeof window !== 'undefined' ? window.location.origin : ''}/invite/${guestToken}\n\n*Please RSVP latest by January 10, 2026.*\nLooking forward to celebrating with you! 💛`
  )
  const [copied, setCopied] = useState(false)

  const inviteLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/invite/${guestToken}`

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(message)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleOpenWhatsApp = () => {
    if (!phone) {
      alert('Please enter a phone number')
      return
    }

    // Format phone number for WhatsApp (handles international numbers correctly)
    // This function already returns only digits
    const formattedPhone = formatPhoneForWhatsApp(phone)
    
    if (!formattedPhone || formattedPhone.length < 8) {
      alert('Please enter a valid phone number with country code (e.g., +91 8103073510 for India, +1 2345678900 for US)')
      return
    }

    // Ensure phone number is clean (only digits, no + or spaces)
    // formatPhoneForWhatsApp already returns digits only, but double-check
    const cleanPhone = formattedPhone.replace(/\D/g, '')
    
    // Encode the message properly for WhatsApp
    // WhatsApp requires proper URL encoding
    const encodedMessage = encodeURIComponent(message)
    
    // Use api.whatsapp.com format which is more reliable for pre-filled messages
    // This format works better on both mobile and desktop
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedMessage}`
    
    // Open in new tab/window
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="group relative bg-green-500 hover:bg-green-600 text-white px-2.5 py-1.5 rounded text-xs font-semibold transition-colors flex items-center gap-1.5 justify-center whitespace-nowrap w-full"
        title="Generate WhatsApp Message"
      >
        <span>💬</span>
        <span className="hidden lg:inline">WhatsApp</span>
        <span className="lg:hidden">Send</span>
        <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-20 transition-opacity">
          Generate WhatsApp Message
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl sm:text-3xl font-display text-wedding-navy">
                  WhatsApp Invitation
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                {/* Phone Number Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Guest Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 8103073510 or 8103073510 (India) or +1 2345678900 (US)"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wedding-gold focus:border-transparent"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Enter with country code (e.g., +91 for India, +1 for US) or just the number for Indian numbers
                  </p>
                </div>

                {/* Message Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={8}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wedding-gold focus:border-transparent resize-none"
                  />
                </div>

                {/* Invite Link Display */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Invitation Link
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inviteLink}
                      readOnly
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                    <button
                      onClick={handleCopyLink}
                      className="bg-wedding-gold hover:bg-wedding-gold/90 text-white px-4 py-2 rounded-lg font-semibold transition-colors whitespace-nowrap"
                    >
                      {copied ? '✓ Copied' : 'Copy Link'}
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    onClick={handleCopyMessage}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    {copied ? '✓ Message Copied' : 'Copy Message'}
                  </button>
                  <button
                    onClick={handleOpenWhatsApp}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <span>💬</span>
                    Open WhatsApp
                  </button>
                </div>
                
                {/* Debug info (can be removed in production) */}
                {phone && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
                    <p><strong>Formatted Phone:</strong> {formatPhoneForWhatsApp(phone)}</p>
                    <p className="mt-1 break-all"><strong>WhatsApp URL:</strong> https://api.whatsapp.com/send?phone={formatPhoneForWhatsApp(phone).replace(/\D/g, '')}&text={encodeURIComponent(message).substring(0, 50)}...</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

