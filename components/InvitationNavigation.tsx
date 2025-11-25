'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

interface InvitationNavigationProps {
  token: string
  eventAccess: string[]
}

export default function InvitationNavigation({ token, eventAccess }: InvitationNavigationProps) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const isAllEvents = eventAccess.includes('mehndi') && eventAccess.includes('wedding') && eventAccess.includes('reception')

  const navItems = [
    { href: `/invite/${token}`, label: 'Home', icon: '🏠' },
    { href: `/invite/${token}/about-ankita`, label: 'About Ankita', icon: '👰' },
    { href: `/invite/${token}/about-jay`, label: 'About Jay', icon: '🤵' },
    { href: `/invite/${token}/venue-travel`, label: 'Venue & Travel', icon: '📍' },
    { href: `/invite/${token}/save-the-date`, label: 'Save the Date', icon: '📅' },
  ]

  // Add event pages based on access
  if (isAllEvents) {
    navItems.push(
      { href: `/invite/${token}/events/mehndi`, label: 'Mehndi', icon: '🎨' },
      { href: `/invite/${token}/events/wedding`, label: 'Wedding', icon: '💒' },
      { href: `/invite/${token}/events/reception`, label: 'Reception', icon: '🎉' }
    )
  } else if (eventAccess.includes('reception')) {
    navItems.push(
      { href: `/invite/${token}/events/reception`, label: 'Reception', icon: '🎉' }
    )
  }

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-md border-b border-wedding-gold/20">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
        {/* Mobile Menu Button */}
        <div className="flex items-center justify-between py-3">
          <div className="text-lg sm:text-xl font-display text-wedding-navy font-semibold">
            Menu
          </div>
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-wedding-cream transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <svg className="w-6 h-6 text-wedding-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-wedding-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center justify-center gap-1 py-2 overflow-x-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 whitespace-nowrap ${
                  isActive
                    ? 'bg-wedding-gold text-white shadow-md'
                    : 'text-wedding-navy hover:bg-wedding-cream hover:text-wedding-gold'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium text-sm sm:text-base">{item.label}</span>
              </Link>
            )
          })}
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden pb-3 animate-in slide-in-from-top duration-200">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex flex-col items-center justify-center gap-1 p-3 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-wedding-gold text-white shadow-md'
                        : 'bg-wedding-cream text-wedding-navy hover:bg-wedding-gold-light active:scale-95'
                    }`}
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <span className="font-medium text-xs text-center">{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

