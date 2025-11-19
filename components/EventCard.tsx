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
      whileHover={{ scale: 1.05, y: -8 }}
      whileTap={{ scale: 0.98 }}
      className={`${info.color} rounded-2xl p-6 sm:p-8 text-white shadow-xl cursor-pointer min-h-[240px] sm:min-h-[260px] flex flex-col relative overflow-hidden transition-all duration-300 hover:shadow-2xl`}
      onClick={onClick}
    >
      {/* Decorative background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full -ml-12 -mb-12"></div>
      </div>
      
      <div className="relative z-10 flex flex-col h-full">
        <div className="text-5xl sm:text-6xl mb-4 sm:mb-5">{info.icon}</div>
        <h3 className="text-2xl sm:text-3xl font-display mb-4 font-bold">{title}</h3>
        {date && (
          <p className="text-base sm:text-lg opacity-95 mb-2 font-medium">
            {new Date(date).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        )}
        {time && <p className="text-base sm:text-lg opacity-95 mb-2 font-medium">{time}</p>}
        {venue && <p className="text-sm sm:text-base opacity-90 mb-4">{venue}</p>}
        <div className="mt-auto pt-4 sm:pt-6 border-t border-white/20">
          <span className="text-sm sm:text-base font-semibold inline-flex items-center">
            View Details <span className="ml-2">→</span>
          </span>
        </div>
      </div>
    </motion.div>
  )
}

