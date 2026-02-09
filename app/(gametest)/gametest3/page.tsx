'use client'

import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    tf: any
    handPoseDetection: any
  }
}

export default function HandDetectionPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    let detector: any
    let rafId: number
    let mounted = true

    const setupCamera = async () => {
      const video = videoRef.current!
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
      })
      video.srcObject = stream
      await video.play()
    }

    const loadFromCDN = async () => {
      // 🔥 Load everything lazily from CDN
      await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-core')
      await loadScript(
        'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-webgl'
      )
      await loadScript(
        'https://cdn.jsdelivr.net/npm/@tensorflow-models/hand-pose-detection'
      )
      await loadScript(
        'https://cdn.jsdelivr.net/npm/@mediapipe/hands'
      )

      const tf = window.tf
      const handPoseDetection = window.handPoseDetection

      await tf.setBackend('webgl')
      await tf.ready()

      if (!mounted) return

      detector = await handPoseDetection.createDetector(
        handPoseDetection.SupportedModels.MediaPipeHands,
        {
          runtime: 'mediapipe',
          modelType: 'lite',
          maxHands: 2,
        }
      )
    }

    const render = async () => {
      if (
        detector &&
        videoRef.current?.readyState === 4 &&
        canvasRef.current
      ) {
        const hands = await detector.estimateHands(videoRef.current)
        const ctx = canvasRef.current.getContext('2d')!
        ctx.clearRect(0, 0, 640, 480)

        hands.forEach((hand: any) => {
          hand.keypoints.forEach((p: any) => {
            ctx.beginPath()
            ctx.arc(p.x, p.y, 5, 0, Math.PI * 2)
            ctx.fillStyle = 'red'
            ctx.fill()
          })
        })
      }

      rafId = requestAnimationFrame(render)
    }

    const init = async () => {
      await setupCamera()
      await loadFromCDN()
      render()
    }

    init()

    return () => {
      mounted = false
      cancelAnimationFrame(rafId)
      detector?.dispose?.()
    }
  }, [])

  return (
    <div style={{ position: 'relative', width: 640, height: 480 }}>
      <video
        ref={videoRef}
        width={640}
        height={480}
        style={{ position: 'absolute' }}
        muted
        playsInline
      />
      <canvas
        ref={canvasRef}
        width={640}
        height={480}
        style={{ position: 'absolute' }}
      />
    </div>
  )
}
