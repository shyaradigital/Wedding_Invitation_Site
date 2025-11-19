'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import GuestEditor from './GuestEditor'
import EventEditor from './EventEditor'

interface Guest {
  id: string
  name: string
  phone: string | null
  token: string
  eventAccess: string[]
  allowedDevices: string[]
  tokenUsedFirstTime: string | null
  maxDevicesAllowed: number
  createdAt: string
}

type Tab = 'guests' | 'events' | 'content'

export default function AdminDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('guests')
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

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
          <nav className="flex space-x-2 sm:space-x-4 min-w-max px-4">
            <button
              onClick={() => setActiveTab('guests')}
              className={`py-3 sm:py-4 px-3 sm:px-4 border-b-2 font-semibold text-xs sm:text-sm whitespace-nowrap transition-colors ${
                activeTab === 'guests'
                  ? 'border-wedding-gold text-wedding-gold bg-wedding-gold-light/10'
                  : 'border-transparent text-gray-500 hover:text-wedding-navy hover:border-wedding-gold/30'
              }`}
            >
              👥 Guest Management
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`py-3 sm:py-4 px-3 sm:px-4 border-b-2 font-semibold text-xs sm:text-sm whitespace-nowrap transition-colors ${
                activeTab === 'events'
                  ? 'border-wedding-gold text-wedding-gold bg-wedding-gold-light/10'
                  : 'border-transparent text-gray-500 hover:text-wedding-navy hover:border-wedding-gold/30'
              }`}
            >
              📅 Event Editor
            </button>
            <button
              onClick={() => setActiveTab('content')}
              className={`py-3 sm:py-4 px-3 sm:px-4 border-b-2 font-semibold text-xs sm:text-sm whitespace-nowrap transition-colors ${
                activeTab === 'content'
                  ? 'border-wedding-gold text-wedding-gold bg-wedding-gold-light/10'
                  : 'border-transparent text-gray-500 hover:text-wedding-navy hover:border-wedding-gold/30'
              }`}
            >
              ✏️ Content Management
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-4 sm:mt-8">
          {activeTab === 'guests' && (
            <GuestEditor
              guests={guests}
              onGuestsChange={fetchGuests}
              isLoading={isLoading}
            />
          )}
          {activeTab === 'events' && <EventEditor />}
          {activeTab === 'content' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-serif text-wedding-navy mb-4">
                Content Management
              </h2>
              <p className="text-gray-600">
                Content management features coming soon. You can edit About and
                Venue & Travel pages here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

