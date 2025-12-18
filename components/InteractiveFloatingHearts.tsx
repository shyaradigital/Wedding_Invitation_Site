'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'

interface Heart {
  id: number
  x: number
  y: number
  size: number
  opacity: number
  delay: number
  duration: number
}

export default function InteractiveFloatingHearts() {
  const [hearts, setHearts] = useState<Heart[]>([])
  const [isMobile, setIsMobile] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const animationFrameRef = useRef<number>()

  // Detect device type
  useEffect(() => {
    const checkDevice = () => {
      // Check if device has fine pointer (mouse) capability
      const hasFinePointer = window.matchMedia('(pointer: fine)').matches
      const isMobileDevice = window.innerWidth < 768 || (!hasFinePointer && 'ontouchstart' in window)
      setIsMobile(isMobileDevice)
    }

    checkDevice()
    window.addEventListener('resize', checkDevice)
    return () => window.removeEventListener('resize', checkDevice)
  }, [])

  // Initialize hearts
  useEffect(() => {
    if (isMobile) {
      // Mobile: Create hearts that will spawn from bottom
      const heartCount = 12
      const newHearts: Heart[] = Array.from({ length: heartCount }, (_, i) => ({
        id: i,
        x: Math.random() * 100, // Random horizontal position (0-100%)
        y: 100, // Start at bottom (100%)
        size: Math.random() * 15 + 20, // Random size between 20-35px
        opacity: Math.random() * 0.2 + 0.15, // Reduced opacity: Random opacity 0.15-0.35
        delay: Math.random() * 3, // Random delay (0-3s)
        duration: Math.random() * 8 + 12, // Random duration (12-20s)
      }))
      setHearts(newHearts)
    } else {
      // Desktop: Focus hearts ONLY on the vertical empty spaces left and right of content boxes
      // Content is centered with max-w-[640px], sidebar is on left (md:ml-64 = 256px)
      // Left empty space: ~20-30% (after sidebar, before content)
      // Right empty space: ~70-100% (after content, to right edge)
      const leftSpaceHearts = 8 // Left empty vertical space
      const rightSpaceHearts = 9 // Right empty vertical space  
      
      const newHearts: Heart[] = []
      
      // Add hearts to LEFT empty vertical space (between sidebar and content)
      // Position: 18-28% (after sidebar ~18%, before content ~30%)
      for (let i = 0; i < leftSpaceHearts; i++) {
        newHearts.push({
          id: i,
          x: Math.random() * 10 + 18, // 18-28% horizontal position
          y: Math.random() * 100, // Full vertical height
          size: Math.random() * 20 + 15, // Random size between 15-35px
          opacity: Math.random() > 0.5 ? Math.random() * 0.25 + 0.2 : Math.random() * 0.15 + 0.1, // Reduced opacity: brighter (0.2-0.45) or darker (0.1-0.25)
          delay: Math.random() * 2,
          duration: Math.random() * 3 + 4, // Duration for floating animation (4-7s)
        })
      }
      
      // Add hearts to RIGHT empty vertical space (after content, to right edge)
      // Position: 70-95% (after content ~70%, to right edge)
      for (let i = leftSpaceHearts; i < leftSpaceHearts + rightSpaceHearts; i++) {
        newHearts.push({
          id: i,
          x: Math.random() * 25 + 70, // 70-95% horizontal position
          y: Math.random() * 100, // Full vertical height
          size: Math.random() * 20 + 15, // Random size between 15-35px
          opacity: Math.random() > 0.5 ? Math.random() * 0.25 + 0.2 : Math.random() * 0.15 + 0.1, // Reduced opacity: brighter (0.2-0.45) or darker (0.1-0.25)
          delay: Math.random() * 2,
          duration: Math.random() * 3 + 4, // Duration for floating animation (4-7s)
        })
      }
      
      setHearts(newHearts)
    }
  }, [isMobile])

  // Track mouse movement for desktop
  useEffect(() => {
    if (isMobile) return

    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        const x = ((e.clientX - rect.left) / rect.width) * 100
        const y = ((e.clientY - rect.top) / rect.height) * 100
        setMousePosition({ x, y })
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [isMobile])

  // Store base positions (original positions where hearts should float)
  const basePositionsRef = useRef<Map<number, { x: number; y: number }>>(new Map())

  // Store base positions when hearts are initialized
  useEffect(() => {
    if (!isMobile && hearts.length > 0) {
      hearts.forEach((heart) => {
        if (!basePositionsRef.current.has(heart.id)) {
          basePositionsRef.current.set(heart.id, { x: heart.x, y: heart.y })
        }
      })
    }
  }, [hearts, isMobile])

  // Update heart positions with subtle mouse reaction for desktop
  useEffect(() => {
    if (isMobile) return

    const updateHearts = () => {
      setHearts((prevHearts) =>
        prevHearts.map((heart) => {
          const basePos = basePositionsRef.current.get(heart.id)
          if (!basePos) return heart

          // Calculate distance and direction from heart to mouse
          const dx = mousePosition.x - basePos.x
          const dy = mousePosition.y - basePos.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          // Calculate movement in mouse direction (increased from subtle to more noticeable)
          const maxOffset = 4 // Maximum offset percentage (increased from 2%)
          const influenceDistance = 40 // Distance within which mouse affects hearts (increased from 30)
          const influence = Math.max(0, 1 - distance / influenceDistance) // 1 when close, 0 when far

          const offsetX = (dx / distance) * maxOffset * influence * (distance > 0 ? 1 : 0)
          const offsetY = (dy / distance) * maxOffset * influence * (distance > 0 ? 1 : 0)

          // Heart position is base position + subtle mouse offset
          const newX = basePos.x + offsetX
          const newY = basePos.y + offsetY

          return {
            ...heart,
            x: newX,
            y: newY,
          }
        })
      )

      animationFrameRef.current = requestAnimationFrame(updateHearts)
    }

    animationFrameRef.current = requestAnimationFrame(updateHearts)
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [mousePosition, isMobile])

  // Get heart emoji - always pink
  const getHeartVariant = () => {
    return '❤️' // Pink heart emoji
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none overflow-hidden z-[1]"
      aria-hidden="true"
    >
      {hearts.map((heart) => (
        <motion.div
          key={heart.id}
          className="absolute"
          style={{
            fontSize: `${heart.size}px`,
            opacity: heart.opacity,
          }}
          initial={
            isMobile
              ? {
                  y: 0,
                  x: 0,
                  opacity: 0,
                  scale: 0.8,
                }
              : {
                  scale: 1,
                  x: 0,
                  y: 0,
                }
          }
          animate={
            isMobile
              ? {
                  y: ['0%', '-400%'], // Move upward
                  x: [
                    '0%',
                    `${Math.random() * 40 - 20}%`,
                    `${Math.random() * 40 - 20}%`,
                    `${Math.random() * 40 - 20}%`,
                  ], // Random horizontal drift
                  opacity: [0, heart.opacity, heart.opacity, 0], // Fade in and out
                  scale: [0.8, 1, 1.1, 0.8],
                }
              : {
                  // Position (mouse reaction) - animated directly
                  left: `${heart.x}%`,
                  top: `${heart.y}%`,
                  // Floating animation via transforms (relative to position) - reduced movement
                  x: [
                    0,
                    Math.sin(heart.id * 0.5) * 15, // ~15px floating (reduced from 35px)
                    Math.sin(heart.id * 0.5 + Math.PI) * 15,
                    0,
                  ],
                  y: [
                    0,
                    Math.cos(heart.id * 0.7) * 12, // ~12px floating (reduced from 25px)
                    Math.cos(heart.id * 0.7 + Math.PI) * 12,
                    0,
                  ],
                  scale: [1, 1.08, 1, 1.08, 1], // Gentle pulsing
                  rotate: [0, 4, -4, 4, 0], // Gentle rotation
                }
          }
          transition={
            isMobile
              ? {
                  duration: heart.duration,
                  delay: heart.delay,
                  repeat: Infinity,
                  ease: 'easeOut',
                  repeatDelay: Math.random() * 2,
                }
              : {
                  left: { duration: 0.6, ease: 'easeOut' },
                  top: { duration: 0.6, ease: 'easeOut' },
                  x: { duration: heart.duration, ease: 'easeInOut', repeat: Infinity },
                  y: { duration: heart.duration * 1.3, ease: 'easeInOut', repeat: Infinity },
                  scale: { duration: heart.duration * 0.8, ease: 'easeInOut', repeat: Infinity },
                  rotate: { duration: heart.duration * 1.5, ease: 'easeInOut', repeat: Infinity },
                }
          }
        >
          {getHeartVariant()}
        </motion.div>
      ))}
    </div>
  )
}
