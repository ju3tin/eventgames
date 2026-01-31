"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { 
  Target, 
  Play, 
  Pause, 
  RotateCcw, 
  Trophy,
  Clock,
  Flame,
  ArrowLeft,
  Camera,
  Zap
} from "lucide-react"
import { usePoseDetection, KEYPOINT_INDICES } from "@/hooks/use-pose-detection"
import type { Pose } from "@/hooks/use-pose-detection"
import { saveScore } from "../actions"

interface GameTarget {
  id: number
  x: number
  y: number
  radius: number
  hit: boolean
  spawnTime: number
}

type GameState = "idle" | "countdown" | "playing" | "paused" | "ended"

const GAME_DURATION = 60 // seconds
const TARGET_LIFETIME = 2000 // ms
const HIT_RADIUS = 50 // pixels

export default function PunchTargetsGame() {
  const router = useRouter()
  const [gameState, setGameState] = useState<GameState>("idle")
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [countdown, setCountdown] = useState(3)
  const [targets, setTargets] = useState<GameTarget[]>([])
  const [combo, setCombo] = useState(0)
  const [maxCombo, setMaxCombo] = useState(0)
  const [isSaving, setIsSaving] = useState(false)
  const [leftWristPos, setLeftWristPos] = useState<{ x: number; y: number } | null>(null)
  const [rightWristPos, setRightWristPos] = useState<{ x: number; y: number } | null>(null)
  
  const gameAreaRef = useRef<HTMLDivElement>(null)
  const targetIdRef = useRef(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const spawnRef = useRef<NodeJS.Timeout | null>(null)

  const handlePoseDetected = useCallback((poses: Pose[]) => {
    if (gameState !== "playing" || !poses[0]) return

    const pose = poses[0]
    const leftWrist = pose.keypoints[KEYPOINT_INDICES.leftWrist]
    const rightWrist = pose.keypoints[KEYPOINT_INDICES.rightWrist]

    // Scale positions to game area (video is mirrored)
    if (gameAreaRef.current) {
      const rect = gameAreaRef.current.getBoundingClientRect()
      
      if (leftWrist && leftWrist.score && leftWrist.score > 0.3) {
        const x = rect.width - (leftWrist.x / 640) * rect.width
        const y = (leftWrist.y / 480) * rect.height
        setLeftWristPos({ x, y })
        checkTargetHit(x, y)
      }
      
      if (rightWrist && rightWrist.score && rightWrist.score > 0.3) {
        const x = rect.width - (rightWrist.x / 640) * rect.width
        const y = (rightWrist.y / 480) * rect.height
        setRightWristPos({ x, y })
        checkTargetHit(x, y)
      }
    }
  }, [gameState])

  const { videoRef, isLoading, error, isRunning, start, stop } = usePoseDetection({
    onPoseDetected: handlePoseDetected
  })

  const checkTargetHit = useCallback((x: number, y: number) => {
    setTargets(prev => {
      let hitOccurred = false
      const updated = prev.map(target => {
        if (target.hit) return target
        
        const distance = Math.sqrt(
          Math.pow(x - target.x, 2) + Math.pow(y - target.y, 2)
        )
        
        if (distance < HIT_RADIUS + target.radius) {
          hitOccurred = true
          return { ...target, hit: true }
        }
        return target
      })

      if (hitOccurred) {
        setCombo(c => {
          const newCombo = c + 1
          setMaxCombo(m => Math.max(m, newCombo))
          return newCombo
        })
        setScore(s => s + 100 + (combo * 10))
      }

      return updated
    })
  }, [combo])

  const spawnTarget = useCallback(() => {
    if (!gameAreaRef.current || gameState !== "playing") return

    const rect = gameAreaRef.current.getBoundingClientRect()
    const padding = 80
    const x = padding + Math.random() * (rect.width - padding * 2)
    const y = padding + Math.random() * (rect.height - padding * 2)

    const newTarget: GameTarget = {
      id: targetIdRef.current++,
      x,
      y,
      radius: 35 + Math.random() * 15,
      hit: false,
      spawnTime: Date.now()
    }

    setTargets(prev => [...prev, newTarget])

    // Remove target after lifetime
    setTimeout(() => {
      setTargets(prev => {
        const target = prev.find(t => t.id === newTarget.id)
        if (target && !target.hit) {
          setCombo(0) // Reset combo on miss
        }
        return prev.filter(t => t.id !== newTarget.id)
      })
    }, TARGET_LIFETIME)
  }, [gameState])

  const startGame = useCallback(async () => {
    if (!isRunning) {
      await start()
    }
    
    setGameState("countdown")
    setCountdown(3)
    setScore(0)
    setCombo(0)
    setMaxCombo(0)
    setTimeLeft(GAME_DURATION)
    setTargets([])

    // Countdown
    let count = 3
    const countdownInterval = setInterval(() => {
      count--
      setCountdown(count)
      if (count === 0) {
        clearInterval(countdownInterval)
        setGameState("playing")
      }
    }, 1000)
  }, [isRunning, start])

  const pauseGame = useCallback(() => {
    setGameState("paused")
  }, [])

  const resumeGame = useCallback(() => {
    setGameState("playing")
  }, [])

  const endGame = useCallback(async () => {
    setGameState("ended")
    if (timerRef.current) clearInterval(timerRef.current)
    if (spawnRef.current) clearInterval(spawnRef.current)
    
    // Save score
    if (score > 0) {
      setIsSaving(true)
      await saveScore("punch-targets", score, GAME_DURATION - timeLeft)
      setIsSaving(false)
    }
  }, [score, timeLeft])

  // Game timer
  useEffect(() => {
    if (gameState === "playing") {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            endGame()
            return 0
          }
          return prev - 1
        })
      }, 1000)

      // Spawn targets
      spawnRef.current = setInterval(spawnTarget, 800)
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (spawnRef.current) clearInterval(spawnRef.current)
    }
  }, [gameState, spawnTarget, endGame])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop()
    }
  }, [stop])

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => {
              stop()
              router.push("/games")
            }}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Games
          </Button>

          {gameState === "playing" && (
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="font-mono text-xl font-bold text-foreground">
                  {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-accent" />
                <span className="font-mono text-sm text-accent">x{combo}</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-primary" />
                <span className="font-mono text-xl font-bold text-primary">{score}</span>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 pt-16 flex">
        {/* Game Area */}
        <div className="flex-1 relative overflow-hidden" ref={gameAreaRef}>
          {/* Video Feed (background) */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover opacity-30"
            style={{ transform: "scaleX(-1)" }}
          />

          {/* Targets */}
          {targets.map(target => (
            <div
              key={target.id}
              className={`absolute transition-all duration-100 ${
                target.hit 
                  ? "scale-150 opacity-0" 
                  : "animate-pulse"
              }`}
              style={{
                left: target.x - target.radius,
                top: target.y - target.radius,
                width: target.radius * 2,
                height: target.radius * 2
              }}
            >
              <div className={`w-full h-full rounded-full flex items-center justify-center ${
                target.hit 
                  ? "bg-primary" 
                  : "bg-destructive/80 border-4 border-destructive"
              }`}>
                {!target.hit && <Target className="h-8 w-8 text-foreground" />}
              </div>
            </div>
          ))}

          {/* Hand Cursors */}
          {leftWristPos && gameState === "playing" && (
            <div
              className="absolute w-12 h-12 -ml-6 -mt-6 rounded-full bg-primary/50 border-2 border-primary pointer-events-none"
              style={{ left: leftWristPos.x, top: leftWristPos.y }}
            >
              <div className="w-full h-full rounded-full bg-primary/30 animate-ping" />
            </div>
          )}
          {rightWristPos && gameState === "playing" && (
            <div
              className="absolute w-12 h-12 -ml-6 -mt-6 rounded-full bg-accent/50 border-2 border-accent pointer-events-none"
              style={{ left: rightWristPos.x, top: rightWristPos.y }}
            >
              <div className="w-full h-full rounded-full bg-accent/30 animate-ping" />
            </div>
          )}

          {/* Idle State */}
          {gameState === "idle" && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80">
              <Card className="p-8 max-w-md text-center bg-card border-border">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <Target className="h-10 w-10 text-primary" />
                </div>
                <h2 className="text-2xl font-serif font-bold text-foreground mb-2">
                  Punch the Targets
                </h2>
                <p className="text-muted-foreground mb-6">
                  Use your hands to punch the targets that appear on screen. 
                  Build combos for bonus points!
                </p>
                
                {error ? (
                  <div className="text-destructive mb-4">{error}</div>
                ) : (
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-6">
                    <Camera className="h-4 w-4" />
                    <span>Camera access required</span>
                  </div>
                )}

                <Button 
                  onClick={startGame} 
                  size="lg" 
                  className="w-full gap-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>Loading Model...</>
                  ) : (
                    <>
                      <Play className="h-5 w-5" />
                      Start Game
                    </>
                  )}
                </Button>
              </Card>
            </div>
          )}

          {/* Countdown */}
          {gameState === "countdown" && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80">
              <div className="text-9xl font-bold text-primary animate-pulse">
                {countdown}
              </div>
            </div>
          )}

          {/* Paused */}
          {gameState === "paused" && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80">
              <Card className="p-8 text-center bg-card border-border">
                <Pause className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-2xl font-serif font-bold text-foreground mb-6">
                  Game Paused
                </h2>
                <div className="flex gap-4">
                  <Button onClick={resumeGame} size="lg" className="gap-2">
                    <Play className="h-5 w-5" />
                    Resume
                  </Button>
                  <Button 
                    onClick={() => {
                      stop()
                      router.push("/games")
                    }} 
                    variant="outline" 
                    size="lg"
                  >
                    Quit
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* Game Over */}
          {gameState === "ended" && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80">
              <Card className="p-8 max-w-md text-center bg-card border-border">
                <Trophy className="h-16 w-16 text-primary mx-auto mb-4" />
                <h2 className="text-3xl font-serif font-bold text-foreground mb-2">
                  Game Over!
                </h2>
                
                <div className="grid grid-cols-2 gap-4 my-8">
                  <div className="bg-secondary rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Final Score</p>
                    <p className="text-3xl font-bold text-primary font-mono">{score}</p>
                  </div>
                  <div className="bg-secondary rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Max Combo</p>
                    <p className="text-3xl font-bold text-accent font-mono">x{maxCombo}</p>
                  </div>
                </div>

                {isSaving && (
                  <p className="text-sm text-muted-foreground mb-4">Saving score...</p>
                )}

                <div className="flex gap-4">
                  <Button onClick={startGame} size="lg" className="flex-1 gap-2">
                    <RotateCcw className="h-5 w-5" />
                    Play Again
                  </Button>
                  <Button 
                    onClick={() => router.push("/leaderboard")} 
                    variant="outline" 
                    size="lg"
                    className="flex-1 gap-2"
                  >
                    <Flame className="h-5 w-5" />
                    Leaderboard
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* Pause Button (during gameplay) */}
          {gameState === "playing" && (
            <Button
              onClick={pauseGame}
              variant="outline"
              size="icon"
              className="absolute bottom-4 right-4 bg-background/50"
            >
              <Pause className="h-5 w-5" />
            </Button>
          )}
        </div>
      </main>
    </div>
  )
}