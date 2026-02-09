'use client'

import { useEffect, useRef } from 'react'
import * as tf from '@tensorflow/tfjs-core'
import '@tensorflow/tfjs-backend-webgl'
import * as handPoseDetection from '@tensorflow-models/hand-pose-detection'

export default function HandDetectionPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    let detector: handPoseDetection.HandDetector

    const setupCamera = async () => {
      if (!videoRef.current) return

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
      })

      videoRef.current.srcObject = stream
      await videoRef.current.play()
    }

    const loadModel = async () => {
      await tf.setBackend('webgl')
      await tf.ready()

      detector = await handPoseDetection.createDetector(
        handPoseDetection.SupportedModels.MediaPipeHands,
        {
          runtime: 'mediapipe',
          modelType: 'lite',
          solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/hands',
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
          hand.keypoints.forEach(point => {
            ctx.beginPath()
            ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI)
            ctx.fillStyle = 'red'
            ctx.fill()
          })
        })
      }

      requestAnimationFrame(detectHands)
    }

    const init = async () => {
      await setupCamera()
      await loadModel()
      detectHands()
    }

    init()
  }, [])

  return (
    <div style={{ position: 'relative', width: 640, height: 480 }}>
      <video
        ref={videoRef}
        width={640}
        height={480}
        style={{ position: 'absolute' }}
        muted
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
