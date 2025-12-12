'use client'

import Link from 'next/link'
import GuestInviteLayout from './GuestInviteLayout'

interface Guest {
  id: string
  name: string
  phone: string | null
  eventAccess: string[]
  allowedDevices: string[]
  hasPhone: boolean
  tokenUsedFirstTime: string | null
  maxDevicesAllowed: number
}

interface AdminPreviewPageProps {
  guest: Guest
  token: string
}

export default function AdminPreviewPage({
  guest,
  token,
}: AdminPreviewPageProps) {
  return (
    <div className="min-h-screen">
      {/* Admin Preview Banner */}
      <div className="bg-yellow-500 text-yellow-900 px-3 sm:px-4 py-2.5 sm:py-3 text-center font-semibold shadow-md sticky top-0 z-[200]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-2">
          <span className="text-lg sm:text-xl">👁️</span>
          <span className="text-xs sm:text-sm md:text-base">ADMIN PREVIEW MODE - This view does not count as a device</span>
          <Link
            href="/admin"
            className="mt-2 sm:mt-0 sm:ml-4 px-3 py-1.5 sm:py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 active:scale-95 transition-colors text-xs sm:text-sm touch-manipulation min-h-[36px]"
          >
            Back to Admin
          </Link>
        </div>
      </div>

      {/* Use the same layout as guests see */}
      <GuestInviteLayout guest={guest} token={token} />
    </div>
  )
}

