'use client'

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
  // Banner is now handled by GuestInviteLayout and InvitationPageLayout
  // based on token === 'admin-preview'
  return <GuestInviteLayout guest={guest} token={token} />
}

