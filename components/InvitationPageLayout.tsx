'use client'

import { ReactNode } from 'react'
import InvitationNavigation from './InvitationNavigation'

interface InvitationPageLayoutProps {
  token: string
  eventAccess: string[]
  guestName: string
  children: ReactNode
}

export default function InvitationPageLayout({
  token,
  eventAccess,
  guestName,
  children,
}: InvitationPageLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-wedding">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-wedding-gold/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-display text-wedding-navy text-center">
            Welcome, {guestName}! 💐
          </h1>
        </div>
      </header>

      {/* Navigation */}
      <InvitationNavigation token={token} eventAccess={eventAccess} />

      {/* Page Content */}
      {children}

      {/* Footer */}
      <footer className="bg-gradient-to-b from-wedding-navy to-wedding-navy-light text-white py-6 sm:py-8 mt-8 sm:mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-sm sm:text-base opacity-75">
            © {new Date().getFullYear()} Ankita Brijesh Sharma & Jay Bhavan Mehta
          </p>
        </div>
      </footer>
    </div>
  )
}

