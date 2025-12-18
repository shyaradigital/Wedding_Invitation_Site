'use client'

import { useEffect, useState } from 'react'

interface Star {
  id: number
  left: number
  top: number
  delay: number
  size: number
}

export default function StarParticles({ count = 12 }: { count?: number }) {
  const [stars, setStars] = useState<Star[]>([])

  useEffect(() => {
    const newStars: Star[] = Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 3,
      size: Math.random() * 4 + 4, // 4-8px
    }))
    setStars(newStars)
  }, [count])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {stars.map((star) => (
        <div
          key={star.id}
          className="star-particle star-twinkle"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            animationDelay: `${star.delay}s`,
            fontSize: `${star.size}px`,
            opacity: 0.4,
            color: '#D4AF37',
          }}
        >
          ✦
        </div>
      ))}
    </div>
  )
}

