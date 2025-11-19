import { cookies } from 'next/headers'
import { verifyAdminToken } from './auth'
import { prisma } from './prisma'

export async function getAdminFromRequest(): Promise<{ id: string; email: string } | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('admin_token')?.value

    if (!token) {
      return null
    }

    const decoded = verifyAdminToken(token)
    if (!decoded) {
      return null
    }

    const admin = await prisma.admin.findUnique({
      where: { id: decoded.adminId },
      select: { id: true, email: true },
    })

    return admin
  } catch {
    return null
  }
}

export async function requireAdmin() {
  const admin = await getAdminFromRequest()
  if (!admin) {
    throw new Error('Unauthorized')
  }
  return admin
}

