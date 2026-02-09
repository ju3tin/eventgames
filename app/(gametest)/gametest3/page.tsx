// app/(gametest)/gametest2/page.tsx

'use client'

import { useRef, useState, useEffect } from 'react'
import Script from 'next/script'

export default function MediaPipeHandsTest() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [status, setStatus] = useState('Waiting for libraries...')
  const [error, setError] = useState<string | null>(null)
  const [libsReady, setLibsReady] = useState(false)
  const [detector, setDetector] = useState<any>(null)
  const [testResult, setTestResult] = useState<string>('Not tested yet')

  // ────────────────────────────────────────────────
  // 1. Load webcam when everything is ready
  // ────────────────────────────────────────────────
  useEffect(() => {
    if (!libsReady || !videoRef.current) return

    const video = videoRef.current

    const startWebcam = async () => {
      try {
        setStatus('Requesting camera access...')
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        })

        video.srcObject = stream
        await video.play()
        setStatus('Webcam ready ✓')
      } catch (err: any) {
        console.error('Webcam failed:', err)
        setError(
          err.name === 'NotAllowedError'
            ? 'Camera permission denied. Please allow it in browser settings.'
            : 'Could not start webcam: ' + (err.message || err.name)
        )
      }
    }

    startWebcam()

    return () => {
      if (video.srcObject) {
        (video.srcObject as MediaStream).getTracks().forEach(t => t.stop())
      }
    }
  }, [libsReady])

  // ────────────────────────────────────────────────
  // 2. Create detector once libraries are loaded
  // ────────────────────────────────────────────────
  useEffect(() => {
    if (!libsReady) return

    const initDetector = async () => {
      try {
        setStatus('Creating hand detector...')
        if (!(window as any).handPoseDetection) {
          throw new Error('handPoseDetection global not found')
        }

        const model = (window as any).handPoseDetection.SupportedModels.MediaPipeHands
        const detectorConfig = {
          runtime: 'mediapipe',
          solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4',
          modelType: 'full',
        }

        const det = await (window as any).handPoseDetection.createDetector(model, detectorConfig)
        setDetector(det)
        setStatus('Hand detector ready ✓ Click "Test Detection"')
      } catch (err: any) {
        console.error('Detector init failed:', err)
        setError('Failed to initialize hand detector: ' + (err.message || 'Unknown error'))
      }
    }

    initDetector()
  }, [libsReady])

  // ────────────────────────────────────────────────
  // 3. Run one frame of hand detection
  // ────────────────────────────────────────────────
  const testDetection = async () => {
    if (!detector || !videoRef.current) {
      setError('Detector or video not ready')
      return
    }

    try {
      setStatus('Detecting hands...')
      const hands = await detector.estimateHands(videoRef.current)

      if (hands.length === 0) {
        setTestResult('No hands detected in this frame')
      } else {
        const firstHand = hands[0]
        const wrist = firstHand.keypoints[0] // wrist is keypoint 0
        setTestResult(
          `Detected ${hands.length} hand(s). ` +
          `Wrist position ≈ (${Math.round(wrist.x)}, ${Math.round(wrist.y)})`
        )
      }
      setStatus('Detection complete ✓')
    } catch (err: any) {
      console.error('Detection failed:', err)
      setError('Hand detection failed: ' + (err.message || 'Unknown'))
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 flex flex-col items-center">
      <h1 className="text-4xl font-bold mb-6">MediaPipe Hands Quick Test</h1>

      <p className="text-lg mb-6 text-center max-w-2xl">
        This page loads TensorFlow.js + MediaPipe Hands + Hand Pose Detection model,<br />
        accesses your webcam, and runs one frame of hand detection when you click the button.
      </p>

      <div className="mb-6 text-xl font-semibold">
        Status: <span className={status.includes('✓') ? 'text-green-400' : 'text-yellow-400'}>
          {status}
        </span>
      </div>

      {error && (
        <div className="bg-red-900/70 p-6 rounded-xl mb-8 max-w-xl text-center">
          <strong className="text-red-300 block mb-2 text-xl">Error</strong>
          {error}
        </div>
      )}

      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        width={640}
        height={480}
        className="rounded-xl border-4 border-gray-700 shadow-2xl transform scale-x-[-1] mb-8"
        style={{ background: '#000' }}
      />

      <button
        onClick={testDetection}
        disabled={!detector || !!error}
        className={`px-10 py-5 text-xl font-bold rounded-full transition-all mb-6 ${
          detector && !error
            ? 'bg-green-600 hover:bg-green-700'
            : 'bg-gray-600 cursor-not-allowed'
        }`}
      >
        {detector ? 'Test Hand Detection (one frame)' : 'Waiting for model...'}
      </button>

      <div className="text-2xl font-mono bg-gray-800 p-6 rounded-xl min-w-[400px] text-center">
        {testResult}
      </div>

      {/* Scripts – load in correct order */}
      <Script
        src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js"
        strategy="beforeInteractive"
        onLoad={() => console.log('TF.js loaded')}
      />

      <Script
        src="https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4/hands.js"
        strategy="beforeInteractive"
        onLoad={() => console.log('MediaPipe Hands runtime loaded')}
      />

      <Script
        src="https://cdn.jsdelivr.net/npm/@tensorflow-models/hand-pose-detection@2.1.0"
        strategy="afterInteractive"
        onLoad={() => {
          console.log('Hand Pose Detection model script loaded')
          setTimeout(() => {
            if ((window as any).handPoseDetection) {
              console.log('handPoseDetection global is ready')
              setLibsReady(true)
            } else {
              setError('handPoseDetection not found after load – possible script order issue')
            }
          }, 1000)
        }}
      />
    </div>
  )
}