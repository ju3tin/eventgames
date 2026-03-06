"use client"

import MotionEngine from "@/components/MotionEngine"
import { motionEvents } from "@/events/MotionEvents"
import { useEffect, useState } from "react"

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