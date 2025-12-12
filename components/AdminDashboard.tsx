'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import GuestEditor from './GuestEditor'

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

export default function AdminDashboard() {
  const router = useRouter()
  const [guests, setGuests] = useState<Guest[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchGuests()
  }, [])

  const fetchGuests = async () => {
    try {
      const response = await fetch('/api/admin/guest')
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
    await fetch('/api/admin/logout', { method: 'POST' })
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
          <button
            onClick={handleLogout}
            className="bg-wedding-gold text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg hover:bg-wedding-gold/90 transition-all duration-300 text-sm sm:text-base w-full sm:w-auto font-semibold shadow-sm hover:shadow-md"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Guest Management */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <GuestEditor
          guests={guests}
          onGuestsChange={fetchGuests}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}

