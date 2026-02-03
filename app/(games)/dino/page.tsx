// app/dino/page.tsx
'use client'

import { useState } from 'react'
import DinoGame from '@/components/DinoGame'
import PoseControls from '@/components/PoseControls'

export default function DinoPage() {
  const [started, setStarted] = useState(false)

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black">
      {!started ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-20 bg-gray-900/80">
          <h1 className="text-6xl font-bold mb-8">Chrome Dino Runner</h1>
          <p className="text-2xl mb-12">Use your body to control the game!</p>
          <button
            onClick={() => setStarted(true)}
            className="px-12 py-6 bg-yellow-500 hover:bg-yellow-600 text-black text-3xl font-bold rounded-xl shadow-2xl transform hover:scale-105 transition"
          >
            Jump to Start
          </button>
        </div>
      ) : null}

      <DinoGame started={started} />

      {started && <PoseControls />}
    </div>
  )
}