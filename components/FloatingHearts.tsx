'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface Heart {
  id: number
  x: number
  y: number
  size: number
  delay: number
  duration: number
}

export default function FloatingHearts() {
  const [hearts, setHearts] = useState<Heart[]>([])

  useEffect(() => {
    // Create 8-12 floating hearts
    const heartCount = 10
    const newHearts: Heart[] = []

    for (let i = 0; i < heartCount; i++) {
      newHearts.push({
        id: i,
        x: Math.random() * 100, // Random horizontal position (0-100%)
        y: Math.random() * 100, // Random starting vertical position
        size: Math.random() * 20 + 15, // Random size between 15-35px
        delay: Math.random() * 5, // Random delay (0-5s)
        duration: Math.random() * 10 + 15, // Random duration (15-25s)
      })
    }

    setHearts(newHearts)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[1]" aria-hidden="true">
      {hearts.map((heart) => (
        <motion.div
          key={heart.id}
          className="absolute text-wedding-rose/15"
          style={{
            left: `${heart.x}%`,
            top: `${heart.y}%`,
            fontSize: `${heart.size}px`,
          }}
          animate={{
            y: [0, -100, -200, -300, -400],
            x: [0, Math.random() * 40 - 20, Math.random() * 40 - 20, Math.random() * 40 - 20, Math.random() * 40 - 20],
            opacity: [0, 0.2, 0.3, 0.2, 0],
            scale: [0.8, 1, 1.1, 1, 0.8],
          }}
          transition={{
            duration: heart.duration,
            delay: heart.delay,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        >
          ❤️
        </motion.div>
      ))}
    </div>
  )
}

