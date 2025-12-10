'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import WhatsAppShare from './WhatsAppShare'
import EventTypeBadge from './EventTypeBadge'

interface Guest {
  id: string
  name: string
  phone: string | null
  token: string
  eventAccess: string[]
  allowedDevices: string[]
  tokenUsedFirstTime: string | null
  maxDevicesAllowed: number
  numberOfAttendees: number
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
  const [selectedGuests, setSelectedGuests] = useState<Set<string>>(new Set())
  const [quickAddMode, setQuickAddMode] = useState(false)
  const [lastEventAccess, setLastEventAccess] = useState<'all-events' | 'reception-only'>('all-events')
  const [filterHasAccessed, setFilterHasAccessed] = useState<string>('all')
  const [inlineEditing, setInlineEditing] = useState<{ id: string; field: 'name' | 'phone' } | null>(null)
  const [inlineEditValue, setInlineEditValue] = useState('')
  const nameInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState<{
    name: string
    phone: string
    eventAccess: 'all-events' | 'reception-only'
    maxDevicesAllowed: number | ''
    numberOfAttendees: number | ''
  }>({
    name: '',
    phone: '',
    eventAccess: 'all-events',
    maxDevicesAllowed: '',
    numberOfAttendees: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showImportModal, setShowImportModal] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [importResults, setImportResults] = useState<any>(null)
  const [deviceManagementGuest, setDeviceManagementGuest] = useState<Guest | null>(null)
  const [newMaxDevices, setNewMaxDevices] = useState<number | ''>('')

  // Initialize form with last used event access
  useEffect(() => {
    if (lastEventAccess) {
      setFormData(prev => ({ ...prev, eventAccess: lastEventAccess }))
    }
  }, [lastEventAccess])

  const handleCreateGuest = async () => {
    if (!formData.name.trim()) {
      setError('Name is required')
      return
    }
    if (!formData.phone.trim()) {
      setError('Phone number is required')
      return
    }

    setError(null)
    try {
      const response = await fetch('/api/admin/guest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          eventAccess: formData.eventAccess,
          maxDevicesAllowed: formData.maxDevicesAllowed || 1,
          numberOfAttendees: formData.numberOfAttendees || 1,
        }),
      })

      if (response.ok) {
        setSuccess('Guest created successfully!')
        onGuestsChange()
        if (!quickAddMode) {
          setShowCreateForm(false)
        }
        // Keep form open in quick-add mode, clear name and phone, keep event access
        setFormData({
          name: '',
          phone: '',
          eventAccess: formData.eventAccess, // Keep last used
          maxDevicesAllowed: '',
          numberOfAttendees: '',
        })
        setLastEventAccess(formData.eventAccess)
        // Auto-focus name field in quick-add mode
        if (quickAddMode && nameInputRef.current) {
          setTimeout(() => nameInputRef.current?.focus(), 100)
        }
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
      maxDevicesAllowed: guest.maxDevicesAllowed || '',
      numberOfAttendees: guest.numberOfAttendees || '',
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
    if (!formData.phone.trim()) {
      setError('Phone number is required')
      return
    }

    await handleUpdateGuest(editingGuest.id, {
      name: formData.name,
      phone: formData.phone,
      eventAccess: formData.eventAccess,
      maxDevicesAllowed: formData.maxDevicesAllowed || 1,
      numberOfAttendees: formData.numberOfAttendees || 1,
    })
  }

