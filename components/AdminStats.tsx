'use client'

import { useState, useEffect } from 'react'

interface EventStats {
  totalAttendees: number
  veg: number
  nonVeg: number
}

interface Stats {
  totalInviteLinks: number
  totalAttendeesInviteBased: number
  inviteBased: {
    mehndi: number
    wedding: number
    reception: number
  }
  rsvpBased: {
    mehndi: EventStats
    wedding: EventStats
    reception: EventStats
  }
}

const EVENT_NAMES: Record<string, string> = {
  mehndi: 'Mehndi',
  wedding: 'Wedding',
  reception: 'Reception',
}

export default function AdminStats() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch('/api/admin/stats')
      
      if (!response.ok) {
        throw new Error('Failed to fetch stats')
      }
      
      const data = await response.json()
      setStats(data.stats)
    } catch (err) {
      console.error('Error fetching stats:', err)
      setError('Failed to load statistics')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
        <div className="text-center text-gray-500">Loading statistics...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
        <div className="text-center text-red-500">{error}</div>
        <button
          onClick={fetchStats}
          className="mt-4 mx-auto block bg-wedding-gold text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  if (!stats) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Invite Statistics Card */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <h2 className="text-2xl font-display text-wedding-navy mb-6 flex items-center gap-2">
          <span>📊</span>
          <span>Invite Statistics</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-wedding-gold/10 to-wedding-gold/5 rounded-lg p-4 border border-wedding-gold/20">
            <div className="text-sm text-gray-600 mb-1">Total Invite Links Sent</div>
            <div className="text-3xl font-bold text-wedding-navy">{stats.totalInviteLinks}</div>
          </div>
          
          <div className="bg-gradient-to-br from-wedding-rose/10 to-wedding-rose/5 rounded-lg p-4 border border-wedding-rose/20">
            <div className="text-sm text-gray-600 mb-1">Total Attendees (Invite-Based)</div>
            <div className="text-3xl font-bold text-wedding-navy">{stats.totalAttendeesInviteBased}</div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="text-sm font-semibold text-gray-700 mb-3">Attendees by Event (Invite-Based):</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-wedding-gold/5 rounded-lg">
              <div className="text-xs text-gray-600 mb-1">Mehndi</div>
              <div className="text-xl font-bold text-wedding-navy">{stats.inviteBased.mehndi}</div>
            </div>
            <div className="text-center p-3 bg-wedding-rose/5 rounded-lg">
              <div className="text-xs text-gray-600 mb-1">Wedding</div>
              <div className="text-xl font-bold text-wedding-navy">{stats.inviteBased.wedding}</div>
            </div>
            <div className="text-center p-3 bg-wedding-navy/5 rounded-lg">
              <div className="text-xs text-gray-600 mb-1">Reception</div>
              <div className="text-xl font-bold text-wedding-navy">{stats.inviteBased.reception}</div>
            </div>
          </div>
        </div>
      </div>

      {/* RSVP Statistics Cards */}
      <div className="space-y-4">
        <h2 className="text-2xl font-display text-wedding-navy mb-4 flex items-center gap-2">
          <span>✅</span>
          <span>RSVP-Based Statistics</span>
        </h2>
        
        {(['mehndi', 'wedding', 'reception'] as const).map((eventSlug) => {
          const eventStats = stats.rsvpBased[eventSlug]
          const eventName = EVENT_NAMES[eventSlug]
          
          return (
            <div key={eventSlug} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-xl font-display text-wedding-navy mb-4">{eventName}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                  <div className="text-sm text-gray-600 mb-1">Total Attendees</div>
                  <div className="text-2xl font-bold text-wedding-navy">{eventStats.totalAttendees}</div>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                  <div className="text-sm text-gray-600 mb-1">Veg</div>
                  <div className="text-2xl font-bold text-green-700">{eventStats.veg}</div>
                </div>
                
                <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 border border-red-200">
                  <div className="text-sm text-gray-600 mb-1">Non-Veg</div>
                  <div className="text-2xl font-bold text-red-700">{eventStats.nonVeg}</div>
                </div>
              </div>

              {/* Visual Breakdown */}
              {eventStats.totalAttendees > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="text-sm font-semibold text-gray-700 mb-2">Menu Preference Breakdown:</div>
                  <div className="flex gap-2 h-8 rounded-lg overflow-hidden">
                    {eventStats.veg > 0 && (
                      <div
                        className="bg-green-500 flex items-center justify-center text-white text-xs font-semibold"
                        style={{ width: `${(eventStats.veg / eventStats.totalAttendees) * 100}%` }}
                      >
                        {eventStats.veg > 0 && `${Math.round((eventStats.veg / eventStats.totalAttendees) * 100)}%`}
                      </div>
                    )}
                    {eventStats.nonVeg > 0 && (
                      <div
                        className="bg-red-500 flex items-center justify-center text-white text-xs font-semibold"
                        style={{ width: `${(eventStats.nonVeg / eventStats.totalAttendees) * 100}%` }}
                      >
                        {eventStats.nonVeg > 0 && `${Math.round((eventStats.nonVeg / eventStats.totalAttendees) * 100)}%`}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-4 mt-2 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-green-500 rounded"></div>
                      <span>Veg: {eventStats.veg}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-red-500 rounded"></div>
                      <span>Non-Veg: {eventStats.nonVeg}</span>
                    </div>
                  </div>
                </div>
              )}

              {eventStats.totalAttendees === 0 && (
                <div className="text-center text-gray-400 py-4">
                  No RSVPs received yet for this event
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

