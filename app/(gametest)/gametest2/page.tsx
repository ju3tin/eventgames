'use client'

import { useRef, useState, useEffect } from 'react'
import Script from 'next/script'

export default function AirJugglerPage() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [isTracking, setIsTracking] = useState(false)

  // ────────────────────────────────────────────────
  // Wait for scripts → then auto-init webcam
  // ────────────────────────────────────────────────
  useEffect(() => {
    if (!isReady || !videoRef.current) return

    const video = videoRef.current

    const initWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        })

        video.srcObject = stream
        await video.play()
        console.log('Webcam stream started')
      } catch (err: any) {
        console.error('Webcam error:', err)
        let msg = 'Could not access webcam.'
        if (err.name === 'NotAllowedError') {
          msg = 'Camera permission denied. Please allow access in your browser settings.'
        } else if (err.name === 'NotFoundError') {
          msg = 'No camera detected on this device.'
        } else {
          msg += ` (${err.message || err.name})`
        }
        setError(msg)
      }
    }

    initWebcam()
  }, [isReady])

  // ────────────────────────────────────────────────
  // Start / Stop game controls
  // ────────────────────────────────────────────────
  const startGame = () => {
    if (!window.handTracking?.setupHandTracking) {
      alert('Hand tracking not ready yet — please wait a moment')
      return
    }

    const video = videoRef.current
    if (!video) return

    window.handTracking
      .setupHandTracking(video, (hands: any[]) => {
        // This is where you can feed hand positions into game.js logic
        console.log('Hand positions:', hands)
        // Example: window.game?.updateHands?.(hands)
      })
      .then((success: boolean) => {
        if (success) {
          window.handTracking.startDetection()
          setIsTracking(true)
          // Hide overlay or show game UI here
          const overlay = document.getElementById('overlay')
          if (overlay) overlay.style.display = 'none'
        }
      })
      .catch((err: any) => {
        setError('Failed to start hand tracking: ' + err.message)
      })
  }

  const stopGame = () => {
    if (window.handTracking?.stopDetection) {
      window.handTracking.stopDetection()
      setIsTracking(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      {/* Loading / Error Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="loader w-16 h-16 border-4 border-t-blue-500 border-gray-600 rounded-full animate-spin mx-auto mb-6"></div>
            <h2 className="text-2xl mb-2">Loading Air Juggler</h2>
            <p className="text-gray-400">Initializing hand tracking models...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-6">
          <div className="bg-red-900/80 p-8 rounded-xl max-w-lg text-center">
            <h2 className="text-2xl font-bold mb-4 text-red-300">Error</h2>
            <p className="mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-200"
            >
              Refresh Page
            </button>
          </div>
        </div>
      )}

      {/* Main Game UI */}
      <div className="relative w-full max-w-4xl">
        <h1 className="text-5xl font-bold mb-6 text-center text-blue-400">Air Juggler</h1>
        <p className="text-xl text-center mb-8">Use your hands to keep the balls in the air!</p>

        <div className="relative rounded-xl overflow-hidden border-4 border-gray-700 shadow-2xl bg-black">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            width={640}
            height={480}
            className="w-full h-auto transform scale-x-[-1]" // mirror for natural hand movement
          />

          <canvas
            id="gameCanvas"
            width={640}
            height={480}
            className="absolute inset-0 pointer-events-none"
          />

          <div
            id="overlay"
            className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center"
          >
            <h2 id="overlayMessage" className="text-4xl font-bold mb-8">
              Ready to Play?
            </h2>
            <button
              id="startButton"
              onClick={startGame}
              disabled={!isReady}
              className={`px-10 py-5 text-2xl font-bold rounded-full transition-all ${
                isReady
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-gray-600 cursor-not-allowed'
              }`}
            >
              {isReady ? 'Start Game' : 'Loading...'}
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xl mb-4">
            Time: <span id="score" className="text-3xl font-bold text-yellow-400">0</span>s
          </p>

          {isTracking && (
            <button
              onClick={stopGame}
              className="mt-4 px-8 py-3 bg-red-600 hover:bg-red-700 rounded-lg text-lg font-medium"
            >
              Stop Game
            </button>
          )}
        </div>
      </div>

      {/* ──────────────────────────────────────────────── */}
      {/* Scripts – loaded in correct order */}
      {/* ──────────────────────────────────────────────── */}

      <Script
        src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js"
        strategy="beforeInteractive"
        onLoad={() => console.log('TensorFlow.js loaded')}
      />

      <Script
        src="https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4/hands.js"
        strategy="beforeInteractive"
        onLoad={() => console.log('MediaPipe Hands loaded')}
      />

      <Script
        src="https://cdn.jsdelivr.net/npm/@tensorflow-models/hand-pose-detection@2.1.0"
        strategy="afterInteractive"
        onLoad={() => {
          console.log('Hand Pose Detection loaded')
          setTimeout(() => {
            if (window.handPoseDetection) {
              console.log('handPoseDetection ready')
              setIsReady(true)
              setIsLoading(false)
            }
          }, 800)
        }}
      />

      {isReady && (
        <>
          <Script
            src="/js/handTracking.js"
            strategy="afterInteractive"
            onLoad={() => console.log('handTracking.js loaded')}
          />
          <Script
            src="/js/game.js"
            strategy="afterInteractive"
            onLoad={() => console.log('game.js loaded')}
          />
        </>
      )}
    </div>
  )
}