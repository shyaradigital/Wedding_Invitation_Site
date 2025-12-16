'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface LazyVideoPlayerProps {
  videoSrc: string
  className?: string
}

export default function LazyVideoPlayer({ videoSrc, className = '' }: LazyVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [showControls, setShowControls] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const handlePlay = async () => {
    if (!videoRef.current) return

    // If video hasn't been loaded yet, set src and load it
    if (!hasLoaded) {
      setIsLoading(true)
      setError(null)
      
      try {
        // First, verify the video file exists by making a HEAD request
        try {
          const response = await fetch(videoSrc, { method: 'HEAD' })
          if (!response.ok) {
            throw new Error(`Video file not found (${response.status})`)
          }
        } catch (fetchError) {
          console.error('Video file check failed:', fetchError)
          throw new Error('Video file not accessible. Please check if the file exists.')
        }

        // Set the source
        videoRef.current.src = videoSrc
        // Explicitly load the video
        videoRef.current.load()
        setHasLoaded(true)
        
        // Wait for video metadata to load before playing
        await new Promise<void>((resolve, reject) => {
          if (!videoRef.current) {
            reject(new Error('Video element not available'))
            return
          }

          const handleCanPlay = () => {
            videoRef.current?.removeEventListener('canplay', handleCanPlay)
            videoRef.current?.removeEventListener('error', handleError)
            resolve()
          }

          const handleError = (e: Event) => {
            videoRef.current?.removeEventListener('canplay', handleCanPlay)
            videoRef.current?.removeEventListener('error', handleError)
            reject(new Error('Video failed to load'))
          }

          videoRef.current.addEventListener('canplay', handleCanPlay, { once: true })
          videoRef.current.addEventListener('error', handleError, { once: true })
        })
        
        // Now try to play
        const playPromise = videoRef.current.play()
        
        if (playPromise !== undefined) {
          await playPromise
          setIsPlaying(true)
          setIsLoading(false)
        }
      } catch (err: any) {
        console.error('Error loading video:', err)
        const errorMessage = err?.message || 'Failed to load video. Please check if the video file exists and is accessible.'
        setError(errorMessage)
        setIsLoading(false)
        setHasLoaded(false)
        // Reset video source on error
        if (videoRef.current) {
          videoRef.current.src = ''
        }
      }
    } else {
      // Video already loaded, just play it
      try {
        const playPromise = videoRef.current.play()
        if (playPromise !== undefined) {
          await playPromise
          setIsPlaying(true)
        }
      } catch (err) {
        console.error('Error playing video:', err)
        setError('Failed to play video. Please try again.')
      }
    }
  }

  const handlePause = () => {
    if (videoRef.current) {
      videoRef.current.pause()
      setIsPlaying(false)
    }
  }

  const handleVideoClick = () => {
    if (isPlaying) {
      handlePause()
    } else {
      handlePlay()
    }
  }

  const handleLoadedData = () => {
    setIsLoading(false)
  }

  const handleCanPlay = () => {
    setIsLoading(false)
  }

  const handleVideoEnd = () => {
    setIsPlaying(false)
  }

  const handleError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const video = e.currentTarget
    const error = video.error
    
    let errorMessage = 'Video format not supported or file not found.'
    
    if (error) {
      switch (error.code) {
        case error.MEDIA_ERR_ABORTED:
          errorMessage = 'Video loading was aborted.'
          break
        case error.MEDIA_ERR_NETWORK:
          errorMessage = 'Network error while loading video. Please check your connection.'
          break
        case error.MEDIA_ERR_DECODE:
          errorMessage = 'Video format not supported or corrupted file.'
          break
        case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
          errorMessage = 'Video format not supported or file not found. Please verify the video file exists at: ' + videoSrc
          break
        default:
          errorMessage = `Video error (code: ${error.code}). Please check if the video file exists.`
      }
    }
    
    console.error('Video error:', error, 'Source:', videoSrc)
    setIsLoading(false)
    setError(errorMessage)
    setHasLoaded(false)
  }

  // Show controls on hover/touch
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleMouseEnter = () => setShowControls(true)
    const handleMouseLeave = () => setShowControls(false)

    container.addEventListener('mouseenter', handleMouseEnter)
    container.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      container.removeEventListener('mouseenter', handleMouseEnter)
      container.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className={`relative w-full rounded-2xl overflow-hidden shadow-2xl bg-black ${className}`}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-auto max-h-[80vh] object-contain"
        preload="none"
        playsInline
        onLoadedData={handleLoadedData}
        onCanPlay={handleCanPlay}
        onEnded={handleVideoEnd}
        onClick={handleVideoClick}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onError={handleError}
      />

      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 flex items-center justify-center z-20"
          >
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-wedding-gold border-t-transparent mx-auto mb-4"></div>
              <p className="text-white text-lg font-medium">Loading video...</p>
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
              <div className="text-5xl mb-4">⚠️</div>
              <p className="text-white text-lg font-medium mb-4">{error}</p>
              <button
                onClick={() => {
                  setError(null)
                  setHasLoaded(false)
                  if (videoRef.current) {
                    videoRef.current.src = ''
                  }
                }}
                className="bg-wedding-gold hover:bg-wedding-gold/80 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Try Again
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Play Button Overlay - Show when not playing */}
      <AnimatePresence>
        {!isPlaying && !isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50 flex items-center justify-center z-10 cursor-pointer"
            onClick={handlePlay}
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="bg-wedding-gold/90 hover:bg-wedding-gold text-white rounded-full p-6 sm:p-8 md:p-10 shadow-2xl transition-all duration-300 group"
              aria-label="Play video"
            >
              <svg
                className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 ml-1"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
              <div className="absolute inset-0 rounded-full bg-white/20 scale-0 group-hover:scale-150 transition-transform duration-500"></div>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls Overlay - Show on hover when playing */}
      <AnimatePresence>
        {showControls && isPlaying && !isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 z-10"
          >
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={handlePause}
                className="bg-white/20 hover:bg-white/30 active:bg-white/40 text-white rounded-full p-3 transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Pause video"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decorative Border */}
      <div className="absolute inset-0 pointer-events-none border-4 border-wedding-gold/30 rounded-2xl"></div>
    </div>
  )
}

