'use client'

import { useEffect, useState, useRef } from 'react'

interface WistiaVideoPlayerProps {
  mediaId?: string
  className?: string
}

export default function WistiaVideoPlayer({ 
  mediaId = 'bwvj54zfd6', 
  className = '' 
}: WistiaVideoPlayerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const playerContainerRef = useRef<HTMLDivElement>(null)
  const playerElementRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    let mounted = true
    let checkInterval: NodeJS.Timeout | null = null

    const loadScripts = async () => {
      // Load Wistia scripts exactly as provided by Wistia
      const playerScriptId = 'wistia-player-script'
      const embedScriptId = 'wistia-embed-script'

      // Check if scripts already exist
      if (!document.getElementById(playerScriptId)) {
        const playerScript = document.createElement('script')
        playerScript.src = 'https://fast.wistia.com/player.js'
        playerScript.async = true
        playerScript.id = playerScriptId
        document.head.appendChild(playerScript)
      }

      if (!document.getElementById(embedScriptId)) {
        const embedScript = document.createElement('script')
        embedScript.src = `https://fast.wistia.com/embed/${mediaId}.js`
        embedScript.async = true
        embedScript.type = 'module'
        embedScript.id = embedScriptId
        document.head.appendChild(embedScript)
      }

      // Wait for the custom element to be defined, then create the player
      const createPlayer = async () => {
        try {
          // Wait for custom element to be defined
          if (!customElements.get('wistia-player')) {
            await customElements.whenDefined('wistia-player')
          }

          if (!mounted || !playerContainerRef.current) return

          // Remove existing player if any
          if (playerElementRef.current) {
            playerElementRef.current.remove()
          }

          // Create the wistia-player element directly
          const playerElement = document.createElement('wistia-player')
          playerElement.setAttribute('media-id', mediaId)
          playerElement.setAttribute('aspect', '0.5625')
          playerElement.className = 'absolute top-0 left-0 w-full h-full'
          
          playerContainerRef.current.appendChild(playerElement)
          playerElementRef.current = playerElement

          if (mounted) {
            setIsLoading(false)
          }
        } catch (error) {
          console.error('Error creating Wistia player:', error)
          if (mounted) {
            setIsLoading(false)
          }
        }
      }

      // Check if element is already defined
      if (customElements.get('wistia-player')) {
        createPlayer()
      } else {
        // Wait for element definition
        customElements.whenDefined('wistia-player')
          .then(() => {
            if (mounted) {
              createPlayer()
            }
          })
          .catch(() => {
            // Fallback: check periodically
            checkInterval = setInterval(() => {
              if (customElements.get('wistia-player')) {
                if (checkInterval) {
                  clearInterval(checkInterval)
                  checkInterval = null
                }
                if (mounted) {
                  createPlayer()
                }
              }
            }, 100)

            // Timeout after 5 seconds
            setTimeout(() => {
              if (checkInterval) {
                clearInterval(checkInterval)
                checkInterval = null
              }
              if (mounted) {
                setIsLoading(false)
              }
            }, 5000)
          })
      }
    }

    loadScripts()

    return () => {
      mounted = false
      if (checkInterval) {
        clearInterval(checkInterval)
      }
      if (playerElementRef.current) {
        playerElementRef.current.remove()
      }
    }
  }, [mediaId])

  return (
    <>

      {/* Wistia player styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
          wistia-player[media-id='${mediaId}']:not(:defined) {
            background: center / contain no-repeat url('https://fast.wistia.com/embed/medias/${mediaId}/swatch');
            display: block;
            filter: blur(5px);
            padding-top: 177.78%;
          }
          wistia-player[media-id='${mediaId}'] {
            width: 100%;
            height: 100%;
            display: block;
          }
        `
      }} />

      {/* Video Player Container */}
      <div
        className={`relative w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto rounded-2xl overflow-hidden shadow-2xl bg-black ${className}`}
      >
        {/* Aspect ratio container - 9:16 portrait/vertical (aspect="0.5625" = 9/16 = 0.5625) */}
        <div className="relative w-full" style={{ paddingTop: '177.78%', height: 0 }}>
          {/* Loading placeholder */}
          {isLoading && (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center z-10">
              <div className="text-center px-4">
                <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-wedding-gold border-t-transparent mx-auto mb-3 sm:mb-4"></div>
                <p className="text-white text-base sm:text-lg font-medium">Loading video...</p>
              </div>
            </div>
          )}

          {/* Wistia Player Container - Player will be inserted here via ref */}
          <div 
            ref={playerContainerRef}
            className="absolute top-0 left-0 w-full h-full"
          />
        </div>

        {/* Decorative Border */}
        <div className="absolute inset-0 pointer-events-none border-2 sm:border-4 border-wedding-gold/30 rounded-2xl"></div>
      </div>
    </>
  )
}
