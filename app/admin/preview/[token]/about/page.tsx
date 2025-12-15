import { redirect } from 'next/navigation'
import { getAdminFromRequest } from '@/lib/admin-auth'
import PreviewAboutContent from '@/components/PreviewAboutContent'

export const dynamic = 'force-dynamic'

export default async function PreviewAboutPage({
  params,
}: {
  params: { token: string }
}) {
  const admin = await getAdminFromRequest()
  if (!admin) {
    redirect('/admin/login')
  }

  return <PreviewAboutContent token={params.token} />
}

