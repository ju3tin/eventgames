"use client"  // make the entire page a client component

import { useState } from "react"
import dynamic from "next/dynamic"
import { detectJump } from "@/motion/detectJump"

// Dynamically import MotionEngine to prevent server-side import errors
const MotionEngine = dynamic(() => import("@/components/MotionEngine"), {
  ssr: false
})

export default function JumpGame() {
  const [score, setScore] = useState(0)

  function handlePose(pose: any) {
    if (detectJump(pose)) {
      setScore(prev => prev + 1)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen p-4 bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-4">Jump Game</h1>
      <p className="mb-4 text-xl">Score: {score}</p>
      <div className="w-full max-w-md">
        <MotionEngine onPose={handlePose} />
      </div>
      <p className="mt-4 text-center text-sm text-gray-400">
        Jump in front of the camera to score points!
      </p>
    </div>
  )
}