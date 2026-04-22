"use client"

import { useEffect, useRef } from "react"

declare global {
  interface Window {
    tf: any
    posenet: any
  }
}

export default function PoseNetPage() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    let net: any

    const loadScripts = async () => {
      // TensorFlow.js
      await loadScript(
        "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.14.0/dist/tf.min.js"
      )

      // PoseNet
      await loadScript(
        "https://cdn.jsdelivr.net/npm/@tensorflow-models/posenet@2.2.2"
      )

      // Camera
      await setupCamera()

      // Load model
      net = await window.posenet.load({
        architecture: "MobileNetV1",
        outputStride: 16,
        inputResolution: { width: 640, height: 480 },
        multiplier: 0.75,
      })

      detectPose(net)
    }

    loadScripts()

    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
        tracks.forEach(track => track.stop())
      }
    }
  }, [])

  const setupCamera = async () => {
    const video = videoRef.current
    if (!video) return

    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 640, height: 480 },
    })

    video.srcObject = stream
    return new Promise<void>(resolve => {
      video.onloadedmetadata = () => {
        video.play()
        resolve()
      }
    })
  }

  const detectPose = async (net: any) => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    const ctx = canvas.getContext("2d")!

    const poseDetectionFrame = async () => {
      const pose = await net.estimateSinglePose(video, {
        flipHorizontal: true,
      })

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      drawPose(pose, ctx)

      requestAnimationFrame(poseDetectionFrame)
    }

    poseDetectionFrame()
  }

  const drawPose = (pose: any, ctx: CanvasRenderingContext2D) => {
    pose.keypoints.forEach((kp: any) => {
      if (kp.score > 0.5) {
        ctx.beginPath()
        ctx.arc(kp.position.x, kp.position.y, 5, 0, 2 * Math.PI)
        ctx.fillStyle = "#00ffcc"
        ctx.fill()
      }
    })
  }

  const loadScript = (src: string) =>
    new Promise<void>((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) return resolve()
      const script = document.createElement("script")
      script.src = src
      script.async = true
      script.onload = () => resolve()
      script.onerror = reject
      document.body.appendChild(script)
    })

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
      <h1 className="text-2xl font-bold mb-4">PoseNet (CDN)</h1>

      <div className="relative">
        <video
          ref={videoRef}
          width={640}
          height={480}
          className="rounded-xl"
          playsInline
          muted
        />
        <canvas
          ref={canvasRef}
          width={640}
          height={480}
          className="absolute top-0 left-0"
        />
      </div>
    </div>
  )
}
