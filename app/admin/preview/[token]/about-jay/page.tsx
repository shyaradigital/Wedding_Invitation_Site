import { redirect } from 'next/navigation'
import { getAdminFromRequest } from '@/lib/admin-auth'
import PreviewAboutJayContent from '@/components/PreviewAboutJayContent'

export default async function PreviewAboutJayPage({
  params,
}: {
  params: { token: string }
}) {
  const admin = await getAdminFromRequest()
  if (!admin) {
    redirect('/admin/login')
  }

  return <PreviewAboutJayContent token={params.token} />
}

