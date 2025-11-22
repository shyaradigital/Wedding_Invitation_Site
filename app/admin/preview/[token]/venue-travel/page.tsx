import { redirect } from 'next/navigation'
import { getAdminFromRequest } from '@/lib/admin-auth'
import PreviewVenueTravelContent from '@/components/PreviewVenueTravelContent'

export default async function PreviewVenueTravelPage({
  params,
}: {
  params: { token: string }
}) {
  const admin = await getAdminFromRequest()
  if (!admin) {
    redirect('/admin/login')
  }

  return <PreviewVenueTravelContent token={params.token} />
}

