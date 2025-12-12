'use client'

import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import WhatsAppShare from './WhatsAppShare'
import EventTypeBadge from './EventTypeBadge'

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
  rsvpSubmitted?: boolean
  rsvpStatus?: Record<string, 'yes' | 'no' | 'pending'> | null
  rsvpSubmittedAt?: string | null
  preferencesSubmitted?: boolean
  menuPreference?: string | null
  dietaryRestrictions?: string | null
  additionalInfo?: string | null
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
  const [filterRsvp, setFilterRsvp] = useState<string>('all')
  const [selectedGuests, setSelectedGuests] = useState<Set<string>>(new Set())
  const [quickAddMode, setQuickAddMode] = useState(false)
  const [lastEventAccess, setLastEventAccess] = useState<'all-events' | 'reception-only'>('all-events')
  const [hideEventAccess, setHideEventAccess] = useState(false)
  const [inlineEditing, setInlineEditing] = useState<{ id: string; field: 'name' | 'phone' } | null>(null)
  const [inlineEditValue, setInlineEditValue] = useState('')
  const nameInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState<{
    name: string
    phone: string
    email: string
    eventAccess: 'all-events' | 'reception-only'
    maxDevicesAllowed: number | ''
    numberOfAttendees: number | ''
  }>({
    name: '',
    phone: '',
    email: '',
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

  // Helper function to safely parse JSON string or return the value as-is
  const safeParseJson = <T,>(value: string | T | null | undefined, fallback: T): T => {
    if (!value) return fallback
    if (typeof value === 'string') {
      try {
        return JSON.parse(value) as T
      } catch {
        return fallback
      }
    }
    return value as T
  }

  // Normalize guest data to ensure consistent structure
  const normalizedGuests = useMemo(() => {
    return guests.map(guest => ({
      ...guest,
      eventAccess: Array.isArray(guest.eventAccess) 
        ? guest.eventAccess 
        : safeParseJson<string[]>(guest.eventAccess as any, []),
      rsvpStatus: guest.rsvpStatus && typeof guest.rsvpStatus === 'object' && !Array.isArray(guest.rsvpStatus)
        ? guest.rsvpStatus
        : safeParseJson<Record<string, 'yes' | 'no' | 'pending'>>(guest.rsvpStatus as any, {})
    }))
  }, [guests])

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
    if (!formData.phone.trim() && !formData.email.trim()) {
      setError('Phone number or email is required')
      return
    }

    setError(null)
    try {
      const response = await fetch('/api/admin/guest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone.trim() || undefined,
          email: formData.email.trim() || undefined,
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
        // Keep form open in quick-add mode, clear name, phone, and email, keep event access
        setFormData({
          name: '',
          phone: '',
          email: '',
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
      email: guest.email || '',
      eventAccess: getEventAccessType(guest.eventAccess),
      maxDevicesAllowed: guest.maxDevicesAllowed || '',
      numberOfAttendees: guest.numberOfAttendees || '',
    })
    setShowCreateForm(false)
    setHideEventAccess(false)
    setError(null)
  }

  const handleSaveEdit = async () => {
    if (!editingGuest) return
    if (!formData.name.trim()) {
      setError('Name is required')
      return
    }
    if (!formData.phone.trim() && !formData.email.trim()) {
      setError('Phone number or email is required')
      return
    }

    await handleUpdateGuest(editingGuest.id, {
      name: formData.name,
      phone: formData.phone.trim() || null,
      email: formData.email.trim() || null,
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
      email: '',
      eventAccess: lastEventAccess || 'all-events',
      maxDevicesAllowed: '',
      numberOfAttendees: '',
    })
    setEditingGuest(null)
    setShowCreateForm(false)
    setQuickAddMode(false)
    setHideEventAccess(false)
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

    const selectedGuestList = normalizedGuests.filter(g => selectedGuests.has(g.id))
    const eventNames: Record<string, string> = {
      mehndi: 'Mehndi',
      wedding: 'Wedding',
      reception: 'Reception',
    }
    
    const csv = [
      ['Name', 'Phone', 'Events', 'RSVP Status', 'Mehndi RSVP', 'Wedding RSVP', 'Reception RSVP', 'Menu Preference', 'Dietary Restrictions', 'Additional Info', 'RSVP Submitted At', 'Devices', 'Max Devices', 'Number of Attendees', 'First Access', 'Created At', 'Invitation Link'].join(','),
      ...selectedGuestList.map(guest => {
        const rsvpStatus = guest.rsvpStatus || {}
        const overallStatus = getOverallRsvpStatus(guest)
        const rsvpStatusLabels: Record<string, string> = {
          'attending': 'Attending',
          'not-attending': 'Not Attending',
          'pending': 'Pending',
          'not-submitted': 'Not Submitted',
        }
        
        return [
          `"${guest.name}"`,
          guest.phone || '',
          guest.eventAccess.join('; '),
          rsvpStatusLabels[overallStatus] || 'Not Submitted',
          rsvpStatus.mehndi ? (rsvpStatus.mehndi === 'yes' ? 'Attending' : rsvpStatus.mehndi === 'no' ? 'Not Attending' : 'Pending') : (guest.eventAccess.includes('mehndi') ? 'Not Submitted' : 'N/A'),
          rsvpStatus.wedding ? (rsvpStatus.wedding === 'yes' ? 'Attending' : rsvpStatus.wedding === 'no' ? 'Not Attending' : 'Pending') : (guest.eventAccess.includes('wedding') ? 'Not Submitted' : 'N/A'),
          rsvpStatus.reception ? (rsvpStatus.reception === 'yes' ? 'Attending' : rsvpStatus.reception === 'no' ? 'Not Attending' : 'Pending') : (guest.eventAccess.includes('reception') ? 'Not Submitted' : 'N/A'),
          guest.menuPreference ? (guest.menuPreference === 'veg' ? 'Vegetarian' : guest.menuPreference === 'non-veg' ? 'Non-Vegetarian' : 'Both') : '',
          guest.dietaryRestrictions ? `"${guest.dietaryRestrictions.replace(/"/g, '""')}"` : '',
          guest.additionalInfo ? `"${guest.additionalInfo.replace(/"/g, '""')}"` : '',
          guest.rsvpSubmittedAt ? new Date(guest.rsvpSubmittedAt).toLocaleString() : '',
          guest.allowedDevices.length,
          guest.maxDevicesAllowed,
          guest.numberOfAttendees || 1,
          guest.tokenUsedFirstTime ? new Date(guest.tokenUsedFirstTime).toLocaleString() : 'Never',
          new Date(guest.createdAt).toLocaleString(),
          `${typeof window !== 'undefined' ? window.location.origin : ''}/invite/${guest.token}`
        ].join(',')
      })
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

  // Helper function to get overall RSVP status
  const getOverallRsvpStatus = useCallback((guest: Guest): 'attending' | 'not-attending' | 'pending' | 'not-submitted' => {
    if (!guest.rsvpSubmitted || !guest.rsvpStatus) return 'not-submitted'
    
    // Ensure rsvpStatus is an object
    const rsvpStatus = typeof guest.rsvpStatus === 'object' && !Array.isArray(guest.rsvpStatus)
      ? guest.rsvpStatus
      : safeParseJson<Record<string, 'yes' | 'no' | 'pending'>>(guest.rsvpStatus as any, {})
    
    // Ensure eventAccess is an array
    const eventAccess = Array.isArray(guest.eventAccess) 
      ? guest.eventAccess 
      : safeParseJson<string[]>(guest.eventAccess as any, [])
    
    // Check if attending any event
    const hasAttending = eventAccess.some(event => rsvpStatus[event] === 'yes')
    const hasNotAttending = eventAccess.some(event => rsvpStatus[event] === 'no')
    const hasPending = eventAccess.some(event => rsvpStatus[event] === 'pending')
    
    if (hasAttending) return 'attending'
    if (hasNotAttending && !hasAttending && !hasPending) return 'not-attending'
    if (hasPending) return 'pending'
    return 'not-submitted'
  }, [])

  const handleExportGuests = () => {
    const guestsToExport = selectedGuests.size > 0 
      ? normalizedGuests.filter(g => selectedGuests.has(g.id))
      : filteredGuests
    const eventNames: Record<string, string> = {
      mehndi: 'Mehndi',
      wedding: 'Wedding',
      reception: 'Reception',
    }
    
    const csv = [
      ['Name', 'Phone', 'Events', 'RSVP Status', 'Mehndi RSVP', 'Wedding RSVP', 'Reception RSVP', 'Menu Preference', 'Dietary Restrictions', 'Additional Info', 'RSVP Submitted At', 'Devices', 'Max Devices', 'Number of Attendees', 'First Access', 'Created At', 'Invitation Link'].join(','),
      ...guestsToExport.map(guest => {
        const rsvpStatus = guest.rsvpStatus || {}
        const overallStatus = getOverallRsvpStatus(guest)
        const rsvpStatusLabels: Record<string, string> = {
          'attending': 'Attending',
          'not-attending': 'Not Attending',
          'pending': 'Pending',
          'not-submitted': 'Not Submitted',
        }
        
        return [
          `"${guest.name}"`,
          guest.phone || '',
          guest.eventAccess.join('; '),
          rsvpStatusLabels[overallStatus] || 'Not Submitted',
          rsvpStatus.mehndi ? (rsvpStatus.mehndi === 'yes' ? 'Attending' : rsvpStatus.mehndi === 'no' ? 'Not Attending' : 'Pending') : (guest.eventAccess.includes('mehndi') ? 'Not Submitted' : 'N/A'),
          rsvpStatus.wedding ? (rsvpStatus.wedding === 'yes' ? 'Attending' : rsvpStatus.wedding === 'no' ? 'Not Attending' : 'Pending') : (guest.eventAccess.includes('wedding') ? 'Not Submitted' : 'N/A'),
          rsvpStatus.reception ? (rsvpStatus.reception === 'yes' ? 'Attending' : rsvpStatus.reception === 'no' ? 'Not Attending' : 'Pending') : (guest.eventAccess.includes('reception') ? 'Not Submitted' : 'N/A'),
          guest.menuPreference ? (guest.menuPreference === 'veg' ? 'Vegetarian' : guest.menuPreference === 'non-veg' ? 'Non-Vegetarian' : 'Both') : '',
          guest.dietaryRestrictions ? `"${guest.dietaryRestrictions.replace(/"/g, '""')}"` : '',
          guest.additionalInfo ? `"${guest.additionalInfo.replace(/"/g, '""')}"` : '',
          guest.rsvpSubmittedAt ? new Date(guest.rsvpSubmittedAt).toLocaleString() : '',
          guest.allowedDevices.length,
          guest.maxDevicesAllowed,
          guest.numberOfAttendees || 1,
          guest.tokenUsedFirstTime ? new Date(guest.tokenUsedFirstTime).toLocaleString() : 'Never',
          new Date(guest.createdAt).toLocaleString(),
          `${typeof window !== 'undefined' ? window.location.origin : ''}/invite/${guest.token}`
        ].join(',')
      })
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
    // Use normalized guests for calculations
    const allEventsCount = normalizedGuests.filter(g => {
      const events = Array.isArray(g.eventAccess) ? g.eventAccess : []
      return events.includes('mehndi') && events.includes('wedding') && events.includes('reception')
    }).length
    
    const receptionOnlyCount = normalizedGuests.filter(g => {
      const events = Array.isArray(g.eventAccess) ? g.eventAccess : []
      return events.length === 1 && events.includes('reception')
    }).length
    
    // Fixed: Total Attendees should only count guests who RSVP'd "yes" to at least one event
    const totalAttendees = normalizedGuests
      .filter(g => {
        const status = getOverallRsvpStatus(g)
        return status === 'attending'
      })
      .reduce((sum, guest) => sum + (guest.numberOfAttendees || 1), 0)
    
    // RSVP stats
    const rsvpAttending = normalizedGuests.filter(g => getOverallRsvpStatus(g) === 'attending').length
    const rsvpNotAttending = normalizedGuests.filter(g => getOverallRsvpStatus(g) === 'not-attending').length
    const rsvpPending = normalizedGuests.filter(g => getOverallRsvpStatus(g) === 'pending').length
    const rsvpNotSubmitted = normalizedGuests.filter(g => getOverallRsvpStatus(g) === 'not-submitted').length

    // Menu preference stats
    const menuVeg = normalizedGuests.filter(g => g.menuPreference === 'veg').length
    const menuNonVeg = normalizedGuests.filter(g => g.menuPreference === 'non-veg').length
    const menuBoth = normalizedGuests.filter(g => g.menuPreference === 'both').length

    // Helper function to calculate event-wise stats
    const calculateEventStats = (eventSlug: string) => {
      const guestsWithEvent = normalizedGuests.filter(g => {
        const events = Array.isArray(g.eventAccess) ? g.eventAccess : []
        return events.includes(eventSlug)
      })

      const attending = guestsWithEvent.filter(g => {
        const rsvpStatus = typeof g.rsvpStatus === 'object' && !Array.isArray(g.rsvpStatus) ? g.rsvpStatus : {}
        return rsvpStatus[eventSlug] === 'yes'
      })
      
      const notAttending = guestsWithEvent.filter(g => {
        const rsvpStatus = typeof g.rsvpStatus === 'object' && !Array.isArray(g.rsvpStatus) ? g.rsvpStatus : {}
        return rsvpStatus[eventSlug] === 'no'
      })
      
      const pending = guestsWithEvent.filter(g => {
        const rsvpStatus = typeof g.rsvpStatus === 'object' && !Array.isArray(g.rsvpStatus) ? g.rsvpStatus : {}
        return rsvpStatus[eventSlug] === 'pending'
      })
      
      const notSubmitted = guestsWithEvent.filter(g => {
        const rsvpStatus = typeof g.rsvpStatus === 'object' && !Array.isArray(g.rsvpStatus) ? g.rsvpStatus : {}
        return !g.rsvpSubmitted || !rsvpStatus[eventSlug]
      })

      const totalAttendees = attending.reduce((sum, guest) => sum + (guest.numberOfAttendees || 1), 0)

      // Calculate total attendees for each status
      const notAttendingAttendees = notAttending.reduce((sum, guest) => sum + (guest.numberOfAttendees || 1), 0)
      const pendingAttendees = pending.reduce((sum, guest) => sum + (guest.numberOfAttendees || 1), 0)
      const notSubmittedAttendees = notSubmitted.reduce((sum, guest) => sum + (guest.numberOfAttendees || 1), 0)

      return {
        attending: totalAttendees, // Total attendees attending
        attendingCount: attending.length, // Number of guest records attending
        notAttending: notAttendingAttendees, // Total attendees not attending
        notAttendingCount: notAttending.length, // Number of guest records not attending
        pending: pendingAttendees, // Total attendees pending
        pendingCount: pending.length, // Number of guest records pending
        notSubmitted: notSubmittedAttendees, // Total attendees not submitted
        notSubmittedCount: notSubmitted.length, // Number of guest records not submitted
        totalAttendees,
      }
    }

    // Event-wise RSVP statistics
    const eventWiseStats = {
      mehndi: calculateEventStats('mehndi'),
      wedding: calculateEventStats('wedding'),
      reception: calculateEventStats('reception'),
    }

    // Total attendees across all guests (not just attending)
    const totalAllAttendees = normalizedGuests.reduce((sum, guest) => sum + (guest.numberOfAttendees || 1), 0)

    return {
      total: totalAllAttendees,
      allEvents: allEventsCount,
      receptionOnly: receptionOnlyCount,
      totalAttendees,
      rsvpAttending,
      rsvpNotAttending,
      rsvpPending,
      rsvpNotSubmitted,
      menuVeg,
      menuNonVeg,
      menuBoth,
      eventWise: eventWiseStats,
    }
  }, [normalizedGuests, getOverallRsvpStatus])

  // Filter and search guests
  const filteredGuests = useMemo(() => {
    let filtered = normalizedGuests

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

    // RSVP filter
    if (filterRsvp !== 'all') {
      filtered = filtered.filter(guest => {
        const status = getOverallRsvpStatus(guest)
        return status === filterRsvp
      })
    }

    return filtered
  }, [normalizedGuests, searchQuery, filterEvent, filterRsvp, getOverallRsvpStatus])

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
      {/* Overview Statistics Section */}
      <div className="mb-8">
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-display text-wedding-navy mb-2">
            Overview Statistics
          </h2>
          <p className="text-sm text-gray-600">
            Key metrics about your guest list and invitations
          </p>
        </div>
        
        {/* Guest Count Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-wedding-gold to-wedding-gold-light rounded-xl shadow-lg p-5 border border-wedding-gold/30 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <span className="text-3xl">👥</span>
              <div className="text-3xl font-bold text-white drop-shadow-sm">{stats.total}</div>
            </div>
            <div className="text-sm font-semibold text-white/95 mb-1">Total Attendees</div>
            <div className="text-xs text-white/80">All invited attendees</div>
          </div>
          
          <div className="bg-gradient-to-br from-amber-500 to-amber-400 rounded-xl shadow-lg p-5 border border-amber-400/30 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <span className="text-3xl">🎉</span>
              <div className="text-3xl font-bold text-white drop-shadow-sm">{stats.allEvents}</div>
            </div>
            <div className="text-sm font-semibold text-white/95 mb-1">All Events</div>
            <div className="text-xs text-white/80">Full event access</div>
          </div>
          
          <div className="bg-gradient-to-br from-wedding-rose to-wedding-rose-light rounded-xl shadow-lg p-5 border border-wedding-rose/30 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <span className="text-3xl">🥂</span>
              <div className="text-3xl font-bold text-white drop-shadow-sm">{stats.receptionOnly}</div>
            </div>
            <div className="text-sm font-semibold text-white/95 mb-1">Reception Only</div>
            <div className="text-xs text-white/80">Reception access only</div>
          </div>
        </div>

        {/* Menu Preference Stats */}
        <div className="mb-6 mt-6">
          <h3 className="text-lg font-display text-wedding-navy mb-3">Menu Preference Overview</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-5 border border-green-400/30 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl">🥗</span>
                <div className="text-3xl font-bold text-white drop-shadow-sm">{stats.menuVeg}</div>
              </div>
              <div className="text-sm font-semibold text-white/95 mb-1">Vegetarian</div>
              <div className="text-xs text-white/80">Veg preference</div>
            </div>
            
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-5 border border-orange-400/30 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl">🍖</span>
                <div className="text-3xl font-bold text-white drop-shadow-sm">{stats.menuNonVeg}</div>
              </div>
              <div className="text-sm font-semibold text-white/95 mb-1">Non-Vegetarian</div>
              <div className="text-xs text-white/80">Non-veg preference</div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-5 border border-purple-400/30 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl">🍽️</span>
                <div className="text-3xl font-bold text-white drop-shadow-sm">{stats.menuBoth}</div>
              </div>
              <div className="text-sm font-semibold text-white/95 mb-1">Both</div>
              <div className="text-xs text-white/80">No preference</div>
            </div>
          </div>
        </div>

        {/* RSVP Status Cards */}
        <div className="mb-4">
          <h3 className="text-lg font-display text-wedding-navy mb-3">RSVP Status Overview</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-5 border border-green-400/30 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <span className="text-3xl">✓</span>
              <div className="text-3xl font-bold text-white drop-shadow-sm">{stats.rsvpAttending}</div>
            </div>
            <div className="text-sm font-semibold text-white/95 mb-1">Attending</div>
            <div className="text-xs text-white/80">Confirmed attendance</div>
          </div>
          
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-5 border border-red-400/30 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <span className="text-3xl">✗</span>
              <div className="text-3xl font-bold text-white drop-shadow-sm">{stats.rsvpNotAttending}</div>
            </div>
            <div className="text-sm font-semibold text-white/95 mb-1">Not Attending</div>
            <div className="text-xs text-white/80">Declined invitations</div>
          </div>
          
          <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl shadow-lg p-5 border border-yellow-400/30 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <span className="text-3xl">⏳</span>
              <div className="text-3xl font-bold text-white drop-shadow-sm">{stats.rsvpPending}</div>
            </div>
            <div className="text-sm font-semibold text-white/95 mb-1">Pending</div>
            <div className="text-xs text-white/80">Awaiting response</div>
          </div>
          
          <div className="bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl shadow-lg p-5 border border-gray-400/30 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <span className="text-3xl">❓</span>
              <div className="text-3xl font-bold text-white drop-shadow-sm">{stats.rsvpNotSubmitted}</div>
            </div>
            <div className="text-sm font-semibold text-white/95 mb-1">Not Submitted</div>
            <div className="text-xs text-white/80">No response yet</div>
          </div>
        </div>
      </div>

      {/* Visual Separator */}
      <div className="ornamental-divider my-8"></div>

      {/* Event-Wise RSVP Statistics */}
      <div className="mb-8">
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-display text-wedding-navy mb-2">
            Event-Wise RSVP Statistics
          </h2>
          <p className="text-sm text-gray-600">
            Detailed RSVP breakdown for each wedding event
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Mehndi & Pithi */}
          <div className="bg-gradient-to-br from-wedding-cream-light to-white rounded-xl shadow-lg p-6 border-2 border-wedding-gold/40 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">🎨</span>
              <h4 className="text-lg font-semibold text-wedding-navy">Mehndi & Pithi</h4>
            </div>
            <div className="space-y-3">
              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-green-800 flex items-center gap-1">
                    <span>✓</span> Attending
                  </span>
                  <span className="text-base font-bold text-green-700">
                    {stats.eventWise.mehndi.attending} attendee{stats.eventWise.mehndi.attending !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="text-xs text-green-600">
                  {stats.eventWise.mehndi.attendingCount} invitation{stats.eventWise.mehndi.attendingCount !== 1 ? 's' : ''}
                </div>
                <div className="text-xs text-green-500 mt-1">Confirmed attendance</div>
              </div>
              
              <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-red-800 flex items-center gap-1">
                    <span>✗</span> Not Attending
                  </span>
                  <span className="text-base font-bold text-red-700">{stats.eventWise.mehndi.notAttending}</span>
                </div>
                <div className="text-xs text-red-500">Declined invitations</div>
              </div>
              
              <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-yellow-800 flex items-center gap-1">
                    <span>⏳</span> Pending
                  </span>
                  <span className="text-base font-bold text-yellow-700">{stats.eventWise.mehndi.pending}</span>
                </div>
                <div className="text-xs text-yellow-500">Awaiting response</div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-800 flex items-center gap-1">
                    <span>❓</span> Not Submitted
                  </span>
                  <span className="text-base font-bold text-gray-700">{stats.eventWise.mehndi.notSubmitted}</span>
                </div>
                <div className="text-xs text-gray-500">No response yet</div>
              </div>
            </div>
          </div>

          {/* Hindu Wedding */}
          <div className="bg-gradient-to-br from-wedding-cream-light to-white rounded-xl shadow-lg p-6 border-2 border-wedding-gold/40 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">💒</span>
              <h4 className="text-lg font-semibold text-wedding-navy">Hindu Wedding</h4>
            </div>
            <div className="space-y-3">
              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-green-800 flex items-center gap-1">
                    <span>✓</span> Attending
                  </span>
                  <span className="text-base font-bold text-green-700">
                    {stats.eventWise.wedding.attending} attendee{stats.eventWise.wedding.attending !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="text-xs text-green-600">
                  {stats.eventWise.wedding.attendingCount} invitation{stats.eventWise.wedding.attendingCount !== 1 ? 's' : ''}
                </div>
                <div className="text-xs text-green-500 mt-1">Confirmed attendance</div>
              </div>
              
              <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-red-800 flex items-center gap-1">
                    <span>✗</span> Not Attending
                  </span>
                  <span className="text-base font-bold text-red-700">{stats.eventWise.wedding.notAttending}</span>
                </div>
                <div className="text-xs text-red-500">Declined invitations</div>
              </div>
              
              <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-yellow-800 flex items-center gap-1">
                    <span>⏳</span> Pending
                  </span>
                  <span className="text-base font-bold text-yellow-700">{stats.eventWise.wedding.pending}</span>
                </div>
                <div className="text-xs text-yellow-500">Awaiting response</div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-800 flex items-center gap-1">
                    <span>❓</span> Not Submitted
                  </span>
                  <span className="text-base font-bold text-gray-700">{stats.eventWise.wedding.notSubmitted}</span>
                </div>
                <div className="text-xs text-gray-500">No response yet</div>
              </div>
            </div>
          </div>

          {/* Reception */}
          <div className="bg-gradient-to-br from-wedding-cream-light to-white rounded-xl shadow-lg p-6 border-2 border-wedding-gold/40 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">🎊</span>
              <h4 className="text-lg font-semibold text-wedding-navy">Reception</h4>
            </div>
            <div className="space-y-3">
              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-green-800 flex items-center gap-1">
                    <span>✓</span> Attending
                  </span>
                  <span className="text-base font-bold text-green-700">
                    {stats.eventWise.reception.attending} attendee{stats.eventWise.reception.attending !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="text-xs text-green-600">
                  {stats.eventWise.reception.attendingCount} invitation{stats.eventWise.reception.attendingCount !== 1 ? 's' : ''}
                </div>
                <div className="text-xs text-green-500 mt-1">Confirmed attendance</div>
              </div>
              
              <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-red-800 flex items-center gap-1">
                    <span>✗</span> Not Attending
                  </span>
                  <span className="text-base font-bold text-red-700">{stats.eventWise.reception.notAttending}</span>
                </div>
                <div className="text-xs text-red-500">Declined invitations</div>
              </div>
              
              <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-yellow-800 flex items-center gap-1">
                    <span>⏳</span> Pending
                  </span>
                  <span className="text-base font-bold text-yellow-700">{stats.eventWise.reception.pending}</span>
                </div>
                <div className="text-xs text-yellow-500">Awaiting response</div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-800 flex items-center gap-1">
                    <span>❓</span> Not Submitted
                  </span>
                  <span className="text-base font-bold text-gray-700">{stats.eventWise.reception.notSubmitted}</span>
                </div>
                <div className="text-xs text-gray-500">No response yet</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Separator */}
      <div className="ornamental-divider my-8"></div>

      {/* Guest Management Section */}
      <div className="mb-8">
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-display text-wedding-navy mb-2">
            Guest Management
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Manage your guest list, view RSVPs, and export data
          </p>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
            <div className="text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
              Showing: <span className="font-semibold text-wedding-navy">{filteredGuests.length}</span> of <span className="font-semibold text-wedding-navy">{normalizedGuests.length}</span> guests
              {selectedGuests.size > 0 && (
                <span className="ml-2 text-wedding-gold font-semibold">
                  | {selectedGuests.size} selected
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-end items-start sm:items-center gap-3 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleDownloadTemplate}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg text-sm sm:text-base font-medium"
            >
              📋 Download Template
            </button>
            <button
              onClick={() => setShowImportModal(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all duration-200 shadow-md hover:shadow-lg text-sm sm:text-base font-medium"
            >
              📤 Import Excel
            </button>
            <button
              onClick={handleExportGuests}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-all duration-200 shadow-md hover:shadow-lg text-sm sm:text-base font-medium"
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
                  setHideEventAccess(true)
                }}
                className="bg-wedding-gold text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-all duration-200 shadow-md hover:shadow-lg text-sm sm:text-base font-medium"
              >
                + Add All Events Guest
              </button>
              <button
                onClick={() => {
                  resetForm()
                  setFormData(prev => ({ ...prev, eventAccess: 'reception-only' }))
                  setShowCreateForm(true)
                  setQuickAddMode(false)
                  setHideEventAccess(true)
                }}
                className="bg-wedding-rose text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-all duration-200 shadow-md hover:shadow-lg text-sm sm:text-base font-medium"
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
        <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-200">
          <h3 className="text-sm font-semibold text-wedding-navy mb-3">Search & Filter Guests</h3>
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <label className="block text-xs text-gray-600 mb-1">Search</label>
                <input
                  type="text"
                  placeholder="Search by name, phone, or token..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wedding-gold focus:border-transparent shadow-sm transition-all"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Event Type</label>
                <select
                  value={filterEvent}
                  onChange={(e) => setFilterEvent(e.target.value)}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wedding-gold focus:border-transparent shadow-sm transition-all bg-white"
                >
                  <option value="all">All Guests</option>
                  <option value="all-events">All Events</option>
                  <option value="reception-only">Reception Only</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">RSVP Status</label>
                <select
                  value={filterRsvp}
                  onChange={(e) => setFilterRsvp(e.target.value)}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wedding-gold focus:border-transparent shadow-sm transition-all bg-white"
                >
                  <option value="all">All RSVP</option>
                  <option value="attending">✓ Attending</option>
                  <option value="not-attending">✗ Not Attending</option>
                  <option value="pending">⏳ Pending</option>
                  <option value="not-submitted">❓ Not Submitted</option>
                </select>
              </div>
            </div>
            {/* Active Filter Chips */}
            {(filterEvent !== 'all' || filterRsvp !== 'all' || searchQuery) && (
              <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200">
                <span className="text-xs text-gray-500 font-medium">Active filters:</span>
                {filterEvent !== 'all' && (
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-wedding-gold/20 text-wedding-navy border border-wedding-gold/30">
                    Event: {filterEvent === 'all-events' ? 'All Events' : 'Reception Only'}
                    <button onClick={() => setFilterEvent('all')} className="ml-2 hover:text-red-600 transition-colors">×</button>
                  </span>
                )}
                {filterRsvp !== 'all' && (
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                    RSVP: {filterRsvp === 'attending' ? '✓ Attending' : filterRsvp === 'not-attending' ? '✗ Not Attending' : filterRsvp === 'pending' ? '⏳ Pending' : '❓ Not Submitted'}
                    <button onClick={() => setFilterRsvp('all')} className="ml-2 hover:text-red-600 transition-colors">×</button>
                  </span>
                )}
                {searchQuery && (
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                    Search: &quot;{searchQuery}&quot;
                    <button onClick={() => setSearchQuery('')} className="ml-2 hover:text-red-600 transition-colors">×</button>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-4 bg-gradient-to-r from-green-50 to-green-100 border-l-4 border-green-500 text-green-800 px-4 py-3 rounded-lg shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-lg">✓</span>
              <span className="font-medium">{success}</span>
            </div>
          </div>
        )}
        {error && (
          <div className="mb-4 bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 text-red-800 px-4 py-3 rounded-lg shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-lg">✗</span>
              <span className="font-medium">{error}</span>
            </div>
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
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="Phone number (optional if email provided)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="Email (optional if phone provided)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  At least one of phone or email is required
                </p>
              </div>
              {!hideEventAccess && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Access
                  </label>
                  <div className="space-y-2">
                    <label 
                      onClick={() => setFormData({ ...formData, eventAccess: 'all-events' })}
                      className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all touch-manipulation min-h-[56px] select-none ${
                        formData.eventAccess === 'all-events'
                          ? 'bg-wedding-gold/20 border-wedding-gold shadow-md scale-[1.02]'
                          : 'bg-white border-gray-300 hover:bg-gray-50'
                      }`}
                      style={{ WebkitTapHighlightColor: 'transparent' }}
                    >
                      <input
                        type="radio"
                        name="eventAccess"
                        value="all-events"
                        checked={formData.eventAccess === 'all-events'}
                        onChange={(e) => setFormData({ ...formData, eventAccess: e.target.value as 'all-events' | 'reception-only' })}
                        onClick={(e) => e.stopPropagation()}
                        className="mr-3 w-5 h-5 text-wedding-gold focus:ring-wedding-gold pointer-events-none"
                      />
                      <div className="flex-1">
                        <span className={`font-semibold block ${formData.eventAccess === 'all-events' ? 'text-wedding-navy' : 'text-gray-700'}`}>All Events</span>
                        <p className="text-xs text-gray-500">Mehndi, Wedding & Reception</p>
                      </div>
                      {formData.eventAccess === 'all-events' && (
                        <span className="text-wedding-gold text-xl ml-2">✓</span>
                      )}
                    </label>
                    <label 
                      onClick={() => setFormData({ ...formData, eventAccess: 'reception-only' })}
                      className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all touch-manipulation min-h-[56px] select-none ${
                        formData.eventAccess === 'reception-only'
                          ? 'bg-wedding-rose/20 border-wedding-rose shadow-md scale-[1.02]'
                          : 'bg-white border-gray-300 hover:bg-gray-50'
                      }`}
                      style={{ WebkitTapHighlightColor: 'transparent' }}
                    >
                      <input
                        type="radio"
                        name="eventAccess"
                        value="reception-only"
                        checked={formData.eventAccess === 'reception-only'}
                        onChange={(e) => setFormData({ ...formData, eventAccess: e.target.value as 'all-events' | 'reception-only' })}
                        onClick={(e) => e.stopPropagation()}
                        className="mr-3 w-5 h-5 text-wedding-gold focus:ring-wedding-gold pointer-events-none"
                      />
                      <div className="flex-1">
                        <span className={`font-semibold block ${formData.eventAccess === 'reception-only' ? 'text-wedding-navy' : 'text-gray-700'}`}>Reception Only</span>
                        <p className="text-xs text-gray-500">Reception event only</p>
                      </div>
                      {formData.eventAccess === 'reception-only' && (
                        <span className="text-wedding-rose text-xl ml-2">✓</span>
                      )}
                    </label>
                  </div>
                </div>
              )}
              {hideEventAccess && (
                <div className="bg-wedding-gold/10 border border-wedding-gold/30 rounded-lg p-3">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Event Access:</span>{' '}
                    {formData.eventAccess === 'all-events' ? (
                      <span className="text-wedding-gold">All Events (Mehndi, Wedding & Reception)</span>
                    ) : (
                      <span className="text-wedding-rose">Reception Only</span>
                    )}
                  </p>
                </div>
              )}
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
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
            <tr>
              <th className="px-3 sm:px-6 py-4 text-left text-xs font-semibold text-wedding-navy uppercase tracking-wider w-12 border-b-2 border-gray-200">
                <input
                  type="checkbox"
                  checked={selectedGuests.size === filteredGuests.length && filteredGuests.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded border-gray-300 text-wedding-gold focus:ring-wedding-gold"
                />
              </th>
              <th className="px-2 sm:px-4 py-4 text-left text-xs font-semibold text-wedding-navy uppercase tracking-wider border-b-2 border-gray-200 w-[140px]">
                Name
              </th>
              <th className="px-2 sm:px-4 py-4 text-left text-xs font-semibold text-wedding-navy uppercase tracking-wider hidden sm:table-cell border-b-2 border-gray-200 w-[120px]">
                Phone
              </th>
              <th className="px-2 sm:px-4 py-4 text-left text-xs font-semibold text-wedding-navy uppercase tracking-wider hidden sm:table-cell border-b-2 border-gray-200 w-[150px]">
                Email
              </th>
              <th className="px-2 sm:px-4 py-4 text-left text-xs font-semibold text-wedding-navy uppercase tracking-wider border-b-2 border-gray-200 w-[130px]">
                Event Type
              </th>
              <th className="px-2 sm:px-4 py-4 text-left text-xs font-semibold text-wedding-navy uppercase tracking-wider border-b-2 border-gray-200 w-[90px]">
                Devices
              </th>
              <th className="px-2 sm:px-4 py-4 text-left text-xs font-semibold text-wedding-navy uppercase tracking-wider border-b-2 border-gray-200 w-[90px]">
                Attendees
              </th>
              <th className="px-2 sm:px-4 py-4 text-left text-xs font-semibold text-wedding-navy uppercase tracking-wider border-b-2 border-gray-200 w-[140px]">
                Menu Preference
              </th>
              <th className="px-2 sm:px-4 py-4 text-left text-xs font-semibold text-wedding-navy uppercase tracking-wider border-b-2 border-gray-200 min-w-[200px]">
                RSVP Status
              </th>
              <th className="px-2 sm:px-4 py-4 text-left text-xs font-semibold text-wedding-navy uppercase tracking-wider border-b-2 border-gray-200 w-[200px]">
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
                  <td className="px-2 sm:px-4 py-4 text-xs sm:text-sm font-medium text-gray-900">
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
                      {guest.phone ? `Phone: ${guest.phone}` : ''}
                      {guest.phone && guest.email ? ' | ' : ''}
                      {guest.email ? `Email: ${guest.email}` : ''}
                      {!guest.phone && !guest.email ? 'No contact info' : ''}
                    </div>
                  </td>
                  <td className="px-2 sm:px-4 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 hidden sm:table-cell">
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
                  <td className="px-2 sm:px-4 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 hidden sm:table-cell">
                    {guest.email || 'Not set'}
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
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    {guest.menuPreference ? (
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        guest.menuPreference === 'veg' 
                          ? 'bg-green-100 text-green-800 border border-green-200'
                          : guest.menuPreference === 'non-veg'
                          ? 'bg-orange-100 text-orange-800 border border-orange-200'
                          : 'bg-purple-100 text-purple-800 border border-purple-200'
                      }`}>
                        {guest.menuPreference === 'veg' ? '🥗 Veg' : guest.menuPreference === 'non-veg' ? '🍖 Non-Veg' : '🍽️ Both'}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400 italic">Not set</span>
                    )}
                  </td>
                  <td 
                    className="px-2 sm:px-4 py-4 cursor-pointer hover:bg-gray-50"
                    onClick={() => setViewingGuest(guest)}
                    title="Click to view RSVP details"
                  >
                    {(() => {
                      const rsvpStatus = getOverallRsvpStatus(guest)
                      const eventNames: Record<string, string> = {
                        mehndi: 'Mehndi',
                        wedding: 'Wedding',
                        reception: 'Reception',
                      }
                      
                      if (rsvpStatus === 'not-submitted') {
                        return (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            ❓ Not Submitted
                          </span>
                        )
                      }
                      
                      // Show per-event RSVP badges for accessible events
                      const eventAccess = guest.eventAccess || []
                      const rsvpData = guest.rsvpStatus || {}
                      
                      return (
                        <div className="flex flex-col gap-1.5">
                          {eventAccess.map((eventSlug: string) => {
                            const status = rsvpData[eventSlug]
                            if (!status) return null
                            
                            const statusConfig = {
                              yes: { bg: 'bg-green-100', text: 'text-green-800', icon: '✓', label: 'Attending' },
                              no: { bg: 'bg-red-100', text: 'text-red-800', icon: '✗', label: 'Not Attending' },
                              pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: '⏳', label: 'Pending' },
                            }[status] || { bg: 'bg-gray-100', text: 'text-gray-800', icon: '❓', label: 'Unknown' }
                            
                            return (
                              <span
                                key={eventSlug}
                                className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-medium ${statusConfig.bg} ${statusConfig.text} w-fit`}
                                title={`${eventNames[eventSlug] || eventSlug}: ${statusConfig.label}`}
                              >
                                <span className="mr-1.5">{statusConfig.icon}</span>
                                <span className="font-semibold">{eventNames[eventSlug] || eventSlug}:</span>
                                <span className="ml-1">{statusConfig.label}</span>
                              </span>
                            )
                          })}
                        </div>
                      )
                    })()}
                  </td>
                  <td className="px-2 sm:px-4 py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
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
            {searchQuery || filterEvent !== 'all' || filterRsvp !== 'all'
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
                    Email
                  </label>
                  <p className="text-gray-900">
                    {viewingGuest.email || 'Not set'}
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

                {/* RSVP Section */}
                <div className="border-t pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    RSVP Status
                  </label>
                  {!viewingGuest.rsvpSubmitted ? (
                    <p className="text-gray-500 italic">Not submitted yet</p>
                  ) : (
                    <div className="space-y-3">
                      {viewingGuest.eventAccess && viewingGuest.eventAccess.map((eventSlug: string) => {
                        const eventNames: Record<string, string> = {
                          mehndi: 'Mehndi & Pithi',
                          wedding: 'Hindu Wedding',
                          reception: 'Reception',
                        }
                        const status = viewingGuest.rsvpStatus?.[eventSlug]
                        if (!status) return null
                        
                        const statusConfig = {
                          yes: { bg: 'bg-green-100', text: 'text-green-800', icon: '✓', label: 'Attending' },
                          no: { bg: 'bg-red-100', text: 'text-red-800', icon: '✗', label: 'Not Attending' },
                          pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: '⏳', label: 'Pending' },
                        }[status] || { bg: 'bg-gray-100', text: 'text-gray-800', icon: '❓', label: 'Unknown' }
                        
                        return (
                          <div key={eventSlug} className={`${statusConfig.bg} ${statusConfig.text} p-3 rounded-lg`}>
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{statusConfig.icon}</span>
                              <span className="font-semibold">{eventNames[eventSlug] || eventSlug}</span>
                              <span className="ml-auto">{statusConfig.label}</span>
                            </div>
                          </div>
                        )
                      })}
                      {viewingGuest.rsvpSubmittedAt && (
                        <p className="text-xs text-gray-500 mt-2">
                          Submitted: {new Date(viewingGuest.rsvpSubmittedAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Preferences Section */}
                {viewingGuest.preferencesSubmitted && (
                  <div className="border-t pt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Preferences
                    </label>
                    <div className="space-y-2">
                      {viewingGuest.menuPreference && (
                        <div>
                          <span className="text-xs text-gray-500">Menu: </span>
                          <span className="font-medium">{viewingGuest.menuPreference === 'veg' ? 'Vegetarian' : viewingGuest.menuPreference === 'non-veg' ? 'Non-Vegetarian' : 'Both'}</span>
                        </div>
                      )}
                      {viewingGuest.dietaryRestrictions && (
                        <div>
                          <span className="text-xs text-gray-500">Dietary Restrictions: </span>
                          <span className="font-medium">{viewingGuest.dietaryRestrictions}</span>
                        </div>
                      )}
                      {viewingGuest.additionalInfo && (
                        <div>
                          <span className="text-xs text-gray-500">Additional Info: </span>
                          <span className="font-medium">{viewingGuest.additionalInfo}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

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
                      <li><strong>Column B:</strong> Phone (optional, but phone or email required)</li>
                      <li><strong>Column C:</strong> Email (optional, but phone or email required)</li>
                      <li><strong>Column D:</strong> Event Access (required: &quot;all-events&quot; or &quot;reception-only&quot;)</li>
                      <li><strong>Column E:</strong> Max Devices Allowed (optional, default: 1)</li>
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

