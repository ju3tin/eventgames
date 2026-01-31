"use client"

import { useEffect, useRef, useState, useCallback } from "react"

export interface Keypoint {
  x: number
  y: number
  score?: number
  name?: string
}

export interface Pose {
  keypoints: Keypoint[]
  score?: number
}

interface UsePoseDetectionOptions {
  onPoseDetected?: (poses: Pose[]) => void
  minPoseConfidence?: number
}

export function usePoseDetection(options: UsePoseDetectionOptions = {}) {
  const { onPoseDetected, minPoseConfidence = 0.3 } = options
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const detectorRef = useRef<any>(null)
  const animationFrameRef = useRef<number>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRunning, setIsRunning] = useState(false)

  const startCamera = useCallback(async () => {
    if (!videoRef.current) return

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: 640, 
          height: 480,
          facingMode: "user"
        }
      })
      videoRef.current.srcObject = stream
      await videoRef.current.play()
    } catch (err) {
      setError("Camera access denied. Please enable camera permissions.")
      console.error("Camera error:", err)
    }
  }, [])

  const loadPoseDetection = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Dynamically import TensorFlow.js and pose detection
      const tf = await import("@tensorflow/tfjs-core")
      await import("@tensorflow/tfjs-backend-webgl")
      await tf.setBackend("webgl")
      await tf.ready()

      const poseDetection = await import("@tensorflow-models/pose-detection")
      
      const detector = await poseDetection.createDetector(
        poseDetection.SupportedModels.MoveNet,
        {
          modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
        }
      )
      
      detectorRef.current = detector
      setIsLoading(false)
    } catch (err) {
      setError("Failed to load pose detection model")
      console.error("Model loading error:", err)
      setIsLoading(false)
    }
  }, [])

  const detectPose = useCallback(async () => {
    if (!detectorRef.current || !videoRef.current || !isRunning) return

    if (videoRef.current.readyState >= 2) {
      try {
        const poses = await detectorRef.current.estimatePoses(videoRef.current)
        
        if (poses.length > 0 && poses[0].score >= minPoseConfidence) {
          onPoseDetected?.(poses)
        }
      } catch (err) {
        console.error("Pose detection error:", err)
      }
    }

    animationFrameRef.current = requestAnimationFrame(detectPose)
  }, [isRunning, minPoseConfidence, onPoseDetected])

  const start = useCallback(async () => {
    await startCamera()
    await loadPoseDetection()
    setIsRunning(true)
  }, [startCamera, loadPoseDetection])

  const stop = useCallback(() => {
    setIsRunning(false)
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
    }
  }, [])

  useEffect(() => {
    if (isRunning && !isLoading && detectorRef.current) {
      detectPose()
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isRunning, isLoading, detectPose])

  return {
    videoRef,
    canvasRef,
    isLoading,
    error,
    isRunning,
    start,
    stop
  }
}

// Keypoint indices for MoveNet
export const KEYPOINT_INDICES = {
  nose: 0,
  leftEye: 1,
  rightEye: 2,
  leftEar: 3,
  rightEar: 4,
  leftShoulder: 5,
  rightShoulder: 6,
  leftElbow: 7,
  rightElbow: 8,
  leftWrist: 9,
  rightWrist: 10,
  leftHip: 11,
  rightHip: 12,
  leftKnee: 13,
  rightKnee: 14,
  leftAnkle: 15,
  rightAnkle: 16
}