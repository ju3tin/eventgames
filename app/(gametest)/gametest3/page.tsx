'use client'

import { useRef, useState, useEffect } from 'react'
import Script from 'next/script'

export default function AirJugglerPage() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [status, setStatus] = useState('Waiting for libraries...')
  const [error, setError] = useState<string | null>(null)
  const [libsReady, setLibsReady] = useState(false)
  const [isTracking, setIsTracking] = useState(false)

  // Poll for handPoseDetection global (fixes timing issues)
  useEffect(() => {
    if (libsReady) return

    let attempts = 0
    const maxAttempts = 40 // ~12 seconds
    const interval = setInterval(() => {
      attempts++
      if ((window as any).handPoseDetection) {
        console.log('handPoseDetection finally available after', attempts, 'attempts')
        setLibsReady(true)
        setStatus('Libraries ready ✓ Initializing webcam...')
        clearInterval(interval)
      } else if (attempts >= maxAttempts) {
        setError('Libraries failed to load after waiting. Try refreshing or check internet.')
        setStatus('Timeout – libraries not loaded')
        clearInterval(interval)
      }
    }, 300)

    return () => clearInterval(interval)
  }, [libsReady])

  // Start webcam when libs are ready
  useEffect(() => {
    if (!libsReady || !videoRef.current) return

    const video = videoRef.current

    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        })

        video.srcObject = stream
        await video.play()
        setStatus('Webcam ready ✓ Click "Start Game"')
      } catch (err: any) {
        console.error('Webcam error:', err)
        setError(
          err.name === 'NotAllowedError'
            ? 'Camera access denied. Allow it in browser settings and refresh.'
            : 'Webcam failed: ' + (err.message || err.name)
        )
      }
    }

    startWebcam()
  }, [libsReady])

  const startGame = () => {
    if (!(window as any).handTracking?.setupHandTracking) {
      alert('Hand tracking not fully initialized yet — wait a few seconds or refresh')
      return
    }

    const video = videoRef.current
    if (!video) {
      setError('Video element not found')
      return
    }

    (window as any).handTracking
      .setupHandTracking(video, (hands: any[]) => {
        console.log('Hand positions detected:', hands)
        // → Connect to your game logic here later
      })
      .then((success: boolean) => {
        if (success) {
          (window as any).handTracking.startDetection()
          setIsTracking(true)
          const overlay = document.getElementById('overlay')
          if (overlay) overlay.style.display = 'none'
          setStatus('Game running! Use your hands to juggle')
        }
      })
      .catch((err: any) => {
        console.error('Start failed:', err)
        setError('Failed to start tracking: ' + err.message)
      })
  }

  const stopGame = () => {
    if ((window as any).handTracking?.stopDetection) {
      (window as any).handTracking.stopDetection()
      setIsTracking(false)
      setStatus('Game stopped')
    }
  }

  const retryLibraries = () => {
    setLibsReady(false)
    setError(null)
    setStatus('Retrying libraries...')
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center p-6">
      {/* Status & Error */}
      <div className="w-full max-w-4xl mb-6">
        <p className="text-xl font-semibold mb-2">
          Status: <span className={libsReady ? 'text-green-400' : 'text-yellow-400'}>{status}</span>
        </p>

        {error && (
          <div className="bg-red-900/70 p-5 rounded-xl text-center">
            <strong className="text-red-300 block mb-3">Problem:</strong>
            {error}
            <button
              onClick={retryLibraries}
              className="mt-4 px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-200"
            >
              Retry Loading
            </button>
          </div>
        )}
      </div>

      {/* Game Area */}
      <div className="relative w-full max-w-4xl bg-gray-900 rounded-2xl overflow-hidden border-4 border-gray-700 shadow-2xl">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          width={640}
          height={480}
          className="w-full h-auto transform scale-x-[-1]"
          style={{ background: '#000' }}
        />

        <canvas id="gameCanvas" width={640} height={480} className="absolute inset-0 pointer-events-none" />

        <div
          id="overlay"
          className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center"
        >
          <h2 className="text-5xl font-bold mb-10 text-center">
            Air Juggler
          </h2>
          <p className="text-xl mb-8">Use your hands to keep the balls in the air!</p>
          <button
            onClick={startGame}
            disabled={!libsReady || !!error}
            className={`px-12 py-6 text-3xl font-bold rounded-full transition-all ${
              libsReady && !error
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-gray-600 cursor-not-allowed'
            }`}
          >
            {libsReady ? (isTracking ? 'Playing...' : 'Start Game') : 'Loading...'}
          </button>
        </div>
      </div>

      {isTracking && (
        <button
          onClick={stopGame}
          className="mt-8 px-10 py-4 bg-red-600 hover:bg-red-700 rounded-lg text-xl font-medium"
        >
          Stop Game
        </button>
      )}

      {/* Scripts */}
      <Script
        src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js"
        strategy="beforeInteractive"
        onLoad={() => console.log('TF.js loaded')}
      />

      <Script
        src="https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4/hands.js"
        strategy="beforeInteractive"
        onLoad={() => console.log('MediaPipe loaded')}
      />

      <Script
        src="https://cdn.jsdelivr.net/npm/@tensorflow-models/hand-pose-detection@2.1.0"
        strategy="afterInteractive"
        onLoad={() => console.log('Hand-pose-detection script loaded')}
      />

      {libsReady && (
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