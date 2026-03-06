"use client"

import { motionEvents } from "@/events/MotionEvents"
import { useEffect, useState } from "react"
import dynamic from "next/dynamic"

const MotionEngine = dynamic(() => import("@/components/MotionEngine"), { ssr: false })


export default function SquatGame(){

  const [reps,setReps] = useState(0)

  useEffect(()=>{
    motionEvents.on("squat", (count:number)=> setReps(count))
  },[])

  return (
    <div>
      <h1>Squat Battle</h1>
      <p>Reps: {reps}</p>
      <MotionEngine />
    </div>
  )
}