import { redirect } from 'next/navigation'
import { getAdminFromRequest } from '@/lib/admin-auth'
import PreviewAboutAnkitaContent from '@/components/PreviewAboutAnkitaContent'

export default async function PreviewAboutAnkitaPage({
  params,
}: {
  params: { token: string }
}) {
  const admin = await getAdminFromRequest()
  if (!admin) {
    redirect('/admin/login')
  }

  return <PreviewAboutAnkitaContent token={params.token} />
}

