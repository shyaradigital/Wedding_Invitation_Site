'use client'

import { ReactNode } from 'react'
import InvitationNavigation from './InvitationNavigation'
import AdminPreviewBanner from './AdminPreviewBanner'

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
  const isAdminPreview = token === 'admin-preview'

  return (
    <div className="min-h-screen bg-gradient-wedding flex flex-col">
      {/* Admin Preview Banner - Show only in admin preview mode */}
      {isAdminPreview && <AdminPreviewBanner />}
      
      {/* Navigation with integrated header */}
      <InvitationNavigation token={token} eventAccess={eventAccess} guestName={guestName} />

      {/* Page Content - Add left margin on desktop to account for sidebar */}
      <main className="flex-1 md:ml-64">
        {children}
      </main>

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

