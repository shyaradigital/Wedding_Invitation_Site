import { redirect } from 'next/navigation'
import { getAdminFromRequest } from '@/lib/admin-auth'
import PreviewSaveTheDateContent from '@/components/PreviewSaveTheDateContent'

export default async function PreviewSaveTheDatePage({
  params,
}: {
  params: { token: string }
}) {
  const admin = await getAdminFromRequest()
  if (!admin) {
    redirect('/admin/login')
  }

  return <PreviewSaveTheDateContent token={params.token} />
}

