import { redirect } from 'next/navigation'
import { getAdminFromRequest } from '@/lib/admin-auth'
import AdminPreviewPage from '@/components/AdminPreviewPage'

export const dynamic = 'force-dynamic'

export default async function AdminPreviewAllEventsPage({
  searchParams,
}: {
  searchParams: { type?: string }
}) {
  // Check if user is admin
  const admin = await getAdminFromRequest()
  if (!admin) {
    redirect('/admin/login')
  }

  // Determine event access based on type parameter
  const eventAccess = searchParams?.type === 'reception-only'
    ? ['reception']
    : ['mehndi', 'wedding', 'reception'] // Default to all events

  // Create virtual guest object with selected event access
  const virtualGuest = {
    id: 'admin-preview',
    name: 'Admin Preview',
    phone: null,
    eventAccess,
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
