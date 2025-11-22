import { redirect } from 'next/navigation'
import { getAdminFromRequest } from '@/lib/admin-auth'
import PreviewEventContent from '@/components/PreviewEventContent'

export default async function PreviewEventPage({
  params,
}: {
  params: { token: string; slug: string }
}) {
  const admin = await getAdminFromRequest()
  if (!admin) {
    redirect('/admin/login')
  }

  return <PreviewEventContent token={params.token} slug={params.slug} />
}

