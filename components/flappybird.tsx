"use client"

import { useRef, useState, useEffect, useCallback } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Text, Sky, Box } from "@react-three/drei"
import * as THREE from "three"

interface GameState {
  isPlaying: boolean
  isGameOver: boolean
  score: number
}

interface BirdProps {
  position: THREE.Vector3
  velocity: { current: number }
  gameState: GameState
  onCollision: () => void
}

interface PipeProps {
  position: [number, number, number]
  gapHeight: number
  onScoreIncrease: () => void
  gameState: GameState
  birdPosition: THREE.Vector3
  onCollision: () => void
}

export default function Component() {
  const [gameState, setGameState] = useState<GameState>({
    isPlaying: false,
    isGameOver: false,
    score: 0,
  })

  const birdPosition = useRef(new THREE.Vector3(0, 0, 0))
  const birdVelocity = useRef(0)

  const startGame = useCallback(() => {
    setGameState({
      isPlaying: true,
      isGameOver: false,
      score: 0,
    })
    birdPosition.current.set(0, 0, 0)
    birdVelocity.current = 0
  }, [])

  const gameOver = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      isPlaying: false,
      isGameOver: true,
    }))
    // Reset bird position and velocity when game over
    birdPosition.current.set(0, 0, 0)
    birdVelocity.current = 0
  }, [])

  const increaseScore = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      score: prev.score + 1,
    }))
  }, [])

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (event.code === "Space") {
        event.preventDefault()
        if (!gameState.isPlaying && !gameState.isGameOver) {
          startGame()
        } else if (gameState.isPlaying) {
          birdVelocity.current = 0.08
        } else if (gameState.isGameOver) {
          startGame()
        }
      }
    },
    [gameState, startGame],
  )

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [handleKeyPress])

  return (
    <div className="w-full h-screen relative">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <Sky sunPosition={[100, 20, 100]} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1} />

        <Bird position={birdPosition.current} velocity={birdVelocity} gameState={gameState} onCollision={gameOver} />

        <GameWorld
          gameState={gameState}
          birdPosition={birdPosition.current}
          onScoreIncrease={increaseScore}
          onCollision={gameOver}
        />

        <UI gameState={gameState} />
      </Canvas>
    </div>
  )
}

