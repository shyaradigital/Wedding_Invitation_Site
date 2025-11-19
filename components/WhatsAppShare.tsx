'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

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
    `Hi ${guestName} 👋,\n\nYou are invited to Ankita & Jay's wedding celebrations!\n\nHere is your personalized invitation link:\n${typeof window !== 'undefined' ? window.location.origin : ''}/invite/${guestToken}\n\nLooking forward to celebrating with you! 💛`
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

    // Remove any non-digit characters except +
    const cleanPhone = phone.replace(/[^\d+]/g, '')
    const encodedMessage = encodeURIComponent(message)
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`

    window.open(whatsappUrl, '_blank')
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-semibold transition-colors text-xs sm:text-sm flex items-center gap-1 sm:gap-2 w-full sm:w-auto justify-center"
      >
        <span>💬</span>
        <span className="hidden sm:inline">Generate WhatsApp</span>
        <span className="sm:hidden">WhatsApp</span>
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
                    placeholder="+1234567890"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wedding-gold focus:border-transparent"
                  />
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
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

