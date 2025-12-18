'use client'

import { useEffect, useState } from 'react'

interface Star {
  id: number
  left: number
  top: number
  delay: number
  size: number
  color: 'white' | 'yellow'
  brightness: 'dim' | 'normal' | 'bright' | 'very-bright'
}

export default function StarParticles({ count = 100 }: { count?: number }) {
  const [stars, setStars] = useState<Star[]>([])

  useEffect(() => {
    const newStars: Star[] = []
    const whiteRatio = 0.75 // 75% white
    
    // Brightness distribution
    const getBrightness = (): 'dim' | 'normal' | 'bright' | 'very-bright' => {
      const rand = Math.random()
      if (rand < 0.3) return 'dim'        // 30% dim
      if (rand < 0.7) return 'normal'     // 40% normal
      if (rand < 0.9) return 'bright'     // 20% bright
      return 'very-bright'                // 10% very bright
    }
    
    for (let i = 0; i < count; i++) {
      newStars.push({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        delay: Math.random() * 2, // Faster twinkling
        size: Math.random() * 4 + 4, // 4-8px
        color: Math.random() < whiteRatio ? 'white' : 'yellow',
        brightness: getBrightness(),
      })
    }
    
    setStars(newStars)
  }, [count])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {stars.map((star) => {
        const isWhite = star.color === 'white'
        
        // Brightness-based opacity and text-shadow - reduced opacity for better visibility behind content
        let baseOpacity: number
        let textShadow: string
        
        switch (star.brightness) {
          case 'dim':
            baseOpacity = 0.15
            textShadow = isWhite
              ? '0 0 2px rgba(255, 255, 255, 0.3), 0 0 4px rgba(255, 255, 255, 0.15)'
              : '0 0 2px rgba(212, 175, 55, 0.3), 0 0 4px rgba(212, 175, 55, 0.15)'
            break
          case 'normal':
            baseOpacity = 0.3
            textShadow = isWhite
              ? '0 0 4px rgba(255, 255, 255, 0.5), 0 0 8px rgba(255, 255, 255, 0.25)'
              : '0 0 4px rgba(212, 175, 55, 0.5), 0 0 8px rgba(212, 175, 55, 0.25)'
            break
          case 'bright':
            baseOpacity = 0.45
            textShadow = isWhite
              ? '0 0 6px rgba(255, 255, 255, 0.6), 0 0 12px rgba(255, 255, 255, 0.35), 0 0 18px rgba(255, 255, 255, 0.2)'
              : '0 0 6px rgba(212, 175, 55, 0.6), 0 0 12px rgba(212, 175, 55, 0.35), 0 0 18px rgba(212, 175, 55, 0.2)'
            break
          case 'very-bright':
            baseOpacity = 0.6
            textShadow = isWhite
              ? '0 0 8px rgba(255, 255, 255, 0.7), 0 0 16px rgba(255, 255, 255, 0.5), 0 0 24px rgba(255, 255, 255, 0.3)'
              : '0 0 8px rgba(212, 175, 55, 0.7), 0 0 16px rgba(212, 175, 55, 0.5), 0 0 24px rgba(212, 175, 55, 0.3)'
            break
        }
        
        return (
          <div
            key={star.id}
            className="star-particle star-twinkle"
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
              animationDelay: `${star.delay}s`,
              fontSize: `${star.size}px`,
              opacity: baseOpacity,
              color: isWhite ? '#FFFFFF' : '#D4AF37',
              textShadow: textShadow,
              zIndex: 0,
            }}
          >
            ✦
          </div>
        )
      })}
    </div>
  )
}

