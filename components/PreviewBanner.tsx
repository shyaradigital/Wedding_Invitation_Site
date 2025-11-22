'use client'

import Link from 'next/link'

export default function PreviewBanner() {
  return (
    <div className="bg-yellow-500 text-yellow-900 px-4 py-3 text-center font-semibold shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 flex-wrap">
        <span className="text-xl">👁️</span>
        <span>ADMIN PREVIEW MODE - This view does not count as a device</span>
        <Link
          href="/admin"
          className="ml-4 px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors text-sm"
        >
          Back to Admin
        </Link>
      </div>
    </div>
  )
}

