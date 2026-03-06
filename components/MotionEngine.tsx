"use client"

import { useEffect, useRef } from "react"
import * as poseDetection from "@tensorflow-models/pose-detection"
import * as tf from "@tensorflow/tfjs"

type MotionEngineProps = {
  onPose?: (pose: any) => void
}

export default function MotionEngine({ onPose }: MotionEngineProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const detectorRef = useRef<poseDetection.PoseDetector | null>(null)

  useEffect(() => {
    async function init() {
      await tf.setBackend("webgl")
      await tf.ready()

      detectorRef.current = await poseDetection.createDetector(
        poseDetection.SupportedModels.MoveNet,
        { modelType: "lightning" }
      )

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" }
      })

      if (videoRef.current) videoRef.current.srcObject = stream

      detect()
    }

    async function detect() {
      if (!videoRef.current || !detectorRef.current) return

      const poses = await detectorRef.current.estimatePoses(videoRef.current)

      if (poses.length && onPose) onPose(poses[0])

      requestAnimationFrame(detect)
    }

    init()
  }, [])

  return <video ref={videoRef} autoPlay playsInline className="w-full rounded-xl" />
}