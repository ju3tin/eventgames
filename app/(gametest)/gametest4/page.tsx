// app/page.tsx
'use client'

import { useEffect } from 'react'

export default function HomePage() {
  useEffect(() => {
    // Helper to dynamically load scripts
    const loadScript = (src: string) =>
      new Promise<void>((resolve, reject) => {
        const script = document.createElement('script')
        script.src = src
        script.async = true
        script.onload = () => resolve()
        script.onerror = () => reject(new Error(`Failed to load script: ${src}`))
        document.body.appendChild(script)
      })

    const init = async () => {
      // Show loading overlay
      const loadingStatus = document.getElementById('loadingStatus')
      if (loadingStatus) loadingStatus.textContent = 'Loading scripts...'

      // Load TFJS + MediaPipe Hands + hand-pose-detection from CDN
      await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs')
      await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/hands')
      await loadScript(
        'https://cdn.jsdelivr.net/npm/@tensorflow-models/hand-pose-detection'
      )

      if (loadingStatus) loadingStatus.textContent = 'Initializing detector...'

      // @ts-ignore
      const tf = window.tf
      // @ts-ignore
      const handPoseDetection = window.handPoseDetection

      await tf.setBackend('webgl')
      await tf.ready()

      // Create the hand detector
      const detector = await handPoseDetection.createDetector(
        handPoseDetection.SupportedModels.MediaPipeHands,
        {
          runtime: 'mediapipe',
          modelType: 'lite',
          maxHands: 2,
          solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1646424915',
        }
      )

      if (loadingStatus) loadingStatus.textContent = 'Starting webcam...'

      // Setup webcam
      const video = document.getElementById('webcam') as HTMLVideoElement
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
      })
      video.srcObject = stream
      await video.play()

      if (loadingStatus) loadingStatus.textContent = 'Ready!'

      // Main loop: draw hand keypoints
      const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement
      const ctx = canvas.getContext('2d')

      const render = async () => {
        if (!ctx || !video) return
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        const hands = await detector.estimateHands(video)
        hands.forEach((hand: any) => {
          hand.keypoints.forEach((p: any) => {
            ctx.beginPath()
            ctx.arc(p.x, p.y, 5, 0, Math.PI * 2)
            ctx.fillStyle = 'red'
            ctx.fill()
          })
        })

        requestAnimationFrame(render)
      }

      render()
    }

    init().catch(console.error)
  }, [])

  return (
    <div className="container">
      <h1>Air Juggler</h1>
      <p className="instructions">Use your hands to keep the balls in the air!</p>

      <div className="canvas-wrapper">
        <video
          id="webcam"
          autoPlay
          playsInline
          style={{ position: 'absolute', width: 640, height: 480 }}
        />
        <canvas
          id="gameCanvas"
          width={640}
          height={480}
          style={{ position: 'absolute' }}
        />
        <div id="overlay" className="overlay">
          <h2 id="overlayMessage">Ready to Play?</h2>
          <button id="startButton">Start Game</button>
        </div>
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
