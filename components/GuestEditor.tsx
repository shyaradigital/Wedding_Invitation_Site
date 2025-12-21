'use client'

import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import WhatsAppShare from './WhatsAppShare'
import EventTypeBadge from './EventTypeBadge'
import { getDefaultInvitationHTML, getDefaultInvitationText, replaceTemplateVariables } from '@/lib/brevo'
const XLSX = require('xlsx')

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
  numberOfAttendees: number // Kept for backward compatibility, but should use getAttendeeCount helper
  numberOfAttendeesPerEvent?: Record<string, number> | null
  rsvpSubmitted?: boolean
  rsvpStatus?: Record<string, 'yes' | 'no'> | null
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
  }>({
    name: '',
    phone: '',
    email: '',
    eventAccess: 'all-events',
    maxDevicesAllowed: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showImportModal, setShowImportModal] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [importResults, setImportResults] = useState<any>(null)
  const [deviceManagementGuest, setDeviceManagementGuest] = useState<Guest | null>(null)
  const [newMaxDevices, setNewMaxDevices] = useState<number | ''>('')
  
  // Email sending state
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  const [emailSendingStatus, setEmailSendingStatus] = useState<string | null>(null)
  const [showCustomMessageModal, setShowCustomMessageModal] = useState(false)
  const [showEmailPreviewModal, setShowEmailPreviewModal] = useState(false)
  const [emailPreviewGuest, setEmailPreviewGuest] = useState<Guest | null>(null)
  const [showEmailChoiceModal, setShowEmailChoiceModal] = useState(false)
  const [emailChoiceGuest, setEmailChoiceGuest] = useState<Guest | null>(null)
  const [showIndividualCustomEmailModal, setShowIndividualCustomEmailModal] = useState(false)
  const [individualCustomEmailData, setIndividualCustomEmailData] = useState<{
    subject: string
    content: string
    isPlainText: boolean
    guest: Guest | null
  }>({
    subject: "Jay and Ankita's Wedding Invitation",
    content: '',
    isPlainText: false,
    guest: null,
  })
  const [emailPreviewZoom, setEmailPreviewZoom] = useState(100)
  const [showFullScreenPreview, setShowFullScreenPreview] = useState(false)
  const [fullScreenPreviewContent, setFullScreenPreviewContent] = useState<string>('')
  const [customEmailData, setCustomEmailData] = useState<{
    subject: string
    content: string
    isPlainText: boolean
    previewMode: 'editor' | 'preview'
  }>({
    subject: "Jay and Ankita's Wedding Invitation",
    content: '',
    isPlainText: false,
    previewMode: 'editor',
  })
  
  // RSVP Reset state
  const [resetConfirmGuest, setResetConfirmGuest] = useState<Guest | null>(null)
  const [showResetAllConfirm, setShowResetAllConfirm] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false)
  const [isDeletingAll, setIsDeletingAll] = useState(false)
  const [showBulkSendConfirm, setShowBulkSendConfirm] = useState(false)

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

  // Helper function to get attendee count from RSVP data or fallback
  const getAttendeeCount = useCallback((guest: Guest, eventSlug?: string): number => {
    // If eventSlug is provided, get count for that specific event
    if (eventSlug && guest.numberOfAttendeesPerEvent && guest.numberOfAttendeesPerEvent[eventSlug]) {
      return guest.numberOfAttendeesPerEvent[eventSlug]
    }
    
    // If RSVP data exists, calculate from per-event counts
    if (guest.numberOfAttendeesPerEvent && Object.keys(guest.numberOfAttendeesPerEvent).length > 0) {
      // Return maximum count across all events (for overall display)
      return Math.max(...Object.values(guest.numberOfAttendeesPerEvent), 1)
    }
    
    // Fallback to numberOfAttendees for backward compatibility
    return guest.numberOfAttendees || 1
  }, [])

  // Helper function to get attendee count for a specific event
  const getAttendeeCountForEvent = useCallback((guest: Guest, eventSlug: string): number => {
    // Check if guest is attending this event
    const isAttending = guest.rsvpStatus && guest.rsvpStatus[eventSlug] === 'yes'
    
    if (isAttending && guest.numberOfAttendeesPerEvent && guest.numberOfAttendeesPerEvent[eventSlug]) {
      return guest.numberOfAttendeesPerEvent[eventSlug]
    }
    
    // If not attending or no RSVP data, return 0 for not attending, 1 for no RSVP
    if (guest.rsvpStatus && guest.rsvpStatus[eventSlug] === 'no') {
      return 0
    }
    
    // If no RSVP data, return 1 as default
    return 1
  }, [])

  // Normalize guest data to ensure consistent structure
  const normalizedGuests = useMemo(() => {
    return guests.map(guest => ({
      ...guest,
      eventAccess: Array.isArray(guest.eventAccess) 
        ? guest.eventAccess 
        : safeParseJson<string[]>(guest.eventAccess as any, []),
      rsvpStatus: guest.rsvpStatus && typeof guest.rsvpStatus === 'object' && !Array.isArray(guest.rsvpStatus)
        ? guest.rsvpStatus
        : safeParseJson<Record<string, 'yes' | 'no'>>(guest.rsvpStatus as any, {}),
      numberOfAttendeesPerEvent: guest.numberOfAttendeesPerEvent && typeof guest.numberOfAttendeesPerEvent === 'object'
        ? guest.numberOfAttendeesPerEvent
        : safeParseJson<Record<string, number>>(guest.numberOfAttendeesPerEvent as any, {})
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
        cache: 'no-store',
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone.trim() || undefined,
          email: formData.email.trim() || undefined,
          eventAccess: formData.eventAccess,
          maxDevicesAllowed: formData.maxDevicesAllowed || 1,
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
        cache: 'no-store',
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
        cache: 'no-store',
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
          cache: 'no-store',
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
        fetch(`/api/admin/guest/${guestId}`, { method: 'DELETE', cache: 'no-store' })
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

  // Helper function to format dates as text for Excel
  const formatDateForExcel = (dateValue: string | null | undefined): string => {
    if (!dateValue) return ''
    try {
      const date = new Date(dateValue)
      if (isNaN(date.getTime())) return ''
      // Format as readable date-time string that Excel will treat as text
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      })
    } catch {
      return ''
    }
  }

  const handleBulkExport = () => {
    if (selectedGuests.size === 0) {
      setError('Please select at least one guest')
      return
    }

    const selectedGuestList = normalizedGuests.filter(g => selectedGuests.has(g.id))
    const rsvpStatusLabels: Record<string, string> = {
      'attending': 'Attending',
      'not-attending': 'Not Attending',
      'not-submitted': 'Not Submitted',
    }

    // Convert guest data to Excel format
    const excelData = selectedGuestList.map(guest => {
      const rsvpStatus = guest.rsvpStatus || {}
      const overallStatus = getOverallRsvpStatus(guest)
      const attendeesPerEvent = guest.numberOfAttendeesPerEvent || {}
      
      return {
        'Name': guest.name,
        'Email': guest.email || '',
        'Phone': guest.phone || '',
        'Events': guest.eventAccess.join('; '),
        'RSVP Status': rsvpStatusLabels[overallStatus] || 'Not Submitted',
        'Mehndi RSVP': rsvpStatus.mehndi ? (rsvpStatus.mehndi === 'yes' ? 'Attending' : 'Not Attending') : (guest.eventAccess.includes('mehndi') ? 'Not Submitted' : 'N/A'),
        'Wedding RSVP': rsvpStatus.wedding ? (rsvpStatus.wedding === 'yes' ? 'Attending' : 'Not Attending') : (guest.eventAccess.includes('wedding') ? 'Not Submitted' : 'N/A'),
        'Wedding Attendees': rsvpStatus.wedding === 'yes' && attendeesPerEvent.wedding && typeof attendeesPerEvent.wedding === 'number' ? attendeesPerEvent.wedding : '',
        'Reception RSVP': rsvpStatus.reception ? (rsvpStatus.reception === 'yes' ? 'Attending' : 'Not Attending') : (guest.eventAccess.includes('reception') ? 'Not Submitted' : 'N/A'),
        'Reception Attendees': rsvpStatus.reception === 'yes' && attendeesPerEvent.reception && typeof attendeesPerEvent.reception === 'number' ? attendeesPerEvent.reception : '',
        'Menu Preference': guest.menuPreference ? (guest.menuPreference === 'veg' ? 'Vegetarian' : guest.menuPreference === 'non-veg' ? 'Non-Vegetarian' : 'Both') : '',
        'RSVP Submitted At': formatDateForExcel(guest.rsvpSubmittedAt),
        'Devices': guest.allowedDevices.length,
        'Max Devices': guest.maxDevicesAllowed,
        'First Access': guest.tokenUsedFirstTime ? formatDateForExcel(guest.tokenUsedFirstTime) : 'Never',
        'Created At': formatDateForExcel(guest.createdAt),
        'Invitation Link': `${typeof window !== 'undefined' ? window.location.origin : ''}/invite/${guest.token}`
      }
    })

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.json_to_sheet(excelData)
    
    // Set date columns as text to prevent Excel from auto-formatting them
    const dateColumns = ['RSVP Submitted At', 'First Access', 'Created At']
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1')
    for (let col = range.s.c; col <= range.e.c; col++) {
      const headerCell = XLSX.utils.encode_cell({ r: 0, c: col })
      const headerValue = worksheet[headerCell]?.v
      if (dateColumns.includes(headerValue)) {
        // Mark all cells in this column as text
        for (let row = range.s.r + 1; row <= range.e.r; row++) {
          const cell = XLSX.utils.encode_cell({ r: row, c: col })
          if (worksheet[cell]) {
            worksheet[cell].t = 's' // 's' = string type
          }
        }
      }
    }
    
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Guests')

    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' })
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `wedding-guests-selected-${new Date().toISOString().split('T')[0]}.xlsx`
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
        cache: 'no-store',
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
        cache: 'no-store',
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
  const getOverallRsvpStatus = useCallback((guest: Guest): 'attending' | 'not-attending' | 'not-submitted' => {
    if (!guest.rsvpSubmitted || !guest.rsvpStatus) return 'not-submitted'
    
    // Ensure rsvpStatus is an object
    const rsvpStatus = typeof guest.rsvpStatus === 'object' && !Array.isArray(guest.rsvpStatus)
      ? guest.rsvpStatus
      : safeParseJson<Record<string, 'yes' | 'no'>>(guest.rsvpStatus as any, {})
    
    // Ensure eventAccess is an array
    const eventAccess = Array.isArray(guest.eventAccess) 
      ? guest.eventAccess 
      : safeParseJson<string[]>(guest.eventAccess as any, [])
    
    // Check if attending any event
    const hasAttending = eventAccess.some(event => rsvpStatus[event] === 'yes')
    const hasNotAttending = eventAccess.some(event => rsvpStatus[event] === 'no')
    
    if (hasAttending) return 'attending'
    if (hasNotAttending && !hasAttending) return 'not-attending'
    return 'not-submitted'
  }, [])

  const handleExportGuests = () => {
    const guestsToExport = selectedGuests.size > 0 
      ? normalizedGuests.filter(g => selectedGuests.has(g.id))
      : filteredGuests
    const rsvpStatusLabels: Record<string, string> = {
      'attending': 'Attending',
      'not-attending': 'Not Attending',
      'not-submitted': 'Not Submitted',
    }

    // Convert guest data to Excel format
    const excelData = guestsToExport.map(guest => {
      const rsvpStatus = guest.rsvpStatus || {}
      const overallStatus = getOverallRsvpStatus(guest)
      const attendeesPerEvent = guest.numberOfAttendeesPerEvent || {}
      
      return {
        'Name': guest.name,
        'Email': guest.email || '',
        'Phone': guest.phone || '',
        'Events': guest.eventAccess.join('; '),
        'RSVP Status': rsvpStatusLabels[overallStatus] || 'Not Submitted',
        'Mehndi RSVP': rsvpStatus.mehndi ? (rsvpStatus.mehndi === 'yes' ? 'Attending' : 'Not Attending') : (guest.eventAccess.includes('mehndi') ? 'Not Submitted' : 'N/A'),
        'Wedding RSVP': rsvpStatus.wedding ? (rsvpStatus.wedding === 'yes' ? 'Attending' : 'Not Attending') : (guest.eventAccess.includes('wedding') ? 'Not Submitted' : 'N/A'),
        'Wedding Attendees': rsvpStatus.wedding === 'yes' && attendeesPerEvent.wedding && typeof attendeesPerEvent.wedding === 'number' ? attendeesPerEvent.wedding : '',
        'Reception RSVP': rsvpStatus.reception ? (rsvpStatus.reception === 'yes' ? 'Attending' : 'Not Attending') : (guest.eventAccess.includes('reception') ? 'Not Submitted' : 'N/A'),
        'Reception Attendees': rsvpStatus.reception === 'yes' && attendeesPerEvent.reception && typeof attendeesPerEvent.reception === 'number' ? attendeesPerEvent.reception : '',
        'Menu Preference': guest.menuPreference ? (guest.menuPreference === 'veg' ? 'Vegetarian' : guest.menuPreference === 'non-veg' ? 'Non-Vegetarian' : 'Both') : '',
        'RSVP Submitted At': formatDateForExcel(guest.rsvpSubmittedAt),
        'Devices': guest.allowedDevices.length,
        'Max Devices': guest.maxDevicesAllowed,
        'First Access': guest.tokenUsedFirstTime ? formatDateForExcel(guest.tokenUsedFirstTime) : 'Never',
        'Created At': formatDateForExcel(guest.createdAt),
        'Invitation Link': `${typeof window !== 'undefined' ? window.location.origin : ''}/invite/${guest.token}`
      }
    })

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.json_to_sheet(excelData)
    
    // Set date columns as text to prevent Excel from auto-formatting them
    const dateColumns = ['RSVP Submitted At', 'First Access', 'Created At']
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1')
    for (let col = range.s.c; col <= range.e.c; col++) {
      const headerCell = XLSX.utils.encode_cell({ r: 0, c: col })
      const headerValue = worksheet[headerCell]?.v
      if (dateColumns.includes(headerValue)) {
        // Mark all cells in this column as text
        for (let row = range.s.r + 1; row <= range.e.r; row++) {
          const cell = XLSX.utils.encode_cell({ r: row, c: col })
          if (worksheet[cell]) {
            worksheet[cell].t = 's' // 's' = string type
          }
        }
      }
    }
    
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Guests')

    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' })
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `wedding-guests-${new Date().toISOString().split('T')[0]}.xlsx`
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
      .reduce((sum, guest) => sum + getAttendeeCount(guest), 0)
    
    // RSVP stats
    const rsvpAttending = normalizedGuests.filter(g => getOverallRsvpStatus(g) === 'attending').length
    const rsvpNotAttending = normalizedGuests.filter(g => getOverallRsvpStatus(g) === 'not-attending').length
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

      const totalAttendees = attending.reduce((sum, guest) => sum + getAttendeeCountForEvent(guest, eventSlug), 0)

      // Calculate total attendees for each status
      const notAttendingAttendees = notAttending.reduce((sum, guest) => sum + getAttendeeCountForEvent(guest, eventSlug), 0)
      const pendingAttendees = pending.reduce((sum, guest) => sum + getAttendeeCountForEvent(guest, eventSlug), 0)
      const notSubmittedAttendees = notSubmitted.reduce((sum, guest) => sum + getAttendeeCountForEvent(guest, eventSlug), 0)

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
    const totalAllAttendees = normalizedGuests.reduce((sum, guest) => sum + getAttendeeCount(guest), 0)

    return {
      total: totalAllAttendees,
      allEvents: allEventsCount,
      receptionOnly: receptionOnlyCount,
      totalAttendees,
      rsvpAttending,
      rsvpNotAttending,
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

  // RSVP Reset handlers
  const handleResetRsvp = async (guestIds: string[]) => {
    if (!guestIds || guestIds.length === 0) {
      setError('No guests selected for reset')
      return
    }
    
    setIsResetting(true)
    setError(null)
    
    try {
      const response = await fetch('/api/admin/guest/reset-rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify({ guestIds }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(data.message || `RSVP reset successfully for ${data.resetCount} guest(s)`)
        setTimeout(() => setSuccess(null), 5000)
        onGuestsChange() // Refresh guest list
        // Trigger stats refresh by dispatching a custom event
        window.dispatchEvent(new CustomEvent('rsvp-reset'))
      } else {
        setError(data.error || 'Failed to reset RSVP')
      }
    } catch (err) {
      console.error('Error resetting RSVP:', err)
      setError('An error occurred while resetting RSVP')
    } finally {
      setIsResetting(false)
      setResetConfirmGuest(null)
      setShowResetAllConfirm(false)
    }
  }

  const handleResetRsvpForGuest = (guest: Guest) => {
    setResetConfirmGuest(guest)
  }

  const handleConfirmResetRsvp = () => {
    if (resetConfirmGuest) {
      handleResetRsvp([resetConfirmGuest.id])
    } else {
      setError('No guest selected for reset')
    }
  }

  const handleResetAllRsvps = () => {
    const allGuestIds = normalizedGuests.map(g => g.id)
    if (allGuestIds.length === 0) {
      setError('No guests to reset')
      return
    }
    handleResetRsvp(allGuestIds)
  }

  const handleDeleteAllGuests = async () => {
    setIsDeletingAll(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/guest/delete-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(data.message || `Successfully deleted all ${data.deletedCount} guest(s)!`)
        setSelectedGuests(new Set()) // Clear selection
        setShowDeleteAllConfirm(false)
        onGuestsChange() // Refresh guest list
        // Trigger stats refresh by dispatching a custom event
        window.dispatchEvent(new CustomEvent('guests-deleted'))
        setTimeout(() => setSuccess(null), 5000)
      } else {
        setError(data.error || 'Failed to delete all guests')
      }
    } catch (err) {
      console.error('Error deleting all guests:', err)
      setError('An error occurred while deleting all guests')
    } finally {
      setIsDeletingAll(false)
    }
  }

  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch('/api/admin/guest/import', { cache: 'no-store' })
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

  // Email sending handlers
  const getBaseUrl = () => {
    return typeof window !== 'undefined' ? window.location.origin : 'https://example.com'
  }

  const handleSendEmailToGuest = (guest: Guest) => {
    if (!guest.email) {
      setError(`Guest "${guest.name}" does not have an email address`)
      return
    }

    // Show choice modal
    setEmailChoiceGuest(guest)
    setShowEmailChoiceModal(true)
  }

  const handleSendDefaultInvitation = (guest: Guest) => {
    // Close choice modal and open preview modal with default template
    setShowEmailChoiceModal(false)
    setEmailChoiceGuest(null)
    setEmailPreviewGuest(guest)
    setShowEmailPreviewModal(true)
  }

  const handleOpenCustomMessageEditor = (guest: Guest) => {
    // Close choice modal and open custom message editor
    setShowEmailChoiceModal(false)
    setEmailChoiceGuest(null)
    setError(null) // Clear any previous errors
    setIndividualCustomEmailData({
      subject: "Jay and Ankita's Wedding Invitation",
      content: '',
      isPlainText: false,
      guest: guest,
    })
    setShowIndividualCustomEmailModal(true)
  }

  const handleConfirmSendIndividualCustomEmail = async () => {
    if (!individualCustomEmailData.guest) {
      setError('No guest selected')
      return
    }

    if (!individualCustomEmailData.subject.trim()) {
      setError('Please enter email subject')
      return
    }

    if (!individualCustomEmailData.content.trim()) {
      setError('Please enter email content')
      return
    }

    setIsSendingEmail(true)
    setEmailSendingStatus(null)
    setError(null)

    try {
      const response = await fetch('/api/admin/guest/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify({
          guestId: individualCustomEmailData.guest.id,
          customMessage: individualCustomEmailData.content,
          customSubject: individualCustomEmailData.subject,
          isPlainText: individualCustomEmailData.isPlainText,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setEmailSendingStatus(`Email sent successfully to ${individualCustomEmailData.guest.email}`)
        setSuccess(`Custom email sent to ${individualCustomEmailData.guest.name}!`)
        setShowIndividualCustomEmailModal(false)
        setIndividualCustomEmailData({
          subject: "Jay and Ankita's Wedding Invitation",
          content: '',
          isPlainText: false,
          guest: null,
        })
        setTimeout(() => {
          setSuccess(null)
          setEmailSendingStatus(null)
        }, 3000)
      } else {
        setError(data.error || 'Failed to send custom email')
      }
    } catch (err) {
      console.error('Error sending individual custom email:', err)
      setError('An error occurred while sending custom email')
    } finally {
      setIsSendingEmail(false)
    }
  }

  const handleConfirmSendEmail = async (guest: Guest, customMessage?: string, customSubject?: string, isPlainText?: boolean) => {
    setIsSendingEmail(true)
    setEmailSendingStatus(null)
    setError(null)

    try {
      const response = await fetch('/api/admin/guest/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify({
          guestId: guest.id,
          customMessage,
          customSubject,
          isPlainText: isPlainText || false,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setEmailSendingStatus(`Email sent successfully to ${guest.email}`)
        setSuccess(`Email sent to ${guest.name}!`)
        setShowEmailPreviewModal(false)
        setTimeout(() => {
          setSuccess(null)
          setEmailSendingStatus(null)
        }, 3000)
      } else {
        setError(data.error || 'Failed to send email')
      }
    } catch (err) {
      console.error('Error sending email:', err)
      setError('An error occurred while sending email')
    } finally {
      setIsSendingEmail(false)
    }
  }

  const handleSendBulkInvitations = () => {
    const guestsWithEmail = normalizedGuests.filter(g => g.email && g.email.trim() !== '')
    
    if (guestsWithEmail.length === 0) {
      setError('No guests with email addresses found')
      return
    }

    // Show confirmation modal
    setShowBulkSendConfirm(true)
  }

  const handleConfirmBulkSend = async () => {
    const guestsWithEmail = normalizedGuests.filter(g => g.email && g.email.trim() !== '')
    
    setShowBulkSendConfirm(false)
    setIsSendingEmail(true)
    setEmailSendingStatus(null)
    setError(null)

    try {
      const response = await fetch('/api/admin/guest/email/send-bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify({}),
      })

      const data = await response.json()

      if (response.ok) {
        setEmailSendingStatus(`Sent: ${data.sent}, Failed: ${data.failed}, Skipped: ${data.skipped}`)
        setSuccess(`Bulk emails sent! ${data.sent} successful, ${data.failed} failed`)
        setTimeout(() => {
          setSuccess(null)
          setEmailSendingStatus(null)
        }, 5000)
      } else {
        setError(data.error || 'Failed to send bulk emails')
      }
    } catch (err) {
      console.error('Error sending bulk emails:', err)
      setError('An error occurred while sending bulk emails')
    } finally {
      setIsSendingEmail(false)
    }
  }

  const handleSendCustomMessage = async () => {
    if (!customEmailData.content.trim()) {
      setError('Please enter email content')
      return
    }

    const guestsWithEmail = normalizedGuests.filter(g => g.email && g.email.trim() !== '')
    
    if (guestsWithEmail.length === 0) {
      setError('No guests with email addresses found')
      return
    }

    if (!confirm(`Send custom message to ${guestsWithEmail.length} guest(s)?`)) {
      return
    }

    setIsSendingEmail(true)
    setEmailSendingStatus(null)
    setError(null)

    try {
      const response = await fetch('/api/admin/guest/email/send-custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify({
          subject: customEmailData.subject,
          htmlContent: customEmailData.isPlainText ? undefined : customEmailData.content,
          textContent: customEmailData.isPlainText ? customEmailData.content : undefined,
          isPlainText: customEmailData.isPlainText,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setEmailSendingStatus(`Sent: ${data.sent}, Failed: ${data.failed}, Skipped: ${data.skipped}`)
        setSuccess(`Custom emails sent! ${data.sent} successful, ${data.failed} failed`)
        setShowCustomMessageModal(false)
        setCustomEmailData({
          subject: "Jay and Ankita's Wedding Invitation",
          content: '',
          isPlainText: false,
          previewMode: 'editor',
        })
        setTimeout(() => {
          setSuccess(null)
          setEmailSendingStatus(null)
        }, 5000)
      } else {
        setError(data.error || 'Failed to send custom emails')
      }
    } catch (err) {
      console.error('Error sending custom emails:', err)
      setError('An error occurred while sending custom emails')
    } finally {
      setIsSendingEmail(false)
    }
  }

  const getEmailPreviewContent = (content: string, guest?: Guest, isPlainText: boolean = false): string => {
    // Handle empty content
    if (!content || !content.trim()) {
      return isPlainText 
        ? '(Empty content - preview will appear here when you enter text)'
        : '<p style="color: #999; font-style: italic;">(Empty content - preview will appear here when you enter HTML)</p>'
    }
    
    const baseUrl = getBaseUrl()
    const sampleGuest = guest || { name: 'John Doe', token: 'sample-token-123' }
    const inviteLink = `${baseUrl}/invite/${sampleGuest.token}`
    
    try {
      return replaceTemplateVariables(content, {
        guestName: sampleGuest.name,
        inviteLink,
        baseUrl,
      })
    } catch (error) {
      console.error('Error replacing template variables:', error)
      return content // Return original content if replacement fails
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
        cache: 'no-store',
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
    <div className="w-full -mx-4 sm:-mx-6 px-4 sm:px-6">
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
              📥 Export Excel
            </button>
            <button
              onClick={() => setShowResetAllConfirm(true)}
              disabled={isResetting || normalizedGuests.length === 0}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-all duration-200 shadow-md hover:shadow-lg text-sm sm:text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🔄 Reset All RSVPs
            </button>
            <button
              onClick={() => setShowDeleteAllConfirm(true)}
              disabled={isDeletingAll || normalizedGuests.length === 0}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all duration-200 shadow-md hover:shadow-lg text-sm sm:text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🗑️ Delete All Guests
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

        {/* Email Bulk Actions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-semibold text-wedding-navy">
              Email Actions
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleSendBulkInvitations}
                disabled={isSendingEmail}
                className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSendingEmail ? '⏳ Sending...' : '📧 Send Invitations to All'}
              </button>
              <button
                onClick={() => setShowCustomMessageModal(true)}
                disabled={isSendingEmail}
                className="bg-purple-600 text-white px-4 py-2 rounded text-sm hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                ✉️ Send Custom Message to All
              </button>
            </div>
          </div>
        </div>

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
                    RSVP: {filterRsvp === 'attending' ? '✓ Attending' : filterRsvp === 'not-attending' ? '✗ Not Attending' : '❓ Not Submitted'}
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
                        <p className="text-xs text-gray-500">Mehendi, Wedding & Reception</p>
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
                      <span className="text-wedding-gold">All Events (Mehendi, Wedding & Reception)</span>
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
      <div className="bg-white rounded-xl shadow-lg border-2 border-gray-300 overflow-hidden">
        <div 
          className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200"
          style={{ 
            WebkitOverflowScrolling: 'touch',
            touchAction: 'pan-x',
            scrollbarWidth: 'thin',
            maxHeight: 'calc(100vh - 300px)',
          }}
        >
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-2 sm:px-3 py-3 sm:py-4 text-left text-xs font-semibold text-wedding-navy uppercase tracking-wider border-b-2 border-gray-200 min-w-[40px] w-12">
                  <input
                    type="checkbox"
                    checked={selectedGuests.size === filteredGuests.length && filteredGuests.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300 text-wedding-gold focus:ring-wedding-gold"
                  />
                </th>
                <th className="px-2 sm:px-3 py-3 sm:py-4 text-left text-xs font-semibold text-wedding-navy uppercase tracking-wider border-b-2 border-gray-200 min-w-[100px] sm:min-w-[140px]">
                  Name
                </th>
                <th className="px-2 sm:px-3 py-3 sm:py-4 text-left text-xs font-semibold text-wedding-navy uppercase tracking-wider border-b-2 border-gray-200 min-w-[100px] sm:min-w-[130px]">
                  Phone
                </th>
                <th className="px-2 sm:px-3 py-3 sm:py-4 text-left text-xs font-semibold text-wedding-navy uppercase tracking-wider border-b-2 border-gray-200 min-w-[120px] sm:min-w-[180px]">
                  Email
                </th>
                <th className="px-2 sm:px-3 py-3 sm:py-4 text-left text-xs font-semibold text-wedding-navy uppercase tracking-wider border-b-2 border-gray-200 min-w-[90px] sm:min-w-[120px]">
                  Event Type
                </th>
                <th className="px-2 sm:px-3 py-3 sm:py-4 text-left text-xs font-semibold text-wedding-navy uppercase tracking-wider border-b-2 border-gray-200 min-w-[60px] sm:min-w-[80px]">
                  Devices
                </th>
                <th className="px-2 sm:px-3 py-3 sm:py-4 text-left text-xs font-semibold text-wedding-navy uppercase tracking-wider border-b-2 border-gray-200 min-w-[100px] sm:min-w-[140px]">
                  Menu Preference
                </th>
                <th className="px-2 sm:px-3 py-3 sm:py-4 text-left text-xs font-semibold text-wedding-navy uppercase tracking-wider border-b-2 border-gray-200 min-w-[120px] sm:min-w-[160px]">
                  RSVP Status
                </th>
                <th className="px-2 sm:px-3 py-3 sm:py-4 text-left text-xs font-semibold text-wedding-navy uppercase tracking-wider border-b-2 border-gray-200 min-w-[200px] sm:min-w-[280px] sticky right-0 bg-gradient-to-r from-gray-50 to-gray-100 z-10 shadow-[0_0_8px_rgba(0,0,0,0.1)] backdrop-blur-sm">
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
                  <td className="px-2 sm:px-3 py-3 sm:py-4">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectGuest(guest.id)}
                      className="rounded border-gray-300 text-wedding-gold focus:ring-wedding-gold"
                    />
                  </td>
                  <td className="px-2 sm:px-3 py-3 sm:py-4 text-xs sm:text-sm font-medium text-gray-900">
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
                        className="font-semibold cursor-pointer hover:text-wedding-gold truncate"
                        onDoubleClick={() => handleInlineEdit(guest, 'name')}
                        title={`Double-click to edit: ${guest.name}`}
                      >
                        {guest.name}
                      </div>
                    )}
                    <div className="text-gray-500 text-xs md:hidden mt-1">
                      {guest.phone ? `Phone: ${guest.phone}` : ''}
                      {guest.phone && guest.email ? ' | ' : ''}
                      {guest.email ? `Email: ${guest.email}` : ''}
                      {!guest.phone && !guest.email ? 'No contact info' : ''}
                    </div>
                  </td>
                  <td className="px-2 sm:px-3 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
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
                  <td className="px-2 sm:px-3 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 truncate" title={guest.email || 'Not set'}>
                    {guest.email || 'Not set'}
                  </td>
                  <td className="px-2 sm:px-3 py-3 sm:py-4 whitespace-nowrap">
                    <EventTypeBadge eventAccess={guest.eventAccess} size="sm" />
                  </td>
                  <td className="px-2 sm:px-3 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 text-center">
                    <button
                      onClick={() => handleDeviceCountClick(guest)}
                      className="cursor-pointer hover:text-wedding-gold hover:underline transition-colors"
                      title="Click to manage devices"
                    >
                      {deviceCount} / {guest.maxDevicesAllowed}
                    </button>
                  </td>
                  <td className="px-2 sm:px-3 py-3 sm:py-4 whitespace-nowrap">
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
                    className="px-2 sm:px-3 py-3 sm:py-4 cursor-pointer hover:bg-gray-50"
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
                  <td className={`px-2 sm:px-3 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium sticky right-0 z-10 border-l-2 border-gray-300 ${isSelected ? 'bg-wedding-gold-light/10' : 'bg-white'} hover:bg-gray-50 shadow-[0_0_8px_rgba(0,0,0,0.1)] backdrop-blur-sm`}>
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-start">
                        <button
                          onClick={() => copyLink(guest.token)}
                          className="group relative text-wedding-gold hover:text-wedding-navy text-xs sm:text-sm px-2.5 sm:px-2 py-2 sm:py-1.5 border border-wedding-gold rounded hover:bg-wedding-gold-light/10 transition-colors flex items-center gap-1 sm:gap-1.5 min-w-[44px] min-h-[44px] sm:min-w-[70px] sm:min-h-0 justify-center touch-manipulation"
                          title="Copy Invitation Link"
                        >
                          <span className="text-base sm:text-base">📋</span>
                          <span className="hidden lg:inline">Copy</span>
                          <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-20 transition-opacity">
                            Copy Link
                          </span>
                        </button>
                        <button
                          onClick={() => handleQuickToggleEventType(guest.id, guest.eventAccess)}
                          className="group relative text-blue-600 hover:text-blue-800 text-xs sm:text-sm px-2.5 sm:px-2 py-2 sm:py-1.5 border border-blue-200 rounded hover:bg-blue-50 transition-colors flex items-center gap-1 sm:gap-1.5 min-w-[44px] min-h-[44px] sm:min-w-[70px] sm:min-h-0 justify-center touch-manipulation"
                          title="Toggle Event Type"
                        >
                          <span className="text-base sm:text-base">🔄</span>
                          <span className="hidden lg:inline">Toggle</span>
                          <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-20 transition-opacity">
                            Toggle Event Type
                          </span>
                        </button>
                        <button
                          onClick={() => {
                            window.open(`/admin/preview/${guest.token}`, '_blank')
                          }}
                          className="group relative text-purple-600 hover:text-purple-800 text-xs sm:text-sm px-2.5 sm:px-2 py-2 sm:py-1.5 border border-purple-200 rounded hover:bg-purple-50 transition-colors flex items-center gap-1 sm:gap-1.5 min-w-[44px] min-h-[44px] sm:min-w-[70px] sm:min-h-0 justify-center touch-manipulation"
                          title="Preview Invitation"
                        >
                          <span className="text-base sm:text-base">👁️</span>
                          <span className="hidden lg:inline">Preview</span>
                          <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-20 transition-opacity">
                            Preview Invitation
                          </span>
                        </button>
                        <button
                          onClick={() => handleEditClick(guest)}
                          className="group relative text-green-600 hover:text-green-800 text-xs sm:text-sm px-2.5 sm:px-2 py-2 sm:py-1.5 border border-green-200 rounded hover:bg-green-50 transition-colors flex items-center gap-1 sm:gap-1.5 min-w-[44px] min-h-[44px] sm:min-w-[70px] sm:min-h-0 justify-center touch-manipulation"
                          title="Edit Guest"
                        >
                          <span className="text-base sm:text-base">✏️</span>
                          <span className="hidden lg:inline">Edit</span>
                          <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-20 transition-opacity">
                            Edit Guest
                          </span>
                        </button>
                        <button
                          onClick={() => handleDeleteGuest(guest.id, guest.name)}
                          className="group relative text-red-600 hover:text-red-800 text-xs sm:text-sm px-2.5 sm:px-2 py-2 sm:py-1.5 border border-red-200 rounded hover:bg-red-50 transition-colors flex items-center gap-1 sm:gap-1.5 min-w-[44px] min-h-[44px] sm:min-w-[70px] sm:min-h-0 justify-center touch-manipulation"
                          title="Delete Guest"
                        >
                          <span className="text-base sm:text-base">🗑️</span>
                          <span className="hidden lg:inline">Delete</span>
                          <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-20 transition-opacity">
                            Delete Guest
                          </span>
                        </button>
                        {(guest.rsvpSubmitted || guest.preferencesSubmitted) && (
                          <button
                            onClick={() => handleResetRsvpForGuest(guest)}
                            disabled={isResetting}
                            className="group relative text-orange-600 hover:text-orange-800 text-xs sm:text-sm px-2.5 sm:px-2 py-2 sm:py-1.5 border border-orange-200 rounded hover:bg-orange-50 transition-colors flex items-center gap-1 sm:gap-1.5 min-w-[44px] min-h-[44px] sm:min-w-[70px] sm:min-h-0 justify-center disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                            title="Reset RSVP"
                          >
                            <span className="text-base sm:text-base">🔄</span>
                            <span className="hidden lg:inline">Reset</span>
                            <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-20 transition-opacity">
                              Reset RSVP
                            </span>
                          </button>
                        )}
                      </div>
                      <div className="mt-0.5 flex flex-wrap gap-1.5 sm:gap-2">
                        <WhatsAppShare
                          guestName={guest.name}
                          guestToken={guest.token}
                          guestPhone={guest.phone}
                        />
                        {guest.email && (
                          <button
                            onClick={() => handleSendEmailToGuest(guest)}
                            className="group relative bg-blue-500 hover:bg-blue-600 text-white px-3 sm:px-2.5 py-2.5 sm:py-1.5 rounded text-xs sm:text-xs font-semibold transition-colors flex items-center gap-1.5 justify-center whitespace-nowrap min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 w-full sm:w-auto touch-manipulation"
                            title="Send Invitation Email"
                          >
                            <span className="text-base sm:text-base">📧</span>
                            <span>Email</span>
                            <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-20 transition-opacity">
                              Send Invitation Email
                            </span>
                          </button>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
              </table>
            </div>
          </div>
        </div>
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
                          mehndi: 'Mehndi',
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

      {/* Email Preview Modal (Single Guest) */}
      <AnimatePresence>
        {showEmailPreviewModal && emailPreviewGuest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => !isSendingEmail && setShowEmailPreviewModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-serif text-wedding-navy">
                    Email Preview - {emailPreviewGuest.name}
                  </h3>
                  <button
                    onClick={() => !isSendingEmail && setShowEmailPreviewModal(false)}
                    disabled={isSendingEmail}
                    className="text-gray-500 hover:text-gray-700 text-2xl disabled:opacity-50"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      value="Jay and Ankita's Wedding Invitation"
                      readOnly
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Email Preview (with actual guest data)
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEmailPreviewZoom(Math.max(50, emailPreviewZoom - 25))}
                          className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded border border-gray-300"
                          title="Zoom Out"
                        >
                          −
                        </button>
                        <span className="text-xs text-gray-600 min-w-[50px] text-center">{emailPreviewZoom}%</span>
                        <button
                          onClick={() => setEmailPreviewZoom(Math.min(200, emailPreviewZoom + 25))}
                          className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded border border-gray-300"
                          title="Zoom In"
                        >
                          +
                        </button>
                        <button
                          onClick={() => {
                            const content = getEmailPreviewContent(
                              getDefaultInvitationHTML(emailPreviewGuest.eventAccess || ['mehndi', 'wedding', 'reception']),
                              emailPreviewGuest,
                              false
                            )
                            setFullScreenPreviewContent(content)
                            setShowFullScreenPreview(true)
                          }}
                          className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 rounded border border-blue-300 text-blue-700"
                          title="Full Screen"
                        >
                          ⛶
                        </button>
                        <button
                          onClick={() => setEmailPreviewZoom(100)}
                          className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded border border-gray-300"
                          title="Reset Zoom"
                        >
                          ↺
                        </button>
                      </div>
                    </div>
                    <div className="border border-gray-300 rounded-lg p-4 bg-white overflow-auto" style={{ maxHeight: '500px' }}>
                      <div
                        dangerouslySetInnerHTML={{
                          __html: getEmailPreviewContent(
                            getDefaultInvitationHTML(emailPreviewGuest.eventAccess || ['mehndi', 'wedding', 'reception']),
                            emailPreviewGuest,
                            false
                          ),
                        }}
                        style={{ 
                          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                          transform: `scale(${emailPreviewZoom / 100})`,
                          transformOrigin: 'top left',
                          width: `${100 / (emailPreviewZoom / 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      <strong>To:</strong> {emailPreviewGuest.email}
                    </p>
                  </div>

                  <div className="flex gap-3 pt-4 border-t">
                    <button
                      onClick={() => !isSendingEmail && setShowEmailPreviewModal(false)}
                      disabled={isSendingEmail}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleConfirmSendEmail(emailPreviewGuest)}
                      disabled={isSendingEmail}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isSendingEmail ? (
                        <>
                          <span>⏳</span>
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <span>📧</span>
                          <span>Send Email</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Message Modal */}
      <AnimatePresence>
        {showCustomMessageModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => !isSendingEmail && setShowCustomMessageModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-serif text-wedding-navy">
                    Send Custom Message to All Guests
                  </h3>
                  <button
                    onClick={() => !isSendingEmail && setShowCustomMessageModal(false)}
                    disabled={isSendingEmail}
                    className="text-gray-500 hover:text-gray-700 text-2xl disabled:opacity-50"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={customEmailData.subject}
                      onChange={(e) => setCustomEmailData({ ...customEmailData, subject: e.target.value })}
                      disabled={isSendingEmail}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wedding-gold focus:border-transparent disabled:opacity-50"
                      placeholder="Email subject"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Content Type
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={customEmailData.isPlainText}
                          onChange={(e) => setCustomEmailData({ ...customEmailData, isPlainText: e.target.checked })}
                          disabled={isSendingEmail}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-600">Plain Text Mode</span>
                      </label>
                    </div>
                  </div>

                  {/* Help Section for HTML Templates */}
                  {!customEmailData.isPlainText && (
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-blue-900 mb-2">📝 Available Template Variables:</h4>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="bg-white rounded p-2 border border-blue-100">
                          <code className="text-blue-700 font-mono">{'{{'}params.guestName{'}}'}</code>
                          <span className="text-gray-600 ml-2">→ Guest&apos;s name (e.g., &quot;John Doe&quot;)</span>
                        </div>
                        <div className="bg-white rounded p-2 border border-blue-100">
                          <code className="text-blue-700 font-mono">{'{{'}params.inviteLink{'}}'}</code>
                          <span className="text-gray-600 ml-2">→ Personalized invitation URL</span>
                        </div>
                        <div className="bg-white rounded p-2 border border-blue-100">
                          <code className="text-blue-700 font-mono">{'{{'}params.baseUrl{'}}'}</code>
                          <span className="text-gray-600 ml-2">→ Website base URL</span>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-blue-200">
                        <p className="text-xs text-blue-800 mb-2">
                          <strong>💡 Tip:</strong> Don&apos;t know HTML? Use ChatGPT to generate your email template!
                        </p>
                        <details className="text-xs">
                          <summary className="cursor-pointer text-blue-700 hover:text-blue-900 font-semibold mb-2">
                            📋 Click to copy ChatGPT prompt
                          </summary>
                          <div className="bg-white rounded p-3 border border-blue-200 mt-2">
                            <p className="text-gray-700 mb-2 font-semibold">Copy this prompt to ChatGPT:</p>
                            <textarea
                              readOnly
                              value={`I need you to create a beautiful, responsive HTML email template for wedding invitations. The email will be sent via Brevo (Sendinblue) transactional email API.

REQUIREMENTS:

1. TEMPLATE VARIABLES (MUST USE THESE):
   - {{params.guestName}} - Will be replaced with the guest's FULL NAME (first and last name), not just the first name
   - {{params.inviteLink}} - Will be replaced with the personalized invitation link (e.g., https://example.com/invite/abc123xyz)
   - {{params.baseUrl}} - Will be replaced with the website base URL

2. EMAIL-SAFE HTML:
   - Use inline CSS styles (email clients don't support external stylesheets)
   - Use table-based layouts for better email client compatibility
   - Avoid CSS Grid and Flexbox (use tables instead)
   - Use web-safe fonts (Arial, Helvetica, Georgia, Times New Roman)
   - Maximum width: 600px for email body
   - Use hex colors (e.g., #D4AF37 for gold, #8B4513 for brown)

3. DESIGN REQUIREMENTS:
   - Wedding theme with elegant, warm colors
   - Gold (#D4AF37) and rose (#D4A5A5) accents
   - Professional and celebratory tone
   - Mobile-responsive (use media queries in <style> tag)
   - Include a prominent call-to-action button for the invitation link

4. DEFAULT CONTENT STRUCTURE:
   Use this as the default content format (you can modify it if needed):
   
   Dear {{params.guestName}},
   The parents of Jay and Ankita request the honor of your presence at their son and daughter's wedding.
   You are invited to Jay and Ankita's wedding celebration! 
   Below is your personalized invitation link to RSVP: 
   
   {{params.inviteLink}}
   
   Please RSVP latest by January 10, 2026.
   
   With love and warm regards,
   Bhavan & Nina Mehta
   Brijesh Kumar & Ruchira Sharma
   
   NOTE: {{params.guestName}} will be replaced with the guest's FULL NAME (first and last name), not just the first name.

5. TECHNICAL:
   - Must be valid HTML5
   - All styles must be inline or in a <style> tag in the <head>
   - Use <table> for layout structure
   - Test for email client compatibility (Gmail, Outlook, Apple Mail)
   - Do not use emojis in the email body

Please generate a complete, production-ready HTML email template that I can use directly. Make it beautiful, professional, and wedding-appropriate.`}
                              rows={20}
                              className="w-full p-2 text-xs font-mono bg-gray-50 border border-gray-300 rounded resize-none"
                              onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                            />
                            <button
                              onClick={() => {
                                const textarea = document.querySelector('textarea[readonly]') as HTMLTextAreaElement
                                if (textarea) {
                                  textarea.select()
                                  navigator.clipboard.writeText(textarea.value)
                                  setSuccess('ChatGPT prompt copied to clipboard!')
                                  setTimeout(() => setSuccess(null), 3000)
                                }
                              }}
                              className="mt-2 text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 transition-colors"
                            >
                              📋 Copy Prompt
                            </button>
                          </div>
                        </details>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Editor Tab */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          {customEmailData.isPlainText ? 'Plain Text Content' : 'HTML Content'}
                        </label>
                      </div>
                      <textarea
                        value={customEmailData.content}
                        onChange={(e) => setCustomEmailData({ ...customEmailData, content: e.target.value })}
                        disabled={isSendingEmail}
                        rows={15}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wedding-gold focus:border-transparent font-mono text-sm disabled:opacity-50"
                        placeholder={
                          customEmailData.isPlainText
                            ? `Hi {{params.guestName}}👋\n\nYou are invited...\n\n{{params.inviteLink}}`
                            : `<html><body><p>Hi {{params.guestName}}👋</p><p>You are invited...</p><p><a href="{{params.inviteLink}}">View Invitation</a></p></body></html>`
                        }
                      />
                    </div>

                    {/* Preview Tab */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Preview (with sample data - {'{{'}params.guestName{'}}'} will be replaced with each guest&apos;s name when sent)
                        </label>
                        {!customEmailData.isPlainText && customEmailData.content.trim() && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setEmailPreviewZoom(Math.max(50, emailPreviewZoom - 25))}
                              className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded border border-gray-300"
                              title="Zoom Out"
                            >
                              −
                            </button>
                            <span className="text-xs text-gray-600 min-w-[50px] text-center">{emailPreviewZoom}%</span>
                            <button
                              onClick={() => setEmailPreviewZoom(Math.min(200, emailPreviewZoom + 25))}
                              className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded border border-gray-300"
                              title="Zoom In"
                            >
                              +
                            </button>
                            <button
                              onClick={() => {
                                const content = getEmailPreviewContent(customEmailData.content, undefined, false)
                                setFullScreenPreviewContent(content)
                                setShowFullScreenPreview(true)
                              }}
                              className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 rounded border border-blue-300 text-blue-700"
                              title="Full Screen"
                            >
                              ⛶
                            </button>
                            <button
                              onClick={() => setEmailPreviewZoom(100)}
                              className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded border border-gray-300"
                              title="Reset Zoom"
                            >
                              ↺
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="border border-gray-300 rounded-lg p-4 bg-white overflow-auto min-h-[200px]" style={{ maxHeight: '500px' }}>
                        {customEmailData.isPlainText ? (
                          <pre className="whitespace-pre-wrap font-sans text-sm text-gray-800">
                            {getEmailPreviewContent(customEmailData.content, undefined, true)}
                          </pre>
                        ) : customEmailData.content.trim() ? (
                          <div
                            dangerouslySetInnerHTML={{
                              __html: getEmailPreviewContent(customEmailData.content, undefined, false),
                            }}
                            style={{ 
                              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                              lineHeight: '1.6',
                              transform: `scale(${emailPreviewZoom / 100})`,
                              transformOrigin: 'top left',
                              width: `${100 / (emailPreviewZoom / 100)}%`,
                            }}
                          />
                        ) : (
                          <p className="text-gray-400 italic text-sm">(Empty content - preview will appear here when you enter HTML)</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                      <strong>Note:</strong> This will send the email to all guests who have an email address. The variables {'{{'}params.guestName{'}}'} and {'{{'}params.inviteLink{'}}'} will be automatically replaced with each guest&apos;s information.
                    </p>
                  </div>

                  <div className="flex gap-3 pt-4 border-t">
                    <button
                      onClick={() => !isSendingEmail && setShowCustomMessageModal(false)}
                      disabled={isSendingEmail}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSendCustomMessage}
                      disabled={isSendingEmail || !customEmailData.content.trim()}
                      className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSendingEmail ? (
                        <>
                          <span>⏳</span>
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <span>✉️</span>
                          <span>Send to All Guests</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reset RSVP Confirmation Dialog - Individual */}
      <AnimatePresence>
        {resetConfirmGuest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => !isResetting && setResetConfirmGuest(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-serif text-wedding-navy mb-4">
                Reset RSVP
              </h3>
              <p className="text-gray-700 mb-6">
                Are you sure you want to reset RSVP for <strong>{resetConfirmGuest.name}</strong>? 
                This will clear all RSVP data and allow them to resubmit.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setResetConfirmGuest(null)}
                  disabled={isResetting}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmResetRsvp}
                  disabled={isResetting}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isResetting ? (
                    <>
                      <span>⏳</span>
                      <span>Resetting...</span>
                    </>
                  ) : (
                    <>
                      <span>🔄</span>
                      <span>Reset RSVP</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reset All RSVPs Confirmation Dialog */}
      <AnimatePresence>
        {showResetAllConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => !isResetting && setShowResetAllConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-serif text-wedding-navy mb-4">
                Reset All RSVPs
              </h3>
              <p className="text-gray-700 mb-2">
                Are you sure you want to reset RSVPs for <strong>ALL {normalizedGuests.length} guests</strong>?
              </p>
              <p className="text-red-600 font-semibold mb-6">
                This action cannot be undone. All RSVP data will be cleared and guests will be able to resubmit.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowResetAllConfirm(false)}
                  disabled={isResetting}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResetAllRsvps}
                  disabled={isResetting}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isResetting ? (
                    <>
                      <span>⏳</span>
                      <span>Resetting...</span>
                    </>
                  ) : (
                    <>
                      <span>🔄</span>
                      <span>Reset All RSVPs</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Email Choice Modal */}
      <AnimatePresence>
        {showEmailChoiceModal && emailChoiceGuest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => {
              if (!isSendingEmail) {
                setShowEmailChoiceModal(false)
                setEmailChoiceGuest(null)
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-serif text-wedding-navy mb-2">
                Send Email to {emailChoiceGuest.name}
              </h3>
              <p className="text-gray-600 mb-6 text-sm">
                How would you like to send the email?
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => handleSendDefaultInvitation(emailChoiceGuest)}
                  disabled={isSendingEmail}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>📧</span>
                  <span>Send Default Invitation</span>
                </button>
                <button
                  onClick={() => handleOpenCustomMessageEditor(emailChoiceGuest)}
                  disabled={isSendingEmail}
                  className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>✉️</span>
                  <span>Create Custom Message</span>
                </button>
                <button
                  onClick={() => { setShowEmailChoiceModal(false); setEmailChoiceGuest(null) }}
                  disabled={isSendingEmail}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Individual Custom Email Modal */}
      <AnimatePresence>
        {showIndividualCustomEmailModal && individualCustomEmailData.guest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => !isSendingEmail && setShowIndividualCustomEmailModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-2xl font-serif text-wedding-navy">
                      Send Custom Email to {individualCustomEmailData.guest.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {individualCustomEmailData.guest.email}
                    </p>
                  </div>
                  <button
                    onClick={() => !isSendingEmail && setShowIndividualCustomEmailModal(false)}
                    disabled={isSendingEmail}
                    className="text-gray-500 hover:text-gray-700 text-2xl disabled:opacity-50"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={individualCustomEmailData.subject}
                      onChange={(e) => setIndividualCustomEmailData({ ...individualCustomEmailData, subject: e.target.value })}
                      disabled={isSendingEmail}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wedding-gold focus:border-transparent disabled:opacity-50"
                      placeholder="Email subject"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Content Type
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={individualCustomEmailData.isPlainText}
                          onChange={(e) => setIndividualCustomEmailData({ ...individualCustomEmailData, isPlainText: e.target.checked })}
                          disabled={isSendingEmail}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-600">Plain Text Mode</span>
                      </label>
                    </div>
                  </div>

                  {/* Help Section for HTML Templates */}
                  {!individualCustomEmailData.isPlainText && (
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-blue-900 mb-2">📝 Available Template Variables:</h4>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="bg-white rounded p-2 border border-blue-100">
                          <code className="text-blue-700 font-mono">{'{{'}params.guestName{'}}'}</code>
                          <span className="text-gray-600 ml-2">→ Guest&apos;s name (e.g., &quot;{individualCustomEmailData.guest.name}&quot;)</span>
                        </div>
                        <div className="bg-white rounded p-2 border border-blue-100">
                          <code className="text-blue-700 font-mono">{'{{'}params.inviteLink{'}}'}</code>
                          <span className="text-gray-600 ml-2">→ Personalized invitation URL</span>
                        </div>
                        <div className="bg-white rounded p-2 border border-blue-100">
                          <code className="text-blue-700 font-mono">{'{{'}params.baseUrl{'}}'}</code>
                          <span className="text-gray-600 ml-2">→ Website base URL</span>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-blue-200">
                        <p className="text-xs text-blue-800 mb-2">
                          <strong>💡 Tip:</strong> Don&apos;t know HTML? Use ChatGPT to generate your email template!
                        </p>
                        <details className="text-xs">
                          <summary className="cursor-pointer text-blue-700 hover:text-blue-900 font-semibold mb-2">
                            📋 Click to copy ChatGPT prompt
                          </summary>
                          <div className="bg-white rounded p-3 border border-blue-200 mt-2">
                            <p className="text-gray-700 mb-2 font-semibold">Copy this prompt to ChatGPT:</p>
                            <textarea
                              readOnly
                              value={`I need you to create a beautiful, responsive HTML email template for wedding invitations. The email will be sent via Brevo (Sendinblue) transactional email API.

REQUIREMENTS:

1. TEMPLATE VARIABLES (MUST USE THESE):
   - {{params.guestName}} - Will be replaced with the guest's FULL NAME (first and last name), not just the first name
   - {{params.inviteLink}} - Will be replaced with the personalized invitation link (e.g., https://example.com/invite/abc123xyz)
   - {{params.baseUrl}} - Will be replaced with the website base URL

2. EMAIL-SAFE HTML:
   - Use inline CSS styles (email clients don't support external stylesheets)
   - Use table-based layouts for better email client compatibility
   - Avoid CSS Grid and Flexbox (use tables instead)
   - Use web-safe fonts (Arial, Helvetica, Georgia, Times New Roman)
   - Maximum width: 600px for email body
   - Use hex colors (e.g., #D4AF37 for gold, #8B4513 for brown)

3. DESIGN REQUIREMENTS:
   - Wedding theme with elegant, warm colors
   - Gold (#D4AF37) and rose (#D4A5A5) accents
   - Professional and celebratory tone
   - Mobile-responsive (use media queries in <style> tag)
   - Include a prominent call-to-action button for the invitation link

4. DEFAULT CONTENT STRUCTURE:
   Use this as the default content format (you can modify it if needed):
   
   Dear {{params.guestName}},
   The parents of Jay and Ankita request the honor of your presence at their son and daughter's wedding.
   You are invited to Jay and Ankita's wedding celebration! 
   Below is your personalized invitation link to RSVP: 
   
   {{params.inviteLink}}
   
   Please RSVP latest by January 10, 2026.
   
   With love and warm regards,
   Bhavan & Nina Mehta
   Brijesh Kumar & Ruchira Sharma
   
   NOTE: {{params.guestName}} will be replaced with the guest's FULL NAME (first and last name), not just the first name.

5. TECHNICAL:
   - Must be valid HTML5
   - All styles must be inline or in a <style> tag in the <head>
   - Use <table> for layout structure
   - Test for email client compatibility (Gmail, Outlook, Apple Mail)
   - Do not use emojis in the email body

Please generate a complete, production-ready HTML email template that I can use directly. Make it beautiful, professional, and wedding-appropriate.`}
                              rows={20}
                              className="w-full p-2 text-xs font-mono bg-gray-50 border border-gray-300 rounded resize-none"
                              onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                            />
                            <button
                              onClick={() => {
                                const textarea = document.querySelector('textarea[readonly]') as HTMLTextAreaElement
                                if (textarea) {
                                  textarea.select()
                                  navigator.clipboard.writeText(textarea.value)
                                  setSuccess('ChatGPT prompt copied to clipboard!')
                                  setTimeout(() => setSuccess(null), 3000)
                                }
                              }}
                              className="mt-2 text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 transition-colors"
                            >
                              📋 Copy Prompt
                            </button>
                          </div>
                        </details>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Editor Tab */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          {individualCustomEmailData.isPlainText ? 'Plain Text Content' : 'HTML Content'}
                        </label>
                      </div>
                      <textarea
                        value={individualCustomEmailData.content}
                        onChange={(e) => setIndividualCustomEmailData({ ...individualCustomEmailData, content: e.target.value })}
                        disabled={isSendingEmail}
                        rows={15}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wedding-gold focus:border-transparent font-mono text-sm disabled:opacity-50"
                        placeholder={
                          individualCustomEmailData.isPlainText
                            ? `Hi {{params.guestName}}👋\n\nYou are invited...\n\n{{params.inviteLink}}`
                            : `<html><body><p>Hi {{params.guestName}}👋</p><p>You are invited...</p><p><a href="{{params.inviteLink}}">View Invitation</a></p></body></html>`
                        }
                      />
                    </div>

                    {/* Preview Tab */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Preview (with {individualCustomEmailData.guest.name}&apos;s actual data)
                        </label>
                        {!individualCustomEmailData.isPlainText && individualCustomEmailData.content.trim() && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setEmailPreviewZoom(Math.max(50, emailPreviewZoom - 25))}
                              className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded border border-gray-300"
                              title="Zoom Out"
                            >
                              −
                            </button>
                            <span className="text-xs text-gray-600 min-w-[50px] text-center">{emailPreviewZoom}%</span>
                            <button
                              onClick={() => setEmailPreviewZoom(Math.min(200, emailPreviewZoom + 25))}
                              className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded border border-gray-300"
                              title="Zoom In"
                            >
                              +
                            </button>
                            <button
                              onClick={() => {
                                const content = getEmailPreviewContent(individualCustomEmailData.content, individualCustomEmailData.guest || undefined, false)
                                setFullScreenPreviewContent(content)
                                setShowFullScreenPreview(true)
                              }}
                              className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 rounded border border-blue-300 text-blue-700"
                              title="Full Screen"
                            >
                              ⛶
                            </button>
                            <button
                              onClick={() => setEmailPreviewZoom(100)}
                              className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded border border-gray-300"
                              title="Reset Zoom"
                            >
                              ↺
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="border border-gray-300 rounded-lg p-4 bg-white overflow-auto min-h-[200px]" style={{ maxHeight: '500px' }}>
                        {individualCustomEmailData.isPlainText ? (
                          <pre className="whitespace-pre-wrap font-sans text-sm text-gray-800">
                            {getEmailPreviewContent(individualCustomEmailData.content, individualCustomEmailData.guest || undefined, true)}
                          </pre>
                        ) : individualCustomEmailData.content.trim() ? (
                          <div
                            dangerouslySetInnerHTML={{
                              __html: getEmailPreviewContent(individualCustomEmailData.content, individualCustomEmailData.guest || undefined, false),
                            }}
                            style={{ 
                              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                              lineHeight: '1.6',
                              transform: `scale(${emailPreviewZoom / 100})`,
                              transformOrigin: 'top left',
                              width: `${100 / (emailPreviewZoom / 100)}%`,
                            }}
                          />
                        ) : (
                          <p className="text-gray-400 italic text-sm">(Empty content - preview will appear here when you enter HTML)</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      <strong>To:</strong> {individualCustomEmailData.guest.email}
                    </p>
                    <p className="text-xs text-blue-700 mt-1">
                      The variables {'{{'}params.guestName{'}}'} and {'{{'}params.inviteLink{'}}'} will be automatically replaced with {individualCustomEmailData.guest.name}&apos;s information.
                    </p>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4 border-t">
                    <button
                      onClick={() => {
                        if (!isSendingEmail) {
                          setShowIndividualCustomEmailModal(false)
                          setError(null)
                        }
                      }}
                      disabled={isSendingEmail}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmSendIndividualCustomEmail}
                      disabled={isSendingEmail || !individualCustomEmailData.content.trim() || !individualCustomEmailData.subject.trim()}
                      className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSendingEmail ? (
                        <>
                          <span>⏳</span>
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <span>✉️</span>
                          <span>Send Email</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete All Guests Confirmation Dialog */}
      <AnimatePresence>
        {showDeleteAllConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => !isDeletingAll && setShowDeleteAllConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-serif text-wedding-navy mb-4">
                Delete All Guests
              </h3>
              <p className="text-gray-700 mb-2">
                Are you sure you want to delete <strong>ALL {normalizedGuests.length} guests</strong>?
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-800 font-semibold mb-2">⚠️ This action cannot be undone!</p>
                <p className="text-sm text-red-700">
                  This will permanently delete:
                </p>
                <ul className="text-sm text-red-700 list-disc list-inside mt-2 space-y-1">
                  <li>All guest information (names, emails, phones)</li>
                  <li>All RSVP data and responses</li>
                  <li>All preferences and dietary restrictions</li>
                  <li>All device access records</li>
                  <li>All invitation tokens</li>
                </ul>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteAllConfirm(false)}
                  disabled={isDeletingAll}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAllGuests}
                  disabled={isDeletingAll}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isDeletingAll ? (
                    <>
                      <span>⏳</span>
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <span>🗑️</span>
                      <span>Delete All</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bulk Send Invitations Confirmation Dialog */}
      <AnimatePresence>
        {showBulkSendConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => !isSendingEmail && setShowBulkSendConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-serif text-wedding-navy mb-4">
                Send Invitations to All Guests
              </h3>
              <p className="text-gray-700 mb-4">
                Are you sure you want to send default invitation emails to <strong>{normalizedGuests.filter(g => g.email && g.email.trim() !== '').length} guest(s)</strong>?
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-blue-800 font-semibold mb-2">📧 Email Details:</p>
                <ul className="text-sm text-blue-700 list-disc list-inside mt-2 space-y-1">
                  <li>Default invitation template will be used</li>
                  <li>Each guest will receive a personalized invitation link</li>
                  <li>Only guests with email addresses will receive emails</li>
                </ul>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowBulkSendConfirm(false)}
                  disabled={isSendingEmail}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmBulkSend}
                  disabled={isSendingEmail}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSendingEmail ? (
                    <>
                      <span>⏳</span>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <span>📧</span>
                      <span>Send Invitations</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

