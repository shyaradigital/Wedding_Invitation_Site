'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import GuestEditor from './GuestEditor'
import AdminStats from './AdminStats'
import AdminEditor from './AdminEditor'

interface Guest {
  id: string
  name: string
  phone: string | null
  email: string | null
  token: string
  eventAccess: string[]
  allowedDevices: string[]
  tokenUsedFirstTime: string | null
  maxDevicesAllowed: number
  numberOfAttendees: number
  createdAt: string
}

type TabType = 'stats' | 'guests' | 'admins'

interface AdminDashboardProps {
  currentAdminId: string
}

export default function AdminDashboard({ currentAdminId }: AdminDashboardProps) {
  const router = useRouter()
  const [guests, setGuests] = useState<Guest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('stats')

  useEffect(() => {
    fetchGuests()
  }, [])

  const fetchGuests = async () => {
    try {
      const response = await fetch('/api/admin/guest', { cache: 'no-store' })
      if (response.ok) {
        const data = await response.json()
        setGuests(data.guests || [])
      }
    } catch (err) {
      console.error('Error fetching guests:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    // Clear admin cookie
    await fetch('/api/admin/logout', { method: 'POST', cache: 'no-store' })
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm shadow-md border-b border-wedding-gold/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
          <div className="flex items-center gap-3">
            <span className="text-2xl sm:text-3xl">👑</span>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-display text-wedding-navy">
              Admin Dashboard
            </h1>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
            <Link
              href="/admin/preview"
              className="bg-wedding-navy text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg hover:bg-wedding-navy/90 transition-all duration-300 text-sm sm:text-base w-full sm:w-auto font-semibold shadow-sm hover:shadow-md flex items-center justify-center gap-2"
            >
              <span>👁️</span>
              <span>View as Guest</span>
            </Link>
            <button
              onClick={handleLogout}
              className="bg-wedding-gold text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg hover:bg-wedding-gold/90 transition-all duration-300 text-sm sm:text-base w-full sm:w-auto font-semibold shadow-sm hover:shadow-md"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <nav className="flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('stats')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'stats'
                  ? 'border-wedding-gold text-wedding-navy'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📊 Statistics
            </button>
            <button
              onClick={() => setActiveTab('guests')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'guests'
                  ? 'border-wedding-gold text-wedding-navy'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              👥 Guest Management
            </button>
            <button
              onClick={() => setActiveTab('admins')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'admins'
                  ? 'border-wedding-gold text-wedding-navy'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              ⚙️ Admin Management
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {activeTab === 'stats' && <AdminStats />}
        {activeTab === 'guests' && (
          <GuestEditor
            guests={guests}
            onGuestsChange={fetchGuests}
            isLoading={isLoading}
          />
        )}
        {activeTab === 'admins' && <AdminEditor currentAdminId={currentAdminId} />}
      </div>
    </div>
  )
}

