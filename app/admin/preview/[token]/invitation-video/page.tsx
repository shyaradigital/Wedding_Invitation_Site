import { redirect } from 'next/navigation'
import { getAdminFromRequest } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'
import { ensureJsonArray } from '@/lib/utils'
import PreviewInvitationVideoContent from '@/components/PreviewInvitationVideoContent'

export const dynamic = 'force-dynamic'

export default async function PreviewInvitationVideoPage({
  params,
}: {
  params: { token: string }
}) {
  const admin = await getAdminFromRequest()
  if (!admin) {
    redirect('/admin/login')
  }

  // Get guest data
  const guest = await prisma.guest.findUnique({
    where: { token: params.token },
    select: {
      id: true,
      name: true,
      phone: true,
      eventAccess: true,
      allowedDevices: true,
      tokenUsedFirstTime: true,
      maxDevicesAllowed: true,
    },
  })

  if (!guest) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-wedding p-4">
        <div className="max-w-md w-full wedding-card rounded-2xl shadow-2xl p-6 sm:p-8 text-center">
          <div className="text-5xl sm:text-6xl mb-4">❌</div>
          <h1 className="text-2xl sm:text-3xl font-display text-wedding-navy mb-4">
            Guest Not Found
          </h1>
          <p className="text-gray-600 mb-6">The invitation token does not exist.</p>
          <a
            href="/admin"
            className="inline-block bg-wedding-gold text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all"
          >
            Back to Admin Panel
          </a>
        </div>
      </div>
    )
  }

  return (
    <PreviewInvitationVideoContent
      guest={{
        id: guest.id,
        name: guest.name,
        phone: guest.phone,
        eventAccess: ensureJsonArray(guest.eventAccess),
        allowedDevices: ensureJsonArray(guest.allowedDevices),
        hasPhone: !!guest.phone,
        tokenUsedFirstTime: guest.tokenUsedFirstTime?.toISOString() || null,
        maxDevicesAllowed: guest.maxDevicesAllowed,
      }}
      token={params.token}
    />
  )
}

