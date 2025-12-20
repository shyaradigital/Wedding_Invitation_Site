'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface VimeoVideoPlayerProps {
  videoId: string
  className?: string
  title?: string
}

export default function VimeoVideoPlayer({ 
  videoId, 
  className = '',
  title = 'Wedding Invitation Video'
}: VimeoVideoPlayerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasLoaded, setHasLoaded] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const scriptLoadedRef = useRef(false)

  useEffect(() => {
    let mounted = true

    const loadVimeoScript = () => {
      // Check if script is already loaded
      if (scriptLoadedRef.current || document.getElementById('vimeo-player-script')) {
        if (mounted) {
          setIsLoading(false)
          setHasLoaded(true)
        }
        return
      }

      // Load Vimeo player script
      const script = document.createElement('script')
      script.src = 'https://player.vimeo.com/api/player.js'
      script.async = true
      script.id = 'vimeo-player-script'
      
      script.onload = () => {
        scriptLoadedRef.current = true
        if (mounted) {
          setIsLoading(false)
          setHasLoaded(true)
        }
      }

      script.onerror = () => {
        if (mounted) {
          setIsLoading(false)
          setError('Failed to load Vimeo player script')
        }
      }

      document.head.appendChild(script)
    }

    loadVimeoScript()

    return () => {
      mounted = false
    }
  }, [])

  const handleIframeLoad = () => {
    setIsLoading(false)
    setHasLoaded(true)
    setError(null)
  }

  const handleIframeError = () => {
    setIsLoading(false)
    setError('Failed to load video. Please check if the video ID is correct.')
    setHasLoaded(false)
  }

  // Build Vimeo embed URL with parameters
  const getVimeoEmbedUrl = () => {
    const params = new URLSearchParams({
      badge: '0',
      autopause: '0',
      player_id: '0',
      app_id: '58479'
    })
    return `https://player.vimeo.com/video/${videoId}?${params.toString()}`
  }

  // Validate video ID
  if (!videoId || videoId.trim() === '') {
    return (
      <div className={`relative w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center ${className}`} style={{ paddingBottom: '177.78%', height: 0 }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="text-5xl mb-4">⚠️</div>
            <p className="text-white text-base sm:text-lg font-medium mb-2">
              Video ID is missing. Please provide a valid Vimeo video ID.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto rounded-2xl overflow-hidden shadow-2xl bg-black ${className}`}
    >
      {/* Aspect ratio container - 9:16 portrait/vertical (177.78% = 16/9 inverted) */}
      <div className="relative w-full" style={{ paddingTop: '177.78%', height: 0 }}>
        {/* Placeholder/Background - Shows when video hasn't loaded */}
        {!hasLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
            {/* Decorative pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-full h-full" style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(212, 175, 55, 0.3) 1px, transparent 0)',
                backgroundSize: '40px 40px'
              }}></div>
            </div>
            {/* Vimeo-style placeholder icon */}
            <div className="relative z-10 text-center px-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 rounded-full bg-wedding-gold/20 flex items-center justify-center">
                <svg className="w-10 h-10 sm:w-12 sm:h-12 text-wedding-gold" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* Vimeo iframe */}
        <iframe
          ref={iframeRef}
          src={getVimeoEmbedUrl()}
          className="absolute top-0 left-0 w-full h-full"
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          title={title}
        />
      </div>

      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 flex items-center justify-center z-20"
          >
            <div className="text-center px-4">
              <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-wedding-gold border-t-transparent mx-auto mb-3 sm:mb-4"></div>
              <p className="text-white text-base sm:text-lg font-medium">Loading video...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Overlay */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 flex items-center justify-center z-20"
          >
            <div className="text-center max-w-md mx-auto px-4">
              <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">⚠️</div>
              <p className="text-white text-sm sm:text-base md:text-lg font-medium mb-3 sm:mb-4 px-2">{error}</p>
              <button
                onClick={() => {
                  setError(null)
                  setHasLoaded(false)
                }}
                className="bg-wedding-gold hover:bg-wedding-gold/80 text-white px-5 py-2.5 sm:px-6 sm:py-3 rounded-lg text-sm sm:text-base font-semibold transition-colors touch-manipulation"
              >
                Try Again
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decorative Border */}
      <div className="absolute inset-0 pointer-events-none border-2 sm:border-4 border-wedding-gold/30 rounded-2xl"></div>
    </div>
  )
}
