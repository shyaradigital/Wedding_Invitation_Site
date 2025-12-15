import { redirect } from 'next/navigation'
import { getAdminFromRequest } from '@/lib/admin-auth'
import PreviewGalleryContent from '@/components/PreviewGalleryContent'

export const dynamic = 'force-dynamic'

export default async function PreviewGalleryPage({
  params,
}: {
  params: { token: string }
}) {
  const admin = await getAdminFromRequest()
  if (!admin) {
    redirect('/admin/login')
  }

  return <PreviewGalleryContent token={params.token} />
}

