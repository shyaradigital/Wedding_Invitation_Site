'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

interface EventCardProps {
  slug: string
  title: string
  date?: string
  time?: string
  venue?: string
  onClick?: () => void
}

const eventInfo: Record<string, { color: string; icon: string }> = {
  mehndi: {
    color: 'bg-wedding-rose',
    icon: '🎨',
  },
  wedding: {
    color: 'bg-wedding-gold',
    icon: '💒',
  },
  reception: {
    color: 'bg-wedding-burgundy',
    icon: '🎉',
  },
}

export default function EventCard({
  slug,
  title,
  date,
  time,
  venue,
  onClick,
}: EventCardProps) {
  const info = eventInfo[slug] || { color: 'bg-gray-200', icon: '📅' }

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      className={`${info.color} rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 text-white shadow-lg cursor-pointer min-h-[200px] sm:min-h-[240px] md:min-h-[260px] flex flex-col relative overflow-hidden transition-all duration-300 hover:shadow-2xl active:scale-[0.98] touch-manipulation`}
      onClick={onClick}
    >
      {/* Decorative background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-24 sm:w-32 bg-white rounded-full -mr-12 sm:-mr-16 -mt-12 sm:-mt-16"></div>
        <div className="absolute bottom-0 left-0 w-20 sm:w-24 bg-white rounded-full -ml-10 sm:-ml-12 -mb-10 sm:-mb-12"></div>
      </div>
      
      <div className="relative z-10 flex flex-col h-full">
        <div className="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4 md:mb-5">{info.icon}</div>
        <h3 className="text-xl sm:text-2xl md:text-3xl font-display mb-3 sm:mb-4 font-bold leading-tight">{title}</h3>
        {date && (
          <p className="text-sm sm:text-base md:text-lg opacity-95 mb-1.5 sm:mb-2 font-medium leading-snug">
            {new Date(date).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        )}
        {time && <p className="text-sm sm:text-base md:text-lg opacity-95 mb-1.5 sm:mb-2 font-medium">{time}</p>}
        {venue && <p className="text-xs sm:text-sm md:text-base opacity-90 mb-3 sm:mb-4 leading-snug">{venue}</p>}
        <div className="mt-auto pt-3 sm:pt-4 md:pt-6 border-t border-white/20">
          <span className="text-xs sm:text-sm md:text-base font-semibold inline-flex items-center">
            View Details <span className="ml-1.5 sm:ml-2">→</span>
          </span>
        </div>
      </div>
    </motion.div>
  )
}

