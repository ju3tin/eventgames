'use client'

import { useEffect, useRef } from 'react'

export default function HomePage() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  let detector: any = null
  let videoEl: HTMLVideoElement | null = null
  let isDetecting = false
  let sendHandsCallback: ((hands: { x: number; y: number }[]) => void) | null =
    null

  const loadScript = (src: string) =>
    new Promise<void>((resolve, reject) => {
      const script = document.createElement('script')
      script.src = src
      script.async = true
      script.onload = () => resolve()
      script.onerror = () => reject(new Error(`Failed to load script: ${src}`))
      document.body.appendChild(script)
    })

  const setupHandTracking = async (
    videoElement: HTMLVideoElement,
    sendHands: (hands: { x: number; y: number }[]) => void
  ) => {
    videoEl = videoElement
    sendHandsCallback = sendHands

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
      })
      videoEl.srcObject = stream
      await videoEl.play()

      const model = (window as any).handPoseDetection.SupportedModels.MediaPipeHands
      const detectorConfig = {
        runtime: 'mediapipe',
        solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1646424915',
        maxHands: 2,
        modelType: 'full',
      }

      detector = await (window as any).handPoseDetection.createDetector(
        model,
        detectorConfig
      )
      console.log('Hand tracking initialized successfully')
      return true
    } catch (error) {
      console.error('Error setting up hand tracking:', error)
      alert('Could not access webcam. Please grant camera permissions.')
      return false
    }
  }

  const startDetection = () => {
    if (!detector || !videoEl) {
      console.error('Hand tracking not initialized')
      return
    }
    isDetecting = true
    detectHands()
  }

  const stopDetection = () => {
    isDetecting = false
  }

  const detectHands = async () => {
    if (!isDetecting || !detector || !videoEl) return

    try {
      const hands = await detector.estimateHands(videoEl)

      const handPositions = hands.map((hand: any) => {
        const palmBase = [0, 5, 9, 13, 17].map((i) => hand.keypoints[i])
        const avgX = palmBase.reduce((sum, kp) => sum + kp.x, 0) / palmBase.length
        const avgY = palmBase.reduce((sum, kp) => sum + kp.y, 0) / palmBase.length
        return { x: 640 - avgX, y: avgY } // mirrored x
      })

      if (sendHandsCallback) sendHandsCallback(handPositions)
    } catch (error) {
      console.error('Error detecting hands:', error)
    }

    setTimeout(detectHands, 33) // ~30 FPS
  }

  useEffect(() => {
    const init = async () => {
      await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs')
      await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/hands')
      await loadScript(
        'https://cdn.jsdelivr.net/npm/@tensorflow-models/hand-pose-detection'
      )

      const videoEl = videoRef.current!
      const canvas = canvasRef.current!
      const ctx = canvas.getContext('2d')!

      // Apply mirrored effect to webcam
      videoEl.style.transform = 'scaleX(-1)'

      // Transparent canvas (we just clear it each frame)
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      await setupHandTracking(videoEl, (hands) => {
        // Draw hands on transparent canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        hands.forEach((hand) => {
          ctx.beginPath()
          ctx.arc(hand.x, hand.y, 8, 0, Math.PI * 2)
          ctx.fillStyle = 'red'
          ctx.fill()
        })
      })

      startDetection()
    }

    init().catch(console.error)

    return () => stopDetection()
  }, [])

  return (
    <div className="container">
      <h1>Air Juggler</h1>
      <p className="instructions">Use your hands to keep the balls in the air!</p>

      <div className="canvas-wrapper" style={{ position: 'relative', width: 640, height: 480 }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          width={640}
          height={480}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            transform: 'scaleX(-1)', // mirror
            zIndex: 1,
          }}
        />
        <canvas
          ref={canvasRef}
          width={640}
          height={480}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 2,
            pointerEvents: 'none', // clicks pass through
          }}
        />
      </div>

      <div id="scoreDisplay">
        <p>
          Time: <span id="score">0</span>s
        </p>
      </div>

      <div id="loadingOverlay" className="loading-overlay hidden">
        <div className="loading-content">
          <div className="loader"></div>
          <h2>Loading TensorFlow.js</h2>
          <p id="loadingStatus">Initializing models...</p>
        </div>
      </div>
    </div>
  )
}