function Bird({ position, velocity, gameState, onCollision }: BirdProps) {
  const birdRef = useRef<THREE.Mesh>(null)
  const gravity = -0.003

  useFrame(() => {
    if (!gameState.isPlaying) return

    // Apply gravity
    velocity.current += gravity

    // Update position
    position.y += velocity.current

    // Update bird mesh position
    if (birdRef.current) {
      birdRef.current.position.copy(position)
      // Rotate bird based on velocity
      birdRef.current.rotation.z = Math.max(-0.5, Math.min(0.5, velocity.current * 3))

      // Update camera to follow bird (first-person view)
      const camera = birdRef.current.parent?.parent?.children.find((child) => child.type === "PerspectiveCamera")
      if (camera) {
        camera.position.x = position.x - 3
        camera.position.y = position.y
        camera.position.z = position.z + 2
        camera.lookAt(position.x + 2, position.y, position.z)
      }
    }

    // Check ground collision
    if (position.y < -3) {
      onCollision()
    }

    // Check ceiling collision
    if (position.y > 4) {
      onCollision()
    }
  })

  return (
    <mesh ref={birdRef} position={[position.x, position.y, position.z]}>
      <sphereGeometry args={[0.2, 16, 16]} />
      <meshStandardMaterial color="#FFD700" />
      {/* Bird beak */}
      <mesh position={[0.15, 0, 0]}>
        <coneGeometry args={[0.05, 0.15, 8]} />
        <meshStandardMaterial color="#FF8C00" />
      </mesh>
      {/* Bird eye */}
      <mesh position={[0.1, 0.1, 0.1]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial color="#000" />
      </mesh>
    </mesh>
  )
}

function GameWorld({
  gameState,
  birdPosition,
  onScoreIncrease,
  onCollision,
}: {
  gameState: GameState
  birdPosition: THREE.Vector3
  onScoreIncrease: () => void
  onCollision: () => void
}) {
  const [pipes, setPipes] = useState<Array<{ id: number; x: number; gapY: number; scored: boolean }>>([])
  const pipeIdCounter = useRef(0)

  useFrame(() => {
    if (!gameState.isPlaying) return

    // Move pipes and remove off-screen ones
    setPipes((prevPipes) => {
      return prevPipes.map((pipe) => ({ ...pipe, x: pipe.x - 0.05 })).filter((pipe) => pipe.x > -6)
    })

    // Add new pipes
    setPipes((prevPipes) => {
      const lastPipe = prevPipes[prevPipes.length - 1]
      if (!lastPipe || lastPipe.x < 2) {
        const newPipe = {
          id: pipeIdCounter.current++,
          x: 6,
          gapY: (Math.random() - 0.5) * 3,
          scored: false,
        }
        return [...prevPipes, newPipe]
      }
      return prevPipes
    })
  })

  // Add this useEffect in the GameWorld component after the existing useFrame
  useEffect(() => {
    if (gameState.isGameOver) {
      setPipes([])
      pipeIdCounter.current = 0
    }
  }, [gameState.isGameOver])

  return (
    <>
      {/* Ground */}
      <Box args={[20, 0.5, 2]} position={[0, -3.5, 0]}>
        <meshStandardMaterial color="#8B4513" />
      </Box>

      {/* Ceiling */}
      <Box args={[20, 0.5, 2]} position={[0, 4.5, 0]}>
        <meshStandardMaterial color="#8B4513" />
      </Box>

      {pipes.map((pipe) => (
        <Pipe
          key={pipe.id}
          position={[pipe.x, pipe.gapY, 0]}
          gapHeight={1.5}
          gameState={gameState}
          birdPosition={birdPosition}
          onScoreIncrease={() => {
            if (!pipe.scored && pipe.x < birdPosition.x) {
              pipe.scored = true
              onScoreIncrease()
            }
          }}
          onCollision={onCollision}
        />
      ))}
    </>
  )
}

function Pipe({ position, gapHeight, gameState, birdPosition, onScoreIncrease, onCollision }: PipeProps) {
  const topPipeRef = useRef<THREE.Mesh>(null)
  const bottomPipeRef = useRef<THREE.Mesh>(null)

  useFrame(() => {
    if (!gameState.isPlaying) return

    // Check collision with bird
    const pipeX = position[0]
    const pipeY = position[1]
    const birdX = birdPosition.x
    const birdY = birdPosition.y

    // Check if bird is in pipe's x range
    if (Math.abs(birdX - pipeX) < 0.5) {
      // Check if bird is not in the gap
      if (birdY > pipeY + gapHeight / 2 || birdY < pipeY - gapHeight / 2) {
        onCollision()
      }
    }

    // Check for scoring
    if (pipeX < birdX - 0.5) {
      onScoreIncrease()
    }
  })

  return (
    <group position={position}>
      {/* Top pipe */}
      <mesh ref={topPipeRef} position={[0, gapHeight / 2 + 2.5, 0]}>
        <boxGeometry args={[0.8, 4, 1]} />
        <meshStandardMaterial color="#228B22" />
      </mesh>

      {/* Bottom pipe */}
      <mesh ref={bottomPipeRef} position={[0, -gapHeight / 2 - 2.5, 0]}>
        <boxGeometry args={[0.8, 4, 1]} />
        <meshStandardMaterial color="#228B22" />
      </mesh>
    </group>
  )
}

function UI({ gameState }: { gameState: GameState }) {
  return (
    <>
      {/* Score */}
      <Text position={[0, 3, 0]} fontSize={0.5} color="#000" anchorX="center" anchorY="middle">
        {gameState.score}
      </Text>

      {/* Start screen */}
      {!gameState.isPlaying && !gameState.isGameOver && (
        <group>
          <Text position={[0, 1, 0]} fontSize={0.3} color="#000" anchorX="center" anchorY="middle">
            {"Flappy Bird 3D"}
          </Text>
          <Text position={[0, 0, 0]} fontSize={0.2} color="#000" anchorX="center" anchorY="middle">
            {"Press SPACE to start"}
          </Text>
        </group>
      )}

      {/* Game over screen */}
      {gameState.isGameOver && (
        <group>
          <Text position={[0, 1, 0]} fontSize={0.3} color="#FF0000" anchorX="center" anchorY="middle">
            {"Game Over"}
          </Text>
          <Text position={[0, 0.5, 0]} fontSize={0.2} color="#000" anchorX="center" anchorY="middle">
            {`Score: ${gameState.score}`}
          </Text>
          <Text position={[0, 0, 0]} fontSize={0.2} color="#000" anchorX="center" anchorY="middle">
            {"Press SPACE to restart"}
          </Text>
        </group>
      )}

      {/* Instructions during gameplay */}
      {gameState.isPlaying && (
        <Text position={[0, -2.5, 0]} fontSize={0.15} color="#000" anchorX="center" anchorY="middle">
          {"Press SPACE to flap"}
        </Text>
      )}
    </>
  )
}
