'use client'

import { useState, useEffect } from 'react'

interface Event {
  id: string
  slug: string
  title: string
  description: string | null
  date: string | null
  time: string | null
  venue: string | null
  address: string | null
  dressCode: string | null
  mapEmbedUrl: string | null
}

export default function EventEditor() {
  const [events, setEvents] = useState<Event[]>([])
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    venue: '',
    address: '',
    dressCode: '',
    mapEmbedUrl: '',
  })

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch('/api/admin/events')
      if (response.ok) {
        const data = await response.json()
        setEvents(data.events || [])
      } else {
        const errorData = await response.json().catch(() => ({}))
        setError(errorData.error || 'Failed to fetch events')
      }
    } catch (err) {
      console.error('Error fetching events:', err)
      setError('Failed to load events. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (event: Event) => {
    setEditingEvent(event)
    setFormData({
      title: event.title || '',
      description: event.description || '',
      date: event.date ? new Date(event.date).toISOString().split('T')[0] : '',
      time: event.time || '',
      venue: event.venue || '',
      address: event.address || '',
      dressCode: event.dressCode || '',
      mapEmbedUrl: event.mapEmbedUrl || '',
    })
  }

  const handleSave = async () => {
    if (!editingEvent) return

    try {
      const response = await fetch(`/api/admin/events/${editingEvent.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          date: formData.date ? new Date(formData.date).toISOString() : null,
        }),
      })

      if (response.ok) {
        await fetchEvents()
        setEditingEvent(null)
      }
    } catch (err) {
      console.error('Error saving event:', err)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 sm:p-8">
        <h2 className="text-2xl font-serif text-wedding-navy mb-6">
          Event Editor
        </h2>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <svg
              className="animate-spin h-8 w-8 text-wedding-gold mx-auto mb-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <p className="text-gray-600">Loading events...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6 sm:p-8">
        <h2 className="text-2xl font-serif text-wedding-navy mb-6">
          Event Editor
        </h2>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
        <button
          onClick={fetchEvents}
          className="bg-wedding-gold text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 sm:p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-serif text-wedding-navy">
          Event Editor
        </h2>
        <button
          onClick={fetchEvents}
          className="text-sm text-wedding-gold hover:text-wedding-gold/80 transition-colors"
        >
          🔄 Refresh
        </button>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📅</div>
          <h3 className="text-xl font-serif text-wedding-navy mb-2">
            No Events Found
          </h3>
          <p className="text-gray-600 mb-6">
            Events haven't been seeded yet. Please run the seed script to create initial events.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 text-left max-w-md mx-auto">
            <p className="text-sm font-mono text-gray-700 mb-2">
              Run this command to seed events:
            </p>
            <code className="text-xs bg-white px-3 py-2 rounded border block">
              npm run seed:events
            </code>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
          <div
            key={event.id}
            className="bg-gray-50 rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-serif text-wedding-navy">
                {event.title}
              </h3>
              <button
                onClick={() => handleEdit(event)}
                className="bg-wedding-gold text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
              >
                Edit
              </button>
            </div>

            {editingEvent?.id === event.id ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) =>
                        setFormData({ ...formData, date: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time
                    </label>
                    <input
                      type="time"
                      value={formData.time}
                      onChange={(e) =>
                        setFormData({ ...formData, time: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Venue
                  </label>
                  <input
                    type="text"
                    value={formData.venue}
                    onChange={(e) =>
                      setFormData({ ...formData, venue: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dress Code
                  </label>
                  <input
                    type="text"
                    value={formData.dressCode}
                    onChange={(e) =>
                      setFormData({ ...formData, dressCode: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Map Embed URL
                  </label>
                  <input
                    type="url"
                    value={formData.mapEmbedUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, mapEmbedUrl: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="Google Maps embed URL"
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={handleSave}
                    className="bg-wedding-gold text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingEvent(null)}
                    className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-gray-600">
                <p>Date: {event.date || 'Not set'}</p>
                <p>Time: {event.time || 'Not set'}</p>
                <p>Venue: {event.venue || 'Not set'}</p>
              </div>
            )}
          </div>
        ))}
        </div>
      )}
    </div>
  )
}