  // Helper function to get event access type from event array
  const getEventAccessType = (events: string[]): 'all-events' | 'reception-only' => {
    if (events.length === 3 && events.includes('mehndi') && events.includes('wedding') && events.includes('reception')) {
      return 'all-events'
    }
    return 'reception-only'
  }

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      eventAccess: lastEventAccess || 'all-events',
      maxDevicesAllowed: '',
      numberOfAttendees: '',
    })
    setEditingGuest(null)
    setShowCreateForm(false)
    setQuickAddMode(false)
    setError(null)
  }

  const handleQuickToggleEventType = async (guestId: string, currentEventAccess: string[]) => {
    const currentType = getEventAccessType(currentEventAccess)
    const newType = currentType === 'all-events' ? 'reception-only' : 'all-events'
    await handleUpdateGuest(guestId, { eventAccess: newType })
  }

  const handleBulkChangeEventAccess = async (newType: 'all-events' | 'reception-only') => {
    if (selectedGuests.size === 0) {
      setError('Please select at least one guest')
      return
    }
    if (!confirm(`Change event access to "${newType === 'all-events' ? 'All Events' : 'Reception Only'}" for ${selectedGuests.size} guest(s)?`)) {
      return
    }

    setError(null)
    try {
      const promises = Array.from(selectedGuests).map(guestId =>
        fetch(`/api/admin/guest/${guestId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ eventAccess: newType }),
        })
      )

      const results = await Promise.all(promises)
      const failed = results.filter(r => !r.ok).length

      if (failed === 0) {
        setSuccess(`Successfully updated ${selectedGuests.size} guest(s)!`)
        setSelectedGuests(new Set())
        onGuestsChange()
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError(`Failed to update ${failed} guest(s)`)
      }
    } catch (err) {
      console.error('Error bulk updating:', err)
      setError('An error occurred during bulk update')
    }
  }

  const handleBulkDelete = async () => {
    if (selectedGuests.size === 0) {
      setError('Please select at least one guest')
      return
    }
    if (!confirm(`Are you sure you want to delete ${selectedGuests.size} guest(s)? This action cannot be undone.`)) {
      return
    }

    setError(null)
    try {
      const promises = Array.from(selectedGuests).map(guestId =>
        fetch(`/api/admin/guest/${guestId}`, { method: 'DELETE' })
      )

      const results = await Promise.all(promises)
      const failed = results.filter(r => !r.ok).length

      if (failed === 0) {
        setSuccess(`Successfully deleted ${selectedGuests.size} guest(s)!`)
        setSelectedGuests(new Set())
        onGuestsChange()
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError(`Failed to delete ${failed} guest(s)`)
      }
    } catch (err) {
      console.error('Error bulk deleting:', err)
      setError('An error occurred during bulk delete')
    }
  }

  const handleBulkExport = () => {
    if (selectedGuests.size === 0) {
      setError('Please select at least one guest')
      return
    }

    const selectedGuestList = guests.filter(g => selectedGuests.has(g.id))
    const csv = [
      ['Name', 'Phone', 'Events', 'Devices', 'Max Devices', 'Number of Attendees', 'First Access', 'Created At', 'Invitation Link'].join(','),
      ...selectedGuestList.map(guest => [
        `"${guest.name}"`,
        guest.phone || '',
        guest.eventAccess.join('; '),
        guest.allowedDevices.length,
        guest.maxDevicesAllowed,
        guest.numberOfAttendees || 1,
        guest.tokenUsedFirstTime ? new Date(guest.tokenUsedFirstTime).toLocaleString() : 'Never',
        new Date(guest.createdAt).toLocaleString(),
        `${typeof window !== 'undefined' ? window.location.origin : ''}/invite/${guest.token}`
      ].join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `wedding-guests-selected-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    setSuccess(`Exported ${selectedGuests.size} guest(s) successfully!`)
    setTimeout(() => setSuccess(null), 3000)
  }

  const toggleSelectGuest = (guestId: string) => {
    const newSelected = new Set(selectedGuests)
    if (newSelected.has(guestId)) {
      newSelected.delete(guestId)
    } else {
      newSelected.add(guestId)
    }
    setSelectedGuests(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedGuests.size === filteredGuests.length) {
      setSelectedGuests(new Set())
    } else {
      setSelectedGuests(new Set(filteredGuests.map(g => g.id)))
    }
  }

  const handleInlineEdit = (guest: Guest, field: 'name' | 'phone') => {
    setInlineEditing({ id: guest.id, field })
    setInlineEditValue(field === 'name' ? guest.name : (guest.phone || ''))
  }

  const handleInlineSave = async () => {
    if (!inlineEditing) return

    const updates: any = {}
    if (inlineEditing.field === 'name') {
      if (!inlineEditValue.trim()) {
        setError('Name cannot be empty')
        return
      }
      updates.name = inlineEditValue.trim()
    } else {
      updates.phone = inlineEditValue.trim() || null
    }

    await handleUpdateGuest(inlineEditing.id, updates)
    setInlineEditing(null)
    setInlineEditValue('')
  }

  const handleInlineCancel = () => {
    setInlineEditing(null)
    setInlineEditValue('')
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
        if (deviceManagementGuest?.id === guestId) {
          setDeviceManagementGuest(null)
        }
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to clear devices')
      }
    } catch (err) {
      console.error('Error clearing devices:', err)
      setError('An error occurred. Please try again.')
    }
  }

  const handleUpdateMaxDevices = async (guestId: string, maxDevices: number) => {
    if (maxDevices < 1 || maxDevices > 10) {
      setError('Max devices must be between 1 and 10')
      return
    }

    setError(null)
    try {
      const response = await fetch(`/api/admin/guest/${guestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          maxDevicesAllowed: maxDevices,
        }),
      })

      if (response.ok) {
        setSuccess('Max devices updated successfully!')
        onGuestsChange()
        setTimeout(() => setSuccess(null), 3000)
        setDeviceManagementGuest(null)
        setNewMaxDevices('')
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to update max devices')
      }
    } catch (err) {
      console.error('Error updating max devices:', err)
      setError('An error occurred. Please try again.')
    }
  }

  const handleDeviceCountClick = (guest: Guest) => {
    setDeviceManagementGuest(guest)
    setNewMaxDevices(guest.maxDevicesAllowed)
  }

  const handleExportGuests = () => {
    const guestsToExport = selectedGuests.size > 0 
      ? guests.filter(g => selectedGuests.has(g.id))
      : filteredGuests
    const csv = [
      ['Name', 'Phone', 'Events', 'Devices', 'Max Devices', 'Number of Attendees', 'First Access', 'Created At', 'Invitation Link'].join(','),
      ...guestsToExport.map(guest => [
        `"${guest.name}"`,
        guest.phone || '',
        guest.eventAccess.join('; '),
        guest.allowedDevices.length,
        guest.maxDevicesAllowed,
        guest.numberOfAttendees || 1,
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

  // Calculate stats
  const stats = useMemo(() => {
    const allEventsCount = guests.filter(g => {
      const events = g.eventAccess
      return events.includes('mehndi') && events.includes('wedding') && events.includes('reception')
    }).length
    const receptionOnlyCount = guests.filter(g => {
      const events = g.eventAccess
      return events.length === 1 && events.includes('reception')
    }).length
    const totalAttendees = guests.reduce((sum, guest) => sum + (guest.numberOfAttendees || 1), 0)
    const notAccessedCount = guests.filter(g => !g.tokenUsedFirstTime).length

    return {
      total: guests.length,
      allEvents: allEventsCount,
      receptionOnly: receptionOnlyCount,
      totalAttendees,
      notAccessed: notAccessedCount,
    }
  }, [guests])

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

    // Access filter
    if (filterHasAccessed === 'accessed') {
      filtered = filtered.filter(guest => guest.tokenUsedFirstTime !== null)
    } else if (filterHasAccessed === 'not-accessed') {
      filtered = filtered.filter(guest => guest.tokenUsedFirstTime === null)
    }

    return filtered
  }, [guests, searchQuery, filterEvent, filterHasAccessed])

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
      {/* Quick Stats Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <div className="text-2xl font-bold text-wedding-navy">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Guests</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <div className="text-2xl font-bold text-wedding-gold">{stats.allEvents}</div>
          <div className="text-sm text-gray-600">All Events</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <div className="text-2xl font-bold text-wedding-rose">{stats.receptionOnly}</div>
          <div className="text-sm text-gray-600">Reception Only</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <div className="text-2xl font-bold text-wedding-navy">{stats.totalAttendees}</div>
          <div className="text-sm text-gray-600">Total Attendees</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <div className="text-2xl font-bold text-orange-600">{stats.notAccessed}</div>
          <div className="text-sm text-gray-600">Not Accessed</div>
        </div>
      </div>

      {/* Header with Actions */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-serif text-wedding-navy mb-2">
              Guest Management
            </h2>
            <p className="text-sm text-gray-600">
              Showing: {filteredGuests.length} of {guests.length} guests
              {selectedGuests.size > 0 && ` | ${selectedGuests.size} selected`}
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
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  resetForm()
                  setFormData(prev => ({ ...prev, eventAccess: 'all-events' }))
                  setShowCreateForm(true)
                  setQuickAddMode(false)
                }}
                className="bg-wedding-gold text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors text-sm sm:text-base"
              >
                + Add All Events Guest
              </button>
              <button
                onClick={() => {
                  resetForm()
                  setFormData(prev => ({ ...prev, eventAccess: 'reception-only' }))
                  setShowCreateForm(true)
                  setQuickAddMode(false)
                }}
                className="bg-wedding-rose text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors text-sm sm:text-base"
              >
                + Add Reception Guest
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {selectedGuests.size > 0 && (
          <div className="bg-wedding-gold-light/20 border border-wedding-gold/30 rounded-lg p-4 mb-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-semibold text-wedding-navy">
                {selectedGuests.size} guest(s) selected
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleBulkChangeEventAccess('all-events')}
                  className="bg-wedding-gold text-white px-3 py-1.5 rounded text-sm hover:bg-opacity-90"
                >
                  Set All Events
                </button>
                <button
                  onClick={() => handleBulkChangeEventAccess('reception-only')}
                  className="bg-wedding-rose text-white px-3 py-1.5 rounded text-sm hover:bg-opacity-90"
                >
                  Set Reception Only
                </button>
                <button
                  onClick={handleBulkExport}
                  className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700"
                >
                  Export Selected
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="bg-red-600 text-white px-3 py-1.5 rounded text-sm hover:bg-red-700"
                >
                  Delete Selected
                </button>
                <button
                  onClick={() => setSelectedGuests(new Set())}
                  className="bg-gray-300 text-gray-800 px-3 py-1.5 rounded text-sm hover:bg-gray-400"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="space-y-3 mb-4">
          <div className="flex flex-col sm:flex-row gap-3">
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
              <option value="all">All Guests</option>
              <option value="all-events">All Events</option>
              <option value="reception-only">Reception Only</option>
            </select>
            <select
              value={filterHasAccessed}
              onChange={(e) => setFilterHasAccessed(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wedding-gold focus:border-transparent"
            >
              <option value="all">All Access</option>
              <option value="accessed">Has Accessed</option>
              <option value="not-accessed">Not Accessed</option>
            </select>
          </div>
          {/* Active Filter Chips */}
          {(filterEvent !== 'all' || filterHasAccessed !== 'all' || searchQuery) && (
            <div className="flex flex-wrap gap-2">
              {filterEvent !== 'all' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-wedding-gold/20 text-wedding-navy">
                  Event: {filterEvent === 'all-events' ? 'All Events' : 'Reception Only'}
                  <button onClick={() => setFilterEvent('all')} className="ml-2 hover:text-red-600">×</button>
                </span>
              )}
              {filterHasAccessed !== 'all' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                  Access: {filterHasAccessed === 'accessed' ? 'Has Accessed' : 'Not Accessed'}
                  <button onClick={() => setFilterHasAccessed('all')} className="ml-2 hover:text-red-600">×</button>
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800">
                  Search: &quot;{searchQuery}&quot;
                  <button onClick={() => setSearchQuery('')} className="ml-2 hover:text-red-600">×</button>
                </span>
              )}
            </div>
          )}
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
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-serif text-wedding-navy">
                {editingGuest ? 'Edit Guest' : 'Create New Guest'}
              </h3>
              {!editingGuest && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={quickAddMode}
                    onChange={(e) => setQuickAddMode(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-600">Quick Add Mode</span>
                </label>
              )}
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  ref={nameInputRef}
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="Guest name"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="Phone number"
                  required
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
                  value={formData.maxDevicesAllowed === '' ? '' : formData.maxDevicesAllowed}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxDevicesAllowed: e.target.value === '' ? '' : (parseInt(e.target.value) || ''),
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Attendees
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.numberOfAttendees === '' ? '' : formData.numberOfAttendees}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      numberOfAttendees: e.target.value === '' ? '' : (parseInt(e.target.value) || ''),
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="1"
                />
                <p className="text-xs text-gray-500 mt-1">Total number of people attending (including the guest)</p>
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
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                <input
                  type="checkbox"
                  checked={selectedGuests.size === filteredGuests.length && filteredGuests.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded"
                />
              </th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                Phone
              </th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Event Type
              </th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Devices
              </th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Attendees
              </th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredGuests.map((guest) => {
              const deviceCount = Array.isArray(guest.allowedDevices)
                ? guest.allowedDevices.length
                : 0
              const inviteLink = `${window.location.origin}/invite/${guest.token}`

              const isSelected = selectedGuests.has(guest.id)
              const isEditingName = inlineEditing?.id === guest.id && inlineEditing.field === 'name'
              const isEditingPhone = inlineEditing?.id === guest.id && inlineEditing.field === 'phone'

              return (
                <tr key={guest.id} className={`hover:bg-gray-50 ${isSelected ? 'bg-wedding-gold-light/10' : ''}`}>
                  <td className="px-3 sm:px-6 py-4">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectGuest(guest.id)}
                      className="rounded"
                    />
                  </td>
                  <td className="px-3 sm:px-6 py-4 text-xs sm:text-sm font-medium text-gray-900">
                    {isEditingName ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={inlineEditValue}
                          onChange={(e) => setInlineEditValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleInlineSave()
                            if (e.key === 'Escape') handleInlineCancel()
                          }}
                          className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                          autoFocus
                        />
                        <button onClick={handleInlineSave} className="text-green-600 hover:text-green-800">✓</button>
                        <button onClick={handleInlineCancel} className="text-red-600 hover:text-red-800">×</button>
                      </div>
                    ) : (
                      <div 
                        className="font-semibold cursor-pointer hover:text-wedding-gold"
                        onDoubleClick={() => handleInlineEdit(guest, 'name')}
                        title="Double-click to edit"
                      >
                        {guest.name}
                      </div>
                    )}
                    <div className="text-gray-500 text-xs sm:hidden mt-1">
                      {guest.phone || 'No phone'}
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 hidden sm:table-cell">
                    {isEditingPhone ? (
                      <div className="flex gap-2">
                        <input
                          type="tel"
                          value={inlineEditValue}
                          onChange={(e) => setInlineEditValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleInlineSave()
                            if (e.key === 'Escape') handleInlineCancel()
                          }}
                          className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                          autoFocus
                        />
                        <button onClick={handleInlineSave} className="text-green-600 hover:text-green-800">✓</button>
                        <button onClick={handleInlineCancel} className="text-red-600 hover:text-red-800">×</button>
                      </div>
                    ) : (
                      <span 
                        className="cursor-pointer hover:text-wedding-gold"
                        onDoubleClick={() => handleInlineEdit(guest, 'phone')}
                        title="Double-click to edit"
                      >
                        {guest.phone || 'Not set'}
                      </span>
                    )}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <EventTypeBadge eventAccess={guest.eventAccess} size="sm" />
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                    <button
                      onClick={() => handleDeviceCountClick(guest)}
                      className="cursor-pointer hover:text-wedding-gold hover:underline transition-colors"
                      title="Click to manage devices"
                    >
                      {deviceCount} / {guest.maxDevicesAllowed}
                    </button>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                    {guest.numberOfAttendees || 1}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        <button
                          onClick={() => copyLink(guest.token)}
                          className="text-wedding-gold hover:text-wedding-navy text-xs px-2 py-1 border border-wedding-gold rounded hover:bg-wedding-gold-light/10"
                          title="Copy Link"
                        >
                          📋
                        </button>
                        <button
                          onClick={() => handleQuickToggleEventType(guest.id, guest.eventAccess)}
                          className="text-blue-600 hover:text-blue-800 text-xs px-2 py-1 border border-blue-200 rounded hover:bg-blue-50"
                          title="Toggle Event Type"
                        >
                          🔄
                        </button>
                        <button
                          onClick={() => {
                            window.open(`/admin/preview/${guest.token}`, '_blank')
                          }}
                          className="text-purple-600 hover:text-purple-800 text-xs px-2 py-1 border border-purple-200 rounded hover:bg-purple-50"
                          title="Preview"
                        >
                          👁️
                        </button>
                        <button
                          onClick={() => handleEditClick(guest)}
                          className="text-green-600 hover:text-green-800 text-xs px-2 py-1 border border-green-200 rounded hover:bg-green-50"
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteGuest(guest.id, guest.name)}
                          className="text-red-600 hover:text-red-800 text-xs px-2 py-1 border border-red-200 rounded hover:bg-red-50"
                          title="Delete"
                        >
                          🗑️
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
            {searchQuery || filterEvent !== 'all' || filterHasAccessed !== 'all'
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
                  <EventTypeBadge eventAccess={viewingGuest.eventAccess} size="md" />
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
                    Number of Attendees
                  </label>
                  <p className="text-gray-900">
                    {viewingGuest.numberOfAttendees || 1}
                  </p>
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
                      <li><strong>Column B:</strong> Phone (required)</li>
                      <li><strong>Column C:</strong> Event Access (required: &quot;all-events&quot; or &quot;reception-only&quot;)</li>
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

      {/* Device Management Modal */}
      <AnimatePresence>
        {deviceManagementGuest && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-50"
              onClick={() => {
                setDeviceManagementGuest(null)
                setNewMaxDevices('')
              }}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-serif text-wedding-navy">
                    Device Management
                  </h3>
                  <button
                    onClick={() => {
                      setDeviceManagementGuest(null)
                      setNewMaxDevices('')
                    }}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Guest Name
                    </label>
                    <p className="text-lg font-semibold text-wedding-navy">
                      {deviceManagementGuest.name}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Device Status
                    </label>
                    <p className="text-gray-900">
                      <span className="font-semibold">
                        {Array.isArray(deviceManagementGuest.allowedDevices)
                          ? deviceManagementGuest.allowedDevices.length
                          : 0}
                      </span>{' '}
                      / {deviceManagementGuest.maxDevicesAllowed} devices registered
                    </p>
                    {Array.isArray(deviceManagementGuest.allowedDevices) &&
                      deviceManagementGuest.allowedDevices.length > 0 && (
                        <p className="text-sm text-gray-500 mt-1">
                          Guest will need to verify phone again on all devices after reset.
                        </p>
                      )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Devices Allowed
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={newMaxDevices}
                        onChange={(e) => {
                          const val = e.target.value
                          if (val === '' || (parseInt(val) >= 1 && parseInt(val) <= 10)) {
                            setNewMaxDevices(val === '' ? '' : parseInt(val))
                          }
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="1-10"
                      />
                      <button
                        onClick={() => {
                          if (newMaxDevices !== '' && newMaxDevices !== deviceManagementGuest.maxDevicesAllowed) {
                            handleUpdateMaxDevices(deviceManagementGuest.id, newMaxDevices as number)
                          }
                        }}
                        disabled={
                          newMaxDevices === '' ||
                          newMaxDevices === deviceManagementGuest.maxDevicesAllowed ||
                          newMaxDevices < 1 ||
                          newMaxDevices > 10
                        }
                        className="px-4 py-2 bg-wedding-gold text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold"
                      >
                        Update
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Current: {deviceManagementGuest.maxDevicesAllowed} | Range: 1-10
                    </p>
                  </div>

                  <div className="border-t pt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Device Actions
                    </label>
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          if (deviceManagementGuest) {
                            handleClearAllDevices(deviceManagementGuest.id)
                          }
                        }}
                        disabled={
                          !Array.isArray(deviceManagementGuest.allowedDevices) ||
                          deviceManagementGuest.allowedDevices.length === 0
                        }
                        className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold transition-colors"
                      >
                        Reset All Devices
                      </button>
                      <p className="text-xs text-gray-500">
                        Clears all registered devices. Guest will need to verify phone again on next access.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

