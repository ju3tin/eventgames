'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  createDetector,
  SupportedModels,
  HandPoseDetection,
  Hand,
} from '@tensorflow-models/hand-pose-detection'
import '@tensorflow/tfjs-backend-webgl'
import '@tensorflow/tfjs-backend-wasm'
import * as tfjsWasm from '@tensorflow/tfjs-backend-wasm'
import { drawHands } from '@/lib/utils1' // Adjust path if needed
import { useAnimationFrame } from '@/lib/hooks/useAnimationFrame' // Adjust path
import styles from '@/styles/Home.module.css' // Adjust path if needed

// Set WASM paths once (recommended to do early)
tfjsWasm.setWasmPaths('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm@latest/')

export default function HandPoseDetection() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const detectorRef = useRef<HandPoseDetection | null>(null)
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null)
  const [status, setStatus] = useState<string>('Initializing...')
  const [error, setError] = useState<string | null>(null)

  // ────────────────────────────────────────────────
  // Initialize webcam, detector, and canvas
  // ────────────────────────────────────────────────
  useEffect(() => {
    let stream: MediaStream | null = null

    const initialize = async () => {
      try {
        setStatus('Requesting camera access...')
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
          audio: false,
        })

        const video = videoRef.current
        if (!video) throw new Error('Video element not found')

        video.srcObject = stream
        await new Promise<void>((resolve) => {
          video.onloadedmetadata = () => resolve()
        })
        await video.play()

        video.width = video.videoWidth
        video.height = video.videoHeight

        setStatus('Setting up canvas...')
        const canvas = canvasRef.current
        if (!canvas) throw new Error('Canvas element not found')

        const context = canvas.getContext('2d')
        if (!context) throw new Error('Failed to get canvas context')

        canvas.width = video.width
        canvas.height = video.height
        setCtx(context)

        setStatus('Loading hand detection model...')
        const model = SupportedModels.MediaPipeHands
        const detector = await createDetector(model, {
          runtime: 'mediapipe',
          solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4',
          maxHands: 2,
          modelType: 'full',
        })

        detectorRef.current = detector
        setStatus('Ready — hands should be detected')
      } catch (err: any) {
        console.error('Initialization failed:', err)
        setError(err.message || 'Failed to initialize hand detection')
        setStatus('Error occurred')
      }
    }

    initialize()

    // Cleanup: stop camera stream when component unmounts
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  // ────────────────────────────────────────────────
  // Animation loop: detect hands and draw
  // ────────────────────────────────────────────────
  useAnimationFrame(async () => {
    if (!detectorRef.current || !videoRef.current || !ctx) return

    try {
      const hands: Hand[] = await detectorRef.current.estimateHands(videoRef.current, {
        flipHorizontal: false,
      })

      // Clear canvas and redraw video frame
      ctx.clearRect(0, 0, videoRef.current.videoWidth, videoRef.current.videoHeight)
      ctx.drawImage(
        videoRef.current,
        0,
        0,
        videoRef.current.videoWidth,
        videoRef.current.videoHeight
      )

      // Draw detected hands
      drawHands(hands, ctx)
    } catch (err) {
      console.error('Detection error:', err)
    }
  }, !!(detectorRef.current && videoRef.current && ctx))

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h2 style={{ fontWeight: 'normal' }}>
          <Link href="/" style={{ fontWeight: 'bold' }}>
            Home
          </Link>{' '}
          / Hand Pose Detection 👋
        </h2>

        <code style={{ marginBottom: '1rem' }}>
          {error ? `Error: ${error}` : status}
        </code>

        <canvas
          ref={canvasRef}
          style={{
            transform: 'scaleX(-1)',
            zIndex: 1,
            borderRadius: '1rem',
            boxShadow: '0 3px 10px rgb(0 0 0)',
            maxWidth: '85vw',
          }}
        />

        <video
          ref={videoRef}
          style={{
            visibility: 'hidden',
            transform: 'scaleX(-1)',
            position: 'absolute',
            top: 0,
            left: 0,
            width: 0,
            height: 0,
          }}
          playsInline
        />
      </main>
    </div>
  )
}