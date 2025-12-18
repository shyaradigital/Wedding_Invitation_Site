'use client'

import { useEffect, useState } from 'react'

interface Star {
  id: number
  left: number
  top: number
  delay: number
  size: number
  color: 'white' | 'yellow'
  constellation?: string
  constellationIndex?: number
}

// Constellation pattern generators
const generateHeartConstellation = (baseLeft: number, baseTop: number): Array<{ left: number; top: number }> => {
  return [
    { left: baseLeft - 2, top: baseTop - 3 },      // Top left
    { left: baseLeft + 2, top: baseTop - 3 },      // Top right
    { left: baseLeft, top: baseTop },              // Center
    { left: baseLeft - 3, top: baseTop + 3 },     // Bottom left
    { left: baseLeft + 3, top: baseTop + 3 },      // Bottom right
    { left: baseLeft, top: baseTop + 6 },          // Bottom point
  ]
}

const generateRingConstellation = (centerLeft: number, centerTop: number): Array<{ left: number; top: number }> => {
  const radius = 4
  const count = 5
  const stars: Array<{ left: number; top: number }> = []
  
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2
    stars.push({
      left: centerLeft + radius * Math.cos(angle),
      top: centerTop + radius * Math.sin(angle),
    })
  }
  
  return stars
}

const generateTriangleConstellation = (baseLeft: number, baseTop: number): Array<{ left: number; top: number }> => {
  return [
    { left: baseLeft, top: baseTop - 3 },          // Top
    { left: baseLeft - 3, top: baseTop + 3 },      // Bottom left
    { left: baseLeft + 3, top: baseTop + 3 },      // Bottom right
    { left: baseLeft, top: baseTop },              // Center
  ]
}

export default function StarParticles({ count = 35 }: { count?: number }) {
  const [stars, setStars] = useState<Star[]>([])
  const [constellationLines, setConstellationLines] = useState<Array<{ x1: number; y1: number; x2: number; y2: number; color: string }>>([])

  useEffect(() => {
    const newStars: Star[] = []
    let starId = 0
    
    // Generate constellations
    const heartStars = generateHeartConstellation(25, 20)
    const ringStars = generateRingConstellation(75, 25)
    const triangleStars = generateTriangleConstellation(50, 70)
    
    // Add heart constellation
    heartStars.forEach((pos, idx) => {
      newStars.push({
        id: starId++,
        left: pos.left,
        top: pos.top,
        delay: Math.random() * 3,
        size: Math.random() * 3 + 5, // 5-8px
        color: Math.random() < 0.75 ? 'white' : 'yellow',
        constellation: 'heart',
        constellationIndex: idx,
      })
    })
    
    // Add ring constellation
    ringStars.forEach((pos, idx) => {
      newStars.push({
        id: starId++,
        left: pos.left,
        top: pos.top,
        delay: Math.random() * 3,
        size: Math.random() * 3 + 5,
        color: Math.random() < 0.75 ? 'white' : 'yellow',
        constellation: 'ring',
        constellationIndex: idx,
      })
    })
    
    // Add triangle constellation
    triangleStars.forEach((pos, idx) => {
      newStars.push({
        id: starId++,
        left: pos.left,
        top: pos.top,
        delay: Math.random() * 3,
        size: Math.random() * 3 + 5,
        color: Math.random() < 0.75 ? 'white' : 'yellow',
        constellation: 'triangle',
        constellationIndex: idx,
      })
    })
    
    // Generate remaining random stars
    const remainingCount = count - newStars.length
    const whiteRatio = 0.75 // 75% white
    
    for (let i = 0; i < remainingCount; i++) {
      newStars.push({
        id: starId++,
        left: Math.random() * 100,
        top: Math.random() * 100,
        delay: Math.random() * 3,
        size: Math.random() * 4 + 4, // 4-8px
        color: Math.random() < whiteRatio ? 'white' : 'yellow',
      })
    }
    
    setStars(newStars)
    
    // Generate constellation lines
    const lines: Array<{ x1: number; y1: number; x2: number; y2: number; color: string }> = []
    
    // Heart constellation lines
    const heartConstellation = newStars.filter(s => s.constellation === 'heart')
    if (heartConstellation.length > 0) {
      const sorted = [...heartConstellation].sort((a, b) => (a.constellationIndex || 0) - (b.constellationIndex || 0))
      for (let i = 0; i < sorted.length - 1; i++) {
        lines.push({
          x1: sorted[i].left,
          y1: sorted[i].top,
          x2: sorted[i + 1].left,
          y2: sorted[i + 1].top,
          color: 'rgba(255, 255, 255, 0.25)',
        })
      }
      // Connect last to first for closed shape
      lines.push({
        x1: sorted[sorted.length - 1].left,
        y1: sorted[sorted.length - 1].top,
        x2: sorted[0].left,
        y2: sorted[0].top,
        color: 'rgba(255, 255, 255, 0.25)',
      })
    }
    
    // Ring constellation lines
    const ringConstellation = newStars.filter(s => s.constellation === 'ring')
    if (ringConstellation.length > 0) {
      const sorted = [...ringConstellation].sort((a, b) => (a.constellationIndex || 0) - (b.constellationIndex || 0))
      for (let i = 0; i < sorted.length; i++) {
        const next = sorted[(i + 1) % sorted.length]
        lines.push({
          x1: sorted[i].left,
          y1: sorted[i].top,
          x2: next.left,
          y2: next.top,
          color: 'rgba(255, 255, 255, 0.25)',
        })
      }
    }
    
    // Triangle constellation lines
    const triangleConstellation = newStars.filter(s => s.constellation === 'triangle')
    if (triangleConstellation.length > 0) {
      const sorted = [...triangleConstellation].sort((a, b) => (a.constellationIndex || 0) - (b.constellationIndex || 0))
      for (let i = 0; i < sorted.length; i++) {
        const next = sorted[(i + 1) % sorted.length]
        lines.push({
          x1: sorted[i].left,
          y1: sorted[i].top,
          x2: next.left,
          y2: next.top,
          color: 'rgba(255, 255, 255, 0.25)',
        })
      }
    }
    
    setConstellationLines(lines)
  }, [count])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[1]">
      {/* Constellation lines */}
      <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
        {constellationLines.map((line, idx) => (
          <line
            key={idx}
            x1={`${line.x1}%`}
            y1={`${line.y1}%`}
            x2={`${line.x2}%`}
            y2={`${line.y2}%`}
            stroke={line.color}
            strokeWidth="1"
            opacity="0.3"
          />
        ))}
      </svg>
      
      {/* Stars */}
      {stars.map((star) => {
        const isWhite = star.color === 'white'
        const textShadow = isWhite
          ? '0 0 4px rgba(255, 255, 255, 0.8), 0 0 8px rgba(255, 255, 255, 0.4)'
          : '0 0 4px rgba(212, 175, 55, 0.8), 0 0 8px rgba(212, 175, 55, 0.4)'
        
        return (
          <div
            key={star.id}
            className="star-particle star-twinkle"
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
              animationDelay: `${star.delay}s`,
              fontSize: `${star.size}px`,
              opacity: 0.6,
              color: isWhite ? '#FFFFFF' : '#D4AF37',
              textShadow: textShadow,
              zIndex: 1,
            }}
          >
            ✦
          </div>
        )
      })}
    </div>
  )
}

