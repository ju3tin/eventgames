"use client"  // make the entire page a client component

import { useState } from "react"
import dynamic from "next/dynamic"
//import { detectJump } from "@/motion/detectJump"

// Dynamically import MotionEngine to prevent server-side import errors


export default function JumpGame() {
  const [score, setScore] = useState(0)

  

  return (
    <div className="flex flex-col items-center justify-center h-screen p-4 bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-4">Jump Game</h1>
      <p className="mb-4 text-xl">Score: {score}</p>
      <div className="w-full max-w-md">
       </div>
      <p className="mt-4 text-center text-sm text-gray-400">
        Jump in front of the camera to score points!
      </p>
    </div>
  )
}