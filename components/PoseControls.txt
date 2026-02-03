// components/PoseControls.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import * as poseDetection from '@tensorflow-models/pose-detection'
import '@tensorflow/tfjs-backend-webgl'

export default function PoseControls() {
  const videoRef = useRef<HTMLVideoElement>(null!)
  const canvasRef = useRef<HTMLCanvasElement>(null!)
  const [info, setInfo] = useState('Idle')
  const [topLinePercent] = useState(25)
  const [bottomLinePercent] = useState(75)
  const [removeVideo, setRemoveVideo] = useState(true)

  useEffect(() => {
    let detector: poseDetection.PoseDetector | null = null

    async function init() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
        }

        detector = await poseDetection.createDetector(
          poseDetection.SupportedModels.MoveNet,
          { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING }
        )

        detectPose()
      } catch (err) {
        console.error('Camera / model error:', err)
      }
    }

    async function detectPose() {
      if (!videoRef.current || !canvasRef.current || !detector) return

      const ctx = canvasRef.current.getContext('2d')!
      const video = videoRef.current

      canvasRef.current.width = video.videoWidth
      canvasRef.current.height = video.videoHeight

      const poses = await detector.estimatePoses(video)

      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
      ctx.drawImage(video, 0, 0)

      if (poses.length > 0) {
        const keypoints = poses[0].keypoints
        drawKeypointsAndSkeleton(keypoints, ctx)

        // Your logic — hips below bottom line → crouch → simulate ArrowDown
        const leftHip  = keypoints.find(k => k.name === 'left_hip')
        const rightHip = keypoints.find(k => k.name === 'right_hip')

        const bottomY = canvasRef.current.height * (bottomLinePercent / 100)

        if (leftHip && rightHip && (leftHip.y > bottomY || rightHip.y > bottomY)) {
          setInfo('Crouch')
          simulateKey('ArrowDown', 'keydown')
        } else {
          setInfo('Idle')
          simulateKey('ArrowDown', 'keyup')
        }

        // Eyes below top line → jump (or your original logic)
        const leftEye  = keypoints.find(k => k.name === 'left_eye')
        const rightEye = keypoints.find(k => k.name === 'right_eye')

        const topY = canvasRef.current.height * (topLinePercent / 100)

        if (leftEye && rightEye && (leftEye.y > topY || rightEye.y > topY)) {
          simulateKey(' ', 'keydown')   // Space = jump
        } else {
          simulateKey(' ', 'keyup')
        }
      }

      requestAnimationFrame(detectPose)
    }

    init()

    return () => {
      // cleanup stream
      videoRef.current?.srcObject instanceof MediaStream &&
        videoRef.current.srcObject.getTracks().forEach(t => t.stop())
    }
  }, [])

  function drawKeypointsAndSkeleton(keypoints: poseDetection.Keypoint[], ctx: CanvasRenderingContext2D) {
    // Your original draw logic — circles + yellow lines between keypoints
    // (copy-paste most of your drawKeypoints function here)
    // ...
  }

  return (
    <>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-4xl font-bold text-white z-10 bg-black/50 px-8 py-4 rounded-xl">
        {info}
      </div>

      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`absolute top-0 left-0 w-[440px] h-[280px] ${removeVideo ? 'hidden' : ''}`}
      />

      <canvas
        ref={canvasRef}
        className={`absolute top-0 left-0 w-[440px] h-[280px] ${removeVideo ? 'hidden' : ''}`}
      />

      {/* Settings panel – same as your original */}
      <div className="absolute top-4 right-4 bg-white/90 p-4 rounded-lg text-black z-10">
        {/* sliders + checkbox here – use state to control top/bottomLinePercent */}
      </div>
    </>
  )
}