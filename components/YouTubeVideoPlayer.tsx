'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface YouTubeVideoPlayerProps {
  videoId: string
  className?: string
}

/**
 * Extracts YouTube video ID from various URL formats or returns the ID if already extracted
 * Supports:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/shorts/VIDEO_ID
 * - Just the video ID itself
 */
function extractVideoId(input: string): string {
  // If it's already just a video ID (no slashes or special characters that indicate a URL)
  if (!input.includes('youtube.com') && !input.includes('youtu.be') && !input.includes('http')) {
    return input.trim()
  }

  // Handle YouTube Shorts format: https://www.youtube.com/shorts/VIDEO_ID
  const shortsMatch = input.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/)
  if (shortsMatch) {
    return shortsMatch[1]
  }

  // Handle standard YouTube format: https://www.youtube.com/watch?v=VIDEO_ID
  const watchMatch = input.match(/[?&]v=([a-zA-Z0-9_-]+)/)
  if (watchMatch) {
    return watchMatch[1]
  }

  // Handle short URL format: https://youtu.be/VIDEO_ID
  const shortUrlMatch = input.match(/youtu\.be\/([a-zA-Z0-9_-]+)/)
  if (shortUrlMatch) {
    return shortUrlMatch[1]
  }

  // If no match, return the input as-is (might already be a video ID)
  return input.trim()
}

export default function YouTubeVideoPlayer({ videoId, className = '' }: YouTubeVideoPlayerProps) {
  // Extract the actual video ID from the input (handles URLs and plain IDs)
  const extractedVideoId = extractVideoId(videoId)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement | null>(null)

  const handlePlay = () => {
    if (!hasLoaded) {
      setIsLoading(true)
      setError(null)
      setHasLoaded(true)
      // YouTube iframe will load when we set the src
    }
    setIsPlaying(true)
  }

  // Build YouTube embed URL with parameters
  const getYouTubeEmbedUrl = () => {
    const params = new URLSearchParams({
      autoplay: '1',
      rel: '0', // Don't show related videos
      modestbranding: '1', // Hide YouTube logo
      playsinline: '1', // Play inline on mobile
      controls: '1', // Show controls
      enablejsapi: '1', // Enable JavaScript API
    })
    return `https://www.youtube.com/embed/${extractedVideoId}?${params.toString()}`
  }

  const handleIframeLoad = () => {
    setIsLoading(false)
    setIsPlaying(true)
  }

  const handleIframeError = () => {
    setIsLoading(false)
    setError('Failed to load video. Please check if the video ID is correct.')
    setHasLoaded(false)
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full rounded-2xl overflow-hidden shadow-2xl bg-black ${className}`}
    >
      {/* YouTube iframe - Only render when play is clicked */}
      {hasLoaded && (
        <div className="relative w-full" style={{ paddingBottom: '56.25%', height: 0 }}> {/* 16:9 aspect ratio container */}
          <iframe
            ref={iframeRef}
            src={getYouTubeEmbedUrl()}
            className="absolute top-0 left-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            title="Wedding Invitation Video"
          />
        </div>
      )}

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
                  setIsPlaying(false)
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
        {!isPlaying && !isLoading && !error && (
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

      {/* Decorative Border */}
      <div className="absolute inset-0 pointer-events-none border-4 border-wedding-gold/30 rounded-2xl"></div>
    </div>
  )
}

