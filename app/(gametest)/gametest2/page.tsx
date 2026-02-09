'use client'

import { useEffect, useRef } from 'react'
import * as tf from '@tensorflow/tfjs-core'
import '@tensorflow/tfjs-backend-wasm'
import * as handPoseDetection from '@tensorflow-models/hand-pose-detection'

export default function HandDetectionPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    let detector: handPoseDetection.HandDetector
    let animationId: number

    const setupCamera = async () => {
      if (!videoRef.current) return

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
      })

      videoRef.current.srcObject = stream
      await videoRef.current.play()
    }

    const loadModel = async () => {
      await tf.setBackend('wasm')
      await tf.ready()

      detector = await handPoseDetection.createDetector(
        handPoseDetection.SupportedModels.MediaPipeHands,
        {
          runtime: 'tfjs',
          modelType: 'lite',
          maxHands: 2,
        }
      )
    }

    const detectHands = async () => {
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

        hands.forEach(hand => {
          hand.keypoints.forEach(({ x, y }) => {
            ctx.beginPath()
            ctx.arc(x, y, 5, 0, Math.PI * 2)
            ctx.fillStyle = '#ff3b3b'
            ctx.fill()
          })
        })
      }

      animationId = requestAnimationFrame(detectHands)
    }

    const init = async () => {
      await setupCamera()
      await loadModel()
      detectHands()
    }

    init()

    return () => {
      cancelAnimationFrame(animationId)
      detector?.dispose()
    }
  }, [])

  return (
    <div
      style={{
        position: 'relative',
        width: 640,
        height: 480,
      }}
    >
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
