'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

interface InvitationNavigationProps {
  token: string
  eventAccess: string[]
  guestName?: string
}

export default function InvitationNavigation({ token, eventAccess, guestName }: InvitationNavigationProps) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const isAllEvents = eventAccess.includes('mehndi') && eventAccess.includes('wedding') && eventAccess.includes('reception')
  
  // Check if we're on the reception page
  const isReceptionPage = pathname?.includes('/events/reception') || false

  // Close menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  // Handle scroll detection for dynamic navbar styling
  useEffect(() => {
    if (!isReceptionPage) {
      setIsScrolled(false)
      return
    }

    const handleScroll = () => {
      // Change navbar style after scrolling past 100px on reception page
      setIsScrolled(window.scrollY > 100)
    }

    window.addEventListener('scroll', handleScroll)
    // Check initial scroll position
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [isReceptionPage])

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMobileMenuOpen])

  // Build navigation items in logical order - ensure we always have at least Home, Save the Date, and RSVP
  const navItems: Array<{ href: string; label: string; icon: string; iconType?: 'image' | 'emoji' }> = [
    { href: `/invite/${token}`, label: 'About Jay and Ankita', icon: '🏠', iconType: 'emoji' },
    { href: `/invite/${token}/invitation-video`, label: 'Invitation Video', icon: '🎬', iconType: 'emoji' },
  ]

  // Add event pages based on access (in chronological order)
  if (eventAccess && Array.isArray(eventAccess)) {
    if (eventAccess.includes('mehndi')) {
      navItems.push({ href: `/invite/${token}/events/mehndi`, label: 'Mehndi', icon: '/icons/mehndi-icon.png', iconType: 'image' })
    }
    if (eventAccess.includes('wedding')) {
      navItems.push({ href: `/invite/${token}/events/wedding`, label: 'Baraat and Wedding', icon: '/icons/wedding-icon.png', iconType: 'image' })
    }
    if (eventAccess.includes('reception')) {
      navItems.push({ href: `/invite/${token}/events/reception`, label: 'Reception', icon: '/icons/reception-icon.png', iconType: 'image' })
    }
  }

  // Add Save the Date, Travel & Venue, and RSVP - always include these
  navItems.push(
    { href: `/invite/${token}/save-the-date`, label: 'Save the Date', icon: '📅', iconType: 'emoji' },
    { href: `/invite/${token}/venue-travel`, label: 'Travel and Venue', icon: '📍', iconType: 'emoji' },
    { href: `/invite/${token}/rsvp`, label: 'RSVP', icon: '💌', iconType: 'emoji' }
  )

  // Dynamic navbar styling based on scroll position and page
  const navBgClass = isReceptionPage && isScrolled
    ? 'bg-wedding-navy/95 backdrop-blur-lg'
    : 'bg-white/98 backdrop-blur-lg'
  
  const navTextClass = isReceptionPage && isScrolled
    ? 'text-wedding-gold-light'
    : 'text-wedding-navy'
  
  const navBorderClass = isReceptionPage && isScrolled
    ? 'border-wedding-gold/50'
    : 'border-wedding-gold/30'

  return (
    <>
      <nav className={`sticky top-0 z-[100] ${navBgClass} shadow-lg border-b-2 ${navBorderClass} transition-all duration-300`}>
        <div className="max-w-7xl mx-auto">
          {/* Mobile Header Bar - Always Visible */}
          <div className="flex items-center justify-between px-4 py-3 md:px-6 gap-3">
            {/* Compact Header with Couple Names */}
            <div className="flex-shrink-0 min-w-[140px] md:min-w-[180px]">
              <Link href={`/invite/${token}`} className="block">
                <h1 className={`text-base md:text-lg font-display font-bold ${isReceptionPage && isScrolled ? 'text-wedding-gold' : ''}`}>
                  <span className={isReceptionPage && isScrolled ? 'text-wedding-gold' : 'text-wedding-gold'}>From Jay and Ankita</span>
                </h1>
                {guestName && (
                  <p className={`text-xs ${isReceptionPage && isScrolled ? 'text-wedding-gold-light/80' : 'text-gray-600'}`}>Hi, {guestName.split(' ')[0]}!</p>
                )}
              </Link>
            </div>

            {/* Hamburger Menu Button - Larger touch target */}
            <button
              className={`md:hidden p-3 -mr-2 rounded-xl transition-colors touch-manipulation flex items-center gap-2 flex-shrink-0 ${
                isReceptionPage && isScrolled 
                  ? 'active:bg-wedding-navy-light' 
                  : 'active:bg-wedding-cream'
              }`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
            >
              <span className={`text-sm font-medium ${navTextClass}`}>Menu</span>
              <motion.div
                animate={isMobileMenuOpen ? 'open' : 'closed'}
                className="w-6 h-6 flex flex-col justify-center gap-1.5"
              >
                <motion.span
                  variants={{
                    closed: { rotate: 0, y: 0 },
                    open: { rotate: 45, y: 8 },
                  }}
                  className={`w-full h-0.5 rounded-full origin-center transition-all ${
                    isReceptionPage && isScrolled ? 'bg-wedding-gold-light' : 'bg-wedding-navy'
                  }`}
                />
                <motion.span
                  variants={{
                    closed: { opacity: 1 },
                    open: { opacity: 0 },
                  }}
                  className={`w-full h-0.5 rounded-full transition-all ${
                    isReceptionPage && isScrolled ? 'bg-wedding-gold-light' : 'bg-wedding-navy'
                  }`}
                />
                <motion.span
                  variants={{
                    closed: { rotate: 0, y: 0 },
                    open: { rotate: -45, y: -8 },
                  }}
                  className={`w-full h-0.5 rounded-full origin-center transition-all ${
                    isReceptionPage && isScrolled ? 'bg-wedding-gold-light' : 'bg-wedding-navy'
                  }`}
                />
              </motion.div>
            </button>

            {/* Desktop Navigation - Hidden on mobile */}
            <div className="hidden md:flex items-center gap-1.5 lg:gap-2 flex-1 min-w-0 overflow-x-auto scrollbar-hide px-2">
              {navItems && navItems.length > 0 ? (
                navItems.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-1.5 px-2 lg:px-3 xl:px-4 py-2 rounded-lg transition-all duration-200 whitespace-nowrap min-h-[44px] flex-shrink-0 ${
                        isActive
                          ? 'bg-wedding-gold text-white shadow-md font-semibold'
                          : isReceptionPage && isScrolled
                          ? 'text-wedding-gold-light hover:bg-wedding-navy-light hover:text-wedding-gold'
                          : 'text-wedding-navy hover:bg-wedding-cream hover:text-wedding-gold'
                      }`}
                    >
                      {item.iconType === 'image' ? (
                        <div className="w-5 h-5 relative flex-shrink-0">
                          <Image
                            src={item.icon}
                            alt={item.label}
                            width={20}
                            height={20}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      ) : (
                        <span className="text-base flex-shrink-0">{item.icon}</span>
                      )}
                      <span className="font-medium text-xs lg:text-sm">{item.label}</span>
                    </Link>
                  )
                })
              ) : (
                <span className="text-sm text-gray-500">Loading navigation...</span>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Full-Screen Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/50 z-[9998] md:hidden"
                onClick={() => setIsMobileMenuOpen(false)}
              />

              {/* Slide-in Menu */}
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed top-0 right-0 w-80 max-w-[85vw] bg-white shadow-2xl z-[9999] md:hidden flex flex-col h-screen"
              >
                {/* Menu Header */}
                <div className="flex-shrink-0 bg-white border-b-2 border-wedding-gold/20 px-4 py-4 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-display text-wedding-navy font-bold">
                      Menu
                    </h2>
                    {guestName && (
                      <p className="text-sm text-gray-600 truncate">Welcome, {guestName}</p>
                    )}
                  </div>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 rounded-lg active:bg-wedding-cream transition-colors touch-manipulation flex-shrink-0 ml-2"
                    aria-label="Close menu"
                  >
                    <svg className="w-6 h-6 text-wedding-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Menu Items - Scrollable */}
                <div 
                  className="flex-1 overflow-y-auto overscroll-contain px-4 pt-4 pb-4 min-h-0"
                  style={{ 
                    WebkitOverflowScrolling: 'touch',
                  }}
                >
                  <div className="space-y-2 pb-48">
                    {navItems && navItems.length > 0 ? (
                      navItems.map((item, index) => {
                        const isActive = pathname === item.href
                        return (
                          <motion.div
                            key={item.href}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <Link
                              href={item.href}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-200 min-h-[56px] touch-manipulation ${
                                isActive
                                  ? 'bg-wedding-gold text-white shadow-lg'
                                  : 'bg-wedding-cream text-wedding-navy active:bg-wedding-gold-light active:scale-[0.98]'
                              }`}
                            >
                              {item.iconType === 'image' ? (
                                <div className="w-8 h-8 relative flex-shrink-0">
                                  <Image
                                    src={item.icon}
                                    alt={item.label}
                                    width={32}
                                    height={32}
                                    className="w-full h-full object-contain"
                                  />
                                </div>
                              ) : (
                                <span className="text-2xl flex-shrink-0">{item.icon}</span>
                              )}
                              <span className={`font-medium text-base flex-1 ${isActive ? 'font-semibold' : ''}`}>
                                {item.label}
                              </span>
                              {isActive && (
                                <motion.span
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="text-white flex-shrink-0"
                                >
                                  ✓
                                </motion.span>
                              )}
                            </Link>
                          </motion.div>
                        )
                      })
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        <p>No navigation items available</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Menu Footer */}
                <div className="flex-shrink-0 px-4 py-4 border-t border-wedding-gold/20 bg-white">
                  <p className="text-xs text-center text-gray-500">
                    Ankita & Jay&apos;s Wedding
                  </p>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </nav>
    </>
  )
}

