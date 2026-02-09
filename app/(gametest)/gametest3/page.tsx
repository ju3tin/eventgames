'use client'

import { useEffect, useRef } from 'react'
import * as tf from '@tensorflow/tfjs-core'
import '@tensorflow/tfjs-backend-webgl'

export default function HandDetectionPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    let detector: any
    let rafId: number

    const setupCamera = async () => {
      const video = videoRef.current
      if (!video) return

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
      })

      video.srcObject = stream
      await video.play()
    }

    const loadModel = async () => {
      await tf.setBackend('webgl')
      await tf.ready()

      // ✅ LOAD HAND-POSE-DETECTION FROM CDN
      const handPoseDetection = await import(
        'https://esm.sh/@tensorflow-models/hand-pose-detection@2.0.1'
      )

      detector = await handPoseDetection.createDetector(
        handPoseDetection.SupportedModels.MediaPipeHands,
        {
          runtime: 'mediapipe',
          modelType: 'lite',
          maxHands: 2,
          solutionPath:
            'https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1646424915',
        }
      )
    }

    const render = async () => {
      if (
        detector &&
        videoRef.current &&
        canvasRef.current &&
        videoRef.current.readyState === 4
      ) {
        const hands = await detector.estimateHands(videoRef.current)
        const ctx = canvasRef.current.getContext('2d')
        if (!ctx) return

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
      await loadModel()
      render()
    }

    init()

    return () => {
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
