import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-auth'
import { generateSecureToken, ensureJsonArray, setNoCacheHeaders } from '@/lib/utils'
const XLSX = require('xlsx')

// Expected Excel format:
// Column A: Name (required)
// Column B: Phone (optional)
// Column C: Email (optional)
// Column D: Event Access (required: "all-events" or "reception-only")
// Column E: Max Devices Allowed (optional, default: 10)

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      const response = NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      )
      return setNoCacheHeaders(response)
    }

    // Validate file type
    const isValidFileType =
      file.name.endsWith('.xlsx') ||
      file.name.endsWith('.xls') ||
      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.type === 'application/vnd.ms-excel'

    if (!isValidFileType) {
      const response = NextResponse.json(
        { error: 'Invalid file type. Please upload an Excel file (.xlsx or .xls)' },
        { status: 400 }
      )
      return setNoCacheHeaders(response)
    }

    // Read file buffer
    const arrayBuffer = await file.arrayBuffer()
    const workbook = XLSX.read(arrayBuffer, { type: 'array' })
    
    // Get first sheet
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    
    // Convert to JSON
    const data = XLSX.utils.sheet_to_json(worksheet, { 
      header: ['name', 'phone', 'email', 'eventAccess', 'maxDevicesAllowed'],
      defval: null,
      raw: false
    })

    if (!Array.isArray(data) || data.length === 0) {
      const response = NextResponse.json(
        { error: 'Excel file is empty or invalid format' },
        { status: 400 }
      )
      return setNoCacheHeaders(response)
    }

    const results = {
      success: [] as any[],
      errors: [] as any[],
      skipped: [] as any[],
    }

    // Process each row
    for (let i = 0; i < data.length; i++) {
      const row = data[i] as any
      const rowNumber = i + 2 // +2 because row 1 is header, and arrays are 0-indexed

      try {
        // Validate name
        if (!row.name || typeof row.name !== 'string' || row.name.trim() === '') {
          results.errors.push({
            row: rowNumber,
            name: row.name || '(empty)',
            error: 'Name is required',
          })
          continue
        }

        const name = row.name.trim()

        // Parse event access - now only two types: "all-events" or "reception-only"
        let eventAccessType: 'all-events' | 'reception-only' = 'all-events'
        
        // Handle event access with better type coercion and validation
        if (row.eventAccess !== null && row.eventAccess !== undefined && row.eventAccess !== '') {
          // Convert to string and normalize (handle numbers, booleans, etc.)
          const rawValue = row.eventAccess
          const accessValue = String(rawValue)
            .replace(/\s+/g, ' ') // Replace all whitespace (tabs, newlines, etc.) with single space
            .trim()
            .toLowerCase()
          
          // Check for valid values (with various accepted formats)
          if (accessValue === 'all-events' || accessValue === 'all events' || accessValue === 'all' || accessValue === 'allevents') {
            eventAccessType = 'all-events'
          } else if (accessValue === 'reception-only' || accessValue === 'reception only' || accessValue === 'reception' || accessValue === 'receptiononly') {
            eventAccessType = 'reception-only'
          } else {
            // Invalid value - include the actual received value in error message for debugging
            const displayValue = String(rawValue).trim() || '(empty)'
            results.errors.push({
              row: rowNumber,
              name,
              error: `Event access must be "all-events" or "reception-only". Received: "${displayValue}"`,
            })
            continue
          }
        }
        // If eventAccess is null, undefined, or empty string, default to 'all-events' (already set)
        
        // Convert to actual event array
        const actualEventAccess = eventAccessType === 'all-events' 
          ? ['mehndi', 'wedding', 'reception']
          : ['reception']

        // Parse phone (optional)
        const phone = row.phone ? String(row.phone).trim() : null

        // Parse email (optional)
        const email = row.email ? String(row.email).trim().toLowerCase() : null
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          results.errors.push({
            row: rowNumber,
            name,
            error: 'Invalid email format',
          })
          continue
        }

        // Parse max devices (optional, default 10)
        let maxDevicesAllowed = 10
        // Explicitly check for valid non-empty values (not null, undefined, empty string, or 0)
        if (row.maxDevicesAllowed != null && row.maxDevicesAllowed !== '' && String(row.maxDevicesAllowed).trim() !== '') {
          const parsed = parseInt(String(row.maxDevicesAllowed).trim(), 10)
          if (!isNaN(parsed) && parsed >= 1 && parsed <= 10) {
            maxDevicesAllowed = parsed
          }
          // If parsed value is invalid (NaN, 0, or out of range), keep default of 10
        }

        // Check if guest with same name already exists (optional check)
        const existingGuest = await prisma.guest.findFirst({
          where: { name },
        })

        if (existingGuest) {
          results.skipped.push({
            row: rowNumber,
            name,
            reason: 'Guest with this name already exists',
          })
          continue
        }

        // Create guest
        const token = generateSecureToken()
        const guest = await prisma.guest.create({
          data: {
            name,
            phone: phone || null,
            email: email || null,
            token,
            eventAccess: JSON.stringify(actualEventAccess),
            maxDevicesAllowed,
            allowedDevices: JSON.stringify([]),
          },
        })

        results.success.push({
          row: rowNumber,
          name,
          token: guest.token,
          eventAccess: eventAccessType,
        })
      } catch (error) {
        results.errors.push({
          row: rowNumber,
          name: row.name || '(unknown)',
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    const response = NextResponse.json({
      success: true,
      summary: {
        total: data.length,
        successful: results.success.length,
        errors: results.errors.length,
        skipped: results.skipped.length,
      },
      results,
    })
    return setNoCacheHeaders(response)
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      const response = NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
      return setNoCacheHeaders(response)
    }

    console.error('Error importing guests:', error)
    const response = NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
    return setNoCacheHeaders(response)
  }
}

// GET endpoint to download template
export async function GET() {
  try {
    await requireAdmin()

    // Create template workbook
    const workbook = XLSX.utils.book_new()
    
    // Sample data for template
    const templateData = [
      {
        name: 'John Doe',
        phone: '+1234567890',
        email: 'john.doe@example.com',
        eventAccess: 'all-events',
        maxDevicesAllowed: 2,
      },
      {
        name: 'Jane Smith',
        phone: '+0987654321',
        email: 'jane.smith@example.com',
        eventAccess: 'reception-only',
        maxDevicesAllowed: 1,
      },
    ]

    const worksheet = XLSX.utils.json_to_sheet(templateData)
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Guests')

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

    const response = new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="guest-import-template.xlsx"',
      },
    })
    return setNoCacheHeaders(response)
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      const response = NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
      return setNoCacheHeaders(response)
    }

    console.error('Error generating template:', error)
    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
    return setNoCacheHeaders(response)
  }
}

