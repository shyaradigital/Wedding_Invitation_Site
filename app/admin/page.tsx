import { redirect } from 'next/navigation'
import { getAdminFromRequest } from '@/lib/admin-auth'
import AdminDashboard from '@/components/AdminDashboard'

export default async function AdminPage() {
  const admin = await getAdminFromRequest()

  if (!admin) {
    redirect('/admin/login')
  }

  return <AdminDashboard />
}

