"use client"

import { useEffect, useRef } from "react"
import * as poseDetection from "@tensorflow-models/pose-detection"
import * as tf from "@tensorflow/tfjs"
import { motionEvents } from "@/events/MotionEvents"
import { detectSquat, detectJump, detectPushup, detectPunch } from "../motion/exerciseDetectors"
import { smoothPose } from "@/motion/poseSmoother"
import { drawSkeleton } from "@/utils/drawSkeleton"

export default function MotionEngine() {

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const detectorRef = useRef<any>(null)

  const squatCount = useRef(0)
  const jumpCount = useRef(0)
  const pushupCount = useRef(0)
  const punchCount = useRef(0)

  useEffect(() => {
    async function init() {
      await tf.setBackend("webgl")
      await tf.ready()

      detectorRef.current = await poseDetection.createDetector(
        poseDetection.SupportedModels.MoveNet,
        { modelType:"lightning" }
      )

      const stream = await navigator.mediaDevices.getUserMedia({ video:{ facingMode:"user" } })
      if(videoRef.current) videoRef.current.srcObject = stream

      detect()
    }

    async function detect(){
      if(!videoRef.current || !detectorRef.current) return
      const poses = await detectorRef.current.estimatePoses(videoRef.current)
      if(poses.length){
        const pose = smoothPose(poses[0])
        drawSkeleton(pose, canvasRef.current)

        if(detectSquat(pose)) { squatCount.current++; motionEvents.emit("squat", squatCount.current) }
        if(detectJump(pose)) { jumpCount.current++; motionEvents.emit("jump", jumpCount.current) }
        if(detectPushup(pose)) { pushupCount.current++; motionEvents.emit("pushup", pushupCount.current) }
        if(detectPunch(pose)) { punchCount.current++; motionEvents.emit("punch", punchCount.current) }
      }
      requestAnimationFrame(detect)
    }

    init()
  }, [])

  return (
    <div className="relative w-full">
      <video ref={videoRef} autoPlay playsInline className="w-full rounded-xl"/>
      <canvas ref={canvasRef} width={640} height={480} className="absolute top-0 left-0"/>
    </div>
  )
}