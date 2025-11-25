'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import WhatsAppShare from './WhatsAppShare'

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

interface GuestEditorProps {
  guests: Guest[]
  onGuestsChange: () => void
  isLoading: boolean
}

export default function GuestEditor({
  guests,
  onGuestsChange,
  isLoading,
}: GuestEditorProps) {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null)
  const [viewingGuest, setViewingGuest] = useState<Guest | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterEvent, setFilterEvent] = useState<string>('all')
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    eventAccess: 'all-events' as 'all-events' | 'reception-only',
    maxDevicesAllowed: 1,
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showImportModal, setShowImportModal] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [importResults, setImportResults] = useState<any>(null)

  const handleCreateGuest = async () => {
    if (!formData.name.trim()) {
      setError('Name is required')
      return
    }

    setError(null)
    try {
      const response = await fetch('/api/admin/guest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone || undefined,
          eventAccess: formData.eventAccess,
          maxDevicesAllowed: formData.maxDevicesAllowed,
        }),
      })

      if (response.ok) {
        setSuccess('Guest created successfully!')
        onGuestsChange()
        setShowCreateForm(false)
        setFormData({
          name: '',
          phone: '',
          eventAccess: 'all-events',
          maxDevicesAllowed: 1,
        })
        setTimeout(() => setSuccess(null), 3000)
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to create guest')
      }
    } catch (err) {
      console.error('Error creating guest:', err)
      setError('An error occurred. Please try again.')
    }
  }

  const handleUpdateGuest = async (guestId: string, updates: any) => {
    setError(null)
    try {
      const response = await fetch(`/api/admin/guest/${guestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        setSuccess('Guest updated successfully!')
        onGuestsChange()
        setEditingGuest(null)
        setTimeout(() => setSuccess(null), 3000)
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to update guest')
      }
    } catch (err) {
      console.error('Error updating guest:', err)
      setError('An error occurred. Please try again.')
    }
  }

  const handleDeleteGuest = async (guestId: string, guestName: string) => {
    if (!confirm(`Are you sure you want to delete ${guestName}? This action cannot be undone.`)) {
      return
    }

    setError(null)
    try {
      const response = await fetch(`/api/admin/guest/${guestId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setSuccess('Guest deleted successfully!')
        onGuestsChange()
        setTimeout(() => setSuccess(null), 3000)
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to delete guest')
      }
    } catch (err) {
      console.error('Error deleting guest:', err)
      setError('An error occurred. Please try again.')
    }
  }

  const handleEditClick = (guest: Guest) => {
    setEditingGuest(guest)
    setFormData({
      name: guest.name,
      phone: guest.phone || '',
      eventAccess: getEventAccessType(guest.eventAccess),
      maxDevicesAllowed: guest.maxDevicesAllowed,
    })
    setShowCreateForm(false)
    setError(null)
  }

  const handleSaveEdit = async () => {
    if (!editingGuest) return
    if (!formData.name.trim()) {
      setError('Name is required')
      return
    }

    await handleUpdateGuest(editingGuest.id, {
      name: formData.name,
      phone: formData.phone || null,
      eventAccess: formData.eventAccess,
      maxDevicesAllowed: formData.maxDevicesAllowed,
    })
  }

  // Helper function to get event access type from event array
  const getEventAccessType = (events: string[]): 'all-events' | 'reception-only' => {
    if (events.length === 3 && events.includes('mehndi') && events.includes('wedding') && events.includes('reception')) {
      return 'all-events'
    }
    return 'reception-only'
  }

  const handleClearAllDevices = async (guestId: string) => {
    if (!confirm('Are you sure you want to clear all device access? The guest will need to verify their phone again on all devices.')) {
      return
    }

    setError(null)
    try {
      const response = await fetch(`/api/admin/guest/${guestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          allowedDevices: JSON.stringify([]),
        }),
      })

      if (response.ok) {
        setSuccess('All devices cleared successfully!')
        onGuestsChange()
        setTimeout(() => setSuccess(null), 3000)
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to clear devices')
      }
    } catch (err) {
      console.error('Error clearing devices:', err)
      setError('An error occurred. Please try again.')
    }
  }

  const handleExportGuests = () => {
    const csv = [
      ['Name', 'Phone', 'Events', 'Devices', 'Max Devices', 'First Access', 'Created At', 'Invitation Link'].join(','),
      ...filteredGuests.map(guest => [
        `"${guest.name}"`,
        guest.phone || '',
        guest.eventAccess.join('; '),
        guest.allowedDevices.length,
        guest.maxDevicesAllowed,
        guest.tokenUsedFirstTime ? new Date(guest.tokenUsedFirstTime).toLocaleString() : 'Never',
        new Date(guest.createdAt).toLocaleString(),
        `${typeof window !== 'undefined' ? window.location.origin : ''}/invite/${guest.token}`
      ].join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `wedding-guests-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    setSuccess('Guest list exported successfully!')
    setTimeout(() => setSuccess(null), 3000)
  }

  // Filter and search guests
  const filteredGuests = useMemo(() => {
    let filtered = guests

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(guest =>
        guest.name.toLowerCase().includes(query) ||
        guest.phone?.toLowerCase().includes(query) ||
        guest.token.toLowerCase().includes(query)
      )
    }

    // Event filter
    if (filterEvent === 'all-events') {
      filtered = filtered.filter(guest => {
        const events = guest.eventAccess
        return events.includes('mehndi') && events.includes('wedding') && events.includes('reception')
      })
    } else if (filterEvent === 'reception-only') {
      filtered = filtered.filter(guest => {
        const events = guest.eventAccess
        return events.length === 1 && events.includes('reception')
      })
    }

    return filtered
  }, [guests, searchQuery, filterEvent])

  const handleRegenerateToken = async (guestId: string) => {
    if (
      confirm(
        'Are you sure? This will invalidate the current link and reset all device access.'
      )
    ) {
      await handleUpdateGuest(guestId, { regenerateToken: true })
    }
  }

  const handleRemoveDevice = async (guestId: string, device: string) => {
    await handleUpdateGuest(guestId, { removeDevice: device })
  }

  const copyLink = (token: string) => {
    const link = `${window.location.origin}/invite/${token}`
    navigator.clipboard.writeText(link)
    setSuccess('Invitation link copied to clipboard!')
    setTimeout(() => setSuccess(null), 3000)
  }


  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch('/api/admin/guest/import')
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'guest-import-template.xlsx'
      a.click()
      URL.revokeObjectURL(url)
      setSuccess('Template downloaded successfully!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      console.error('Error downloading template:', err)
      setError('Failed to download template')
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (
        file.name.endsWith('.xlsx') ||
        file.name.endsWith('.xls')
      ) {
        setImportFile(file)
        setError(null)
      } else {
        setError('Please select an Excel file (.xlsx or .xls)')
        setImportFile(null)
      }
    }
  }

  const handleImport = async () => {
    if (!importFile) {
      setError('Please select a file')
      return
    }

    setIsImporting(true)
    setError(null)
    setImportResults(null)

    try {
      const formData = new FormData()
      formData.append('file', importFile)

      const response = await fetch('/api/admin/guest/import', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        setImportResults(data)
        setSuccess(
          `Import completed! ${data.summary.successful} guests added, ${data.summary.errors} errors, ${data.summary.skipped} skipped.`
        )
        onGuestsChange()
        setImportFile(null)
        // Reset file input
        const fileInput = document.getElementById('import-file') as HTMLInputElement
        if (fileInput) fileInput.value = ''
        setTimeout(() => {
          setSuccess(null)
          setShowImportModal(false)
          setImportResults(null)
        }, 5000)
      } else {
        setError(data.error || 'Failed to import guests')
      }
    } catch (err) {
      console.error('Error importing guests:', err)
      setError('An error occurred while importing. Please try again.')
    } finally {
      setIsImporting(false)
    }
  }

  if (isLoading) {
    return <div className="text-center py-12">Loading guests...</div>
  }

  return (
    <div>
      {/* Header with Stats */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-serif text-wedding-navy mb-2">
              Guest Management
            </h2>
            <p className="text-sm text-gray-600">
              Total: {guests.length} guests | Showing: {filteredGuests.length}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleDownloadTemplate}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
            >
              📋 Download Template
            </button>
            <button
              onClick={() => setShowImportModal(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base"
            >
              📤 Import Excel
            </button>
            <button
              onClick={handleExportGuests}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm sm:text-base"
            >
              📥 Export CSV
            </button>
            <button
              onClick={() => {
                resetForm()
                setShowCreateForm(true)
              }}
              className="bg-wedding-gold text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors text-sm sm:text-base"
            >
              + Create Guest
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by name, phone, or token..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wedding-gold focus:border-transparent"
            />
          </div>
          <select
            value={filterEvent}
            onChange={(e) => setFilterEvent(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wedding-gold focus:border-transparent"
          >
            <option value="all">All Events</option>
            <option value="mehndi">Mehndi</option>
            <option value="wedding">Wedding</option>
            <option value="reception">Reception</option>
          </select>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
      </div>

      {/* Create/Edit Form */}
      <AnimatePresence>
        {(showCreateForm || editingGuest) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-lg shadow p-6 mb-6"
          >
            <h3 className="text-xl font-serif text-wedding-navy mb-4">
              {editingGuest ? 'Edit Guest' : 'Create New Guest'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="Guest name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone (optional)
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="Phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Access
                </label>
                <div className="space-y-2">
                  <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="eventAccess"
                      value="all-events"
                      checked={formData.eventAccess === 'all-events'}
                      onChange={(e) => setFormData({ ...formData, eventAccess: e.target.value as 'all-events' | 'reception-only' })}
                      className="mr-3"
                    />
                    <div>
                      <span className="font-semibold">All Events</span>
                      <p className="text-xs text-gray-500">Mehndi, Wedding & Reception</p>
                    </div>
                  </label>
                  <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="eventAccess"
                      value="reception-only"
                      checked={formData.eventAccess === 'reception-only'}
                      onChange={(e) => setFormData({ ...formData, eventAccess: e.target.value as 'all-events' | 'reception-only' })}
                      className="mr-3"
                    />
                    <div>
                      <span className="font-semibold">Reception Only</span>
                      <p className="text-xs text-gray-500">Reception event only</p>
                    </div>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Devices Allowed
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.maxDevicesAllowed}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxDevicesAllowed: parseInt(e.target.value) || 1,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="flex gap-4">
                <button
                  onClick={editingGuest ? handleSaveEdit : handleCreateGuest}
                  className="bg-wedding-gold text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
                >
                  {editingGuest ? 'Save Changes' : 'Create'}
                </button>
                <button
                  onClick={resetForm}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Guests List */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                Phone
              </th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                Events
              </th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                Devices
              </th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {guests.map((guest) => {
              const deviceCount = Array.isArray(guest.allowedDevices)
                ? guest.allowedDevices.length
                : 0
              const inviteLink = `${window.location.origin}/invite/${guest.token}`

              return (
                <tr key={guest.id} className="hover:bg-gray-50">
                  <td className="px-3 sm:px-6 py-4 text-xs sm:text-sm font-medium text-gray-900">
                    <div className="font-semibold">{guest.name}</div>
                    <div className="text-gray-500 text-xs sm:hidden mt-1">
                      {guest.phone || 'No phone'}
                    </div>
                    <div className="text-gray-500 text-xs sm:hidden mt-1">
                      {guest.eventAccess.join(', ')}
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 hidden sm:table-cell">
                    {guest.phone || 'Not set'}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 hidden md:table-cell">
                    {guest.eventAccess.join(', ')}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 hidden lg:table-cell">
                    {deviceCount} / {guest.maxDevicesAllowed}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        <button
                          onClick={() => {
                            window.open(`/admin/preview/${guest.token}`, '_blank')
                          }}
                          className="text-purple-600 hover:text-purple-800 text-xs px-2 py-1 border border-purple-200 rounded hover:bg-purple-50"
                          title="Preview Guest View"
                        >
                          👁️ Preview
                        </button>
                        <button
                          onClick={() => setViewingGuest(guest)}
                          className="text-blue-600 hover:text-blue-800 text-xs px-2 py-1 border border-blue-200 rounded hover:bg-blue-50"
                          title="View Details"
                        >
                          📋 Details
                        </button>
                        <button
                          onClick={() => handleEditClick(guest)}
                          className="text-green-600 hover:text-green-800 text-xs px-2 py-1 border border-green-200 rounded hover:bg-green-50"
                          title="Edit Guest"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => copyLink(guest.token)}
                          className="text-wedding-gold hover:text-wedding-navy text-xs px-2 py-1 border border-wedding-gold rounded hover:bg-wedding-gold-light/10"
                          title="Copy Link"
                        >
                          📋 Copy
                        </button>
                        <button
                          onClick={() => handleRegenerateToken(guest.id)}
                          className="text-orange-600 hover:text-orange-800 text-xs px-2 py-1 border border-orange-200 rounded hover:bg-orange-50"
                          title="Regenerate Token"
                        >
                          🔄 Reset
                        </button>
                        <button
                          onClick={() => handleDeleteGuest(guest.id, guest.name)}
                          className="text-red-600 hover:text-red-800 text-xs px-2 py-1 border border-red-200 rounded hover:bg-red-50"
                          title="Delete Guest"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                      <div className="mt-1">
                        <WhatsAppShare
                          guestName={guest.name}
                          guestToken={guest.token}
                          guestPhone={guest.phone}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filteredGuests.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            {searchQuery || filterEvent !== 'all' 
              ? 'No guests found matching your search criteria.'
              : 'No guests yet. Create your first guest to get started!'}
          </div>
        )}
      </div>

      {/* View Guest Details Modal */}
      <AnimatePresence>
        {viewingGuest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setViewingGuest(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-serif text-wedding-navy">
                  Guest Details
                </h3>
                <button
                  onClick={() => setViewingGuest(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <p className="text-lg font-semibold text-wedding-navy">
                    {viewingGuest.name}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <p className="text-gray-900">
                    {viewingGuest.phone || 'Not set'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Access
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {viewingGuest.eventAccess.map((event) => (
                      <span
                        key={event}
                        className="px-3 py-1 bg-wedding-gold-light/20 text-wedding-navy rounded-full text-sm capitalize"
                      >
                        {event}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Device Access
                  </label>
                  <p className="text-gray-900">
                    {viewingGuest.allowedDevices.length} / {viewingGuest.maxDevicesAllowed} devices
                  </p>
                  {viewingGuest.allowedDevices.length > 0 && (
                    <button
                      onClick={() => {
                        handleClearAllDevices(viewingGuest.id)
                        setViewingGuest(null)
                      }}
                      className="mt-2 text-sm text-red-600 hover:text-red-800"
                    >
                      Clear all devices
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Invitation Token
                  </label>
                  <div className="flex gap-2">
                    <code className="flex-1 px-3 py-2 bg-gray-100 rounded text-sm break-all">
                      {viewingGuest.token}
                    </code>
                    <button
                      onClick={() => copyLink(viewingGuest.token)}
                      className="px-3 py-2 bg-wedding-gold text-white rounded hover:bg-opacity-90"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Invitation Link
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={`${typeof window !== 'undefined' ? window.location.origin : ''}/invite/${viewingGuest.token}`}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                    />
                    <button
                      onClick={() => copyLink(viewingGuest.token)}
                      className="px-3 py-2 bg-wedding-gold text-white rounded hover:bg-opacity-90"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Access
                  </label>
                  <p className="text-gray-900">
                    {viewingGuest.tokenUsedFirstTime
                      ? new Date(viewingGuest.tokenUsedFirstTime).toLocaleString()
                      : 'Not accessed yet'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Created At
                  </label>
                  <p className="text-gray-900">
                    {new Date(viewingGuest.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                  <button
                    onClick={() => {
                      window.open(`/admin/preview/${viewingGuest.token}`, '_blank')
                    }}
                    className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    👁️ Preview Guest View
                  </button>
                  <button
                    onClick={() => {
                      handleEditClick(viewingGuest)
                      setViewingGuest(null)
                    }}
                    className="flex-1 bg-wedding-gold text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
                  >
                    Edit Guest
                  </button>
                  <button
                    onClick={() => {
                      setViewingGuest(null)
                      handleDeleteGuest(viewingGuest.id, viewingGuest.name)
                    }}
                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Delete Guest
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Import Modal */}
      <AnimatePresence>
        {showImportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => !isImporting && setShowImportModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-serif text-wedding-navy">
                    Import Guests from Excel
                  </h3>
                  <button
                    onClick={() => {
                      setShowImportModal(false)
                      setImportFile(null)
                      setImportResults(null)
                      setError(null)
                    }}
                    disabled={isImporting}
                    className="text-gray-500 hover:text-gray-700 text-2xl disabled:opacity-50"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-blue-900 mb-2">Excel Format:</h4>
                    <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                      <li><strong>Column A:</strong> Name (required)</li>
                      <li><strong>Column B:</strong> Phone (optional)</li>
                      <li><strong>Column C:</strong> Event Access (required: "all-events" or "reception-only")</li>
                      <li><strong>Column D:</strong> Max Devices Allowed (optional, default: 1)</li>
                    </ul>
                    <button
                      onClick={handleDownloadTemplate}
                      className="mt-3 text-blue-600 hover:text-blue-800 underline text-sm"
                    >
                      Download Template File
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Excel File (.xlsx or .xls)
                    </label>
                    <input
                      id="import-file"
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleFileSelect}
                      disabled={isImporting}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
                    />
                    {importFile && (
                      <p className="mt-2 text-sm text-gray-600">
                        Selected: {importFile.name} ({(importFile.size / 1024).toFixed(2)} KB)
                      </p>
                    )}
                  </div>

                  {importResults && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold mb-2">Import Results:</h4>
                      <div className="text-sm space-y-1">
                        <p>✅ Successful: {importResults.summary.successful}</p>
                        <p>❌ Errors: {importResults.summary.errors}</p>
                        <p>⏭️ Skipped: {importResults.summary.skipped}</p>
                      </div>
                      {importResults.results.errors.length > 0 && (
                        <div className="mt-3">
                          <p className="font-semibold text-red-700 mb-1">Errors:</p>
                          <div className="max-h-32 overflow-y-auto text-xs">
                            {importResults.results.errors.map((err: any, idx: number) => (
                              <p key={idx} className="text-red-600">
                                Row {err.row} ({err.name}): {err.error}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleImport}
                      disabled={!importFile || isImporting}
                      className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isImporting ? 'Importing...' : 'Import Guests'}
                    </button>
                    <button
                      onClick={() => {
                        setShowImportModal(false)
                        setImportFile(null)
                        setImportResults(null)
                        setError(null)
                      }}
                      disabled={isImporting}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

