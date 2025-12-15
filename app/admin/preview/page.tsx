import { redirect } from 'next/navigation'
import { getAdminFromRequest } from '@/lib/admin-auth'
import AdminPreviewPage from '@/components/AdminPreviewPage'

export const dynamic = 'force-dynamic'

export default async function AdminPreviewAllEventsPage() {
  // Check if user is admin
  const admin = await getAdminFromRequest()
  if (!admin) {
    redirect('/admin/login')
  }

  // Create virtual guest object with all events enabled
  const virtualGuest = {
    id: 'admin-preview',
    name: 'Admin Preview',
    phone: null,
    eventAccess: ['mehndi', 'wedding', 'reception'],
    allowedDevices: [],
    hasPhone: false,
    tokenUsedFirstTime: null,
    maxDevicesAllowed: 999,
  }

  return (
    <AdminPreviewPage
      guest={virtualGuest}
      token="admin-preview"
    />
  )
}
