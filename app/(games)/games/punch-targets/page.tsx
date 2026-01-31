"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
  Zap,
} from "lucide-react";
import { usePoseDetection, KEYPOINT_INDICES } from "@/hooks/use-pose-detection";
import type { Pose } from "@/hooks/use-pose-detection";
import { saveScore } from "../actions";

interface GameTarget {
  id: number;
  x: number;
  y: number;
  radius: number;
  hit: boolean;
  spawnTime: number;
}

type GameState = "idle" | "countdown" | "playing" | "paused" | "ended";

const GAME_DURATION = 60; // seconds
const TARGET_SPAWN_INTERVAL = 800; // ms
const TARGET_LIFETIME = 2200; // ms – slightly longer than before
const HIT_RADIUS = 55; // pixels – bit more forgiving

export default function PunchTargetsGame() {
  const router = useRouter();
  const [gameState, setGameState] = useState<GameState>("idle");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [countdown, setCountdown] = useState(3);
  const [targets, setTargets] = useState<GameTarget[]>([]);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const gameAreaRef = useRef<HTMLDivElement>(null);
  const targetIdRef = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const spawnRef = useRef<NodeJS.Timeout | null>(null);

  const { videoRef, isLoading, error, isRunning, start, stop } = usePoseDetection({
    onPosesDetected: (poses) => {
      if (gameState !== "playing" || !poses[0]) return;

      const pose = poses[0];
      const rect = gameAreaRef.current?.getBoundingClientRect();
      if (!rect) return;

      // Because video is mirrored (user-facing camera)
      const scaleX = rect.width / 640;
      const scaleY = rect.height / 480;

      // Left wrist (appears on right side of screen due to mirroring)
      const leftWrist = pose.keypoints[KEYPOINT_INDICES.leftWrist];
      if (leftWrist?.score && leftWrist.score > 0.35) {
        const x = rect.width - leftWrist.x * scaleX;
        const y = leftWrist.y * scaleY;
        checkHit(x, y);
      }

      // Right wrist
      const rightWrist = pose.keypoints[KEYPOINT_INDICES.rightWrist];
      if (rightWrist?.score && rightWrist.score > 0.35) {
        const x = rect.width - rightWrist.x * scaleX;
        const y = rightWrist.y * scaleY;
        checkHit(x, y);
      }
    },
  });

  const checkHit = useCallback((x: number, y: number) => {
    setTargets((prev) => {
      let hitAny = false;
      const updated = prev.map((t) => {
        if (t.hit) return t;
        const dist = Math.hypot(x - t.x, y - t.y);
        if (dist < HIT_RADIUS + t.radius) {
          hitAny = true;
          return { ...t, hit: true };
        }
        return t;
      });

      if (hitAny) {
        setCombo((c) => {
          const newCombo = c + 1;
          setMaxCombo((m) => Math.max(m, newCombo));
          return newCombo;
        });
        setScore((s) => s + 100 + combo * 15); // slightly better combo bonus
        // Optional: play punch sound here
      }

      return updated;
    });
  }, [combo]);

  const spawnTarget = useCallback(() => {
    if (gameState !== "playing" || !gameAreaRef.current) return;

    const rect = gameAreaRef.current.getBoundingClientRect();
    const padding = 90;
    const x = padding + Math.random() * (rect.width - padding * 2);
    const y = padding + Math.random() * (rect.height - padding * 2);

    const target: GameTarget = {
      id: targetIdRef.current++,
      x,
      y,
      radius: 32 + Math.random() * 18,
      hit: false,
      spawnTime: Date.now(),
    };

    setTargets((prev) => [...prev, target]);

    // Auto-remove after lifetime if not hit
    setTimeout(() => {
      setTargets((prev) => {
        const stillExists = prev.find((t) => t.id === target.id);
        if (stillExists && !stillExists.hit) {
          setCombo(0); // miss → combo reset
        }
        return prev.filter((t) => t.id !== target.id);
      });
    }, TARGET_LIFETIME);
  }, [gameState]);

  const startGame = useCallback(async () => {
    if (!isRunning) await start();

    setGameState("countdown");
    setCountdown(3);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setTimeLeft(GAME_DURATION);
    setTargets([]);

    let count = 3;
    const interval = setInterval(() => {
      count--;
      setCountdown(count);
      if (count <= 0) {
        clearInterval(interval);
        setGameState("playing");
      }
    }, 1000);
  }, [isRunning, start]);

  const endGame = useCallback(async () => {
    setGameState("ended");
    if (timerRef.current) clearInterval(timerRef.current);
    if (spawnRef.current) clearInterval(spawnRef.current);

    if (score > 0) {
      setIsSaving(true);
      try {
        await saveScore("punch-targets", score, GAME_DURATION - timeLeft);
      } finally {
        setIsSaving(false);
      }
    }
  }, [score, timeLeft]);

  // Game timers & spawner
  useEffect(() => {
    if (gameState === "playing") {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            endGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      spawnRef.current = setInterval(spawnTarget, TARGET_SPAWN_INTERVAL);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (spawnRef.current) clearInterval(spawnRef.current);
    };
  }, [gameState, spawnTarget, endGame]);

  // Full cleanup on unmount
  useEffect(() => () => stop(), [stop]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/40 flex flex-col">
      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-50 bg-background/90 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              stop();
              router.push("/games");
            }}
            className="gap-1.5"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          {gameState === "playing" && (
            <div className="flex items-center gap-5 sm:gap-8 text-sm font-medium">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="font-mono font-bold">
                  {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-yellow-500" />
                <span className="font-mono">×{combo}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Trophy className="h-4 w-4 text-primary" />
                <span className="font-mono font-bold text-primary">{score}</span>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 pt-16 flex flex-col">
        <div ref={gameAreaRef} className="relative flex-1 overflow-hidden">
          {/* Mirrored webcam feed – low opacity background */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover opacity-25 pointer-events-none"
            style={{ transform: "scaleX(-1)" }}
          />

          {/* Targets */}
          {targets.map((t) => (
            <div
              key={t.id}
              className={`absolute transition-all duration-200 ease-out ${
                t.hit ? "scale-150 opacity-0 rotate-12" : "animate-pulse scale-100"
              }`}
              style={{
                left: `${t.x - t.radius}px`,
                top: `${t.y - t.radius}px`,
                width: `${t.radius * 2}px`,
                height: `${t.radius * 2}px`,
              }}
            >
              <div
                className={`w-full h-full rounded-full flex items-center justify-center border-4 ${
                  t.hit
                    ? "bg-primary border-primary animate-ping-once"
                    : "bg-destructive/70 border-destructive"
                }`}
              >
                {!t.hit && <Target className="h-9 w-9 text-white/90" />}
              </div>
            </div>
          ))}

          {/* Idle screen */}
          {gameState === "idle" && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-background/90 to-transparent backdrop-blur-sm">
              <Card className="w-full max-w-md mx-4 p-8 text-center shadow-2xl border-primary/20">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <Target className="h-10 w-10 text-primary" />
                </div>
                <h1 className="text-3xl font-bold mb-3">Punch Targets</h1>
                <p className="text-muted-foreground mb-8 leading-relaxed">
                  Punch as many targets as you can in 60 seconds.<br />
                  Build combos for bonus points!
                </p>

                {error && <p className="text-destructive mb-6">{error}</p>}

                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-6">
                  <Camera className="h-4 w-4" />
                  <span>Camera access required</span>
                </div>

                <Button
                  onClick={startGame}
                  size="lg"
                  className="w-full text-lg gap-2"
                  disabled={isLoading}
                >
                  {isLoading ? "Loading model..." : <>Start Game <Play className="h-5 w-5" /></>}
                </Button>
              </Card>
            </div>
          )}

          {/* Countdown overlay */}
          {gameState === "countdown" && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
              <div className="text-9xl sm:text-[12rem] font-black text-primary animate-pulse tracking-tighter">
                {countdown}
              </div>
            </div>
          )}

          {/* Paused overlay */}
          {gameState === "paused" && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-md">
              <Card className="p-10 text-center max-w-sm mx-4">
                <Pause className="h-20 w-20 mx-auto mb-6 text-muted-foreground" />
                <h2 className="text-4xl font-bold mb-8">Paused</h2>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button onClick={() => setGameState("playing")} size="lg" className="flex-1 gap-2">
                    <Play className="h-5 w-5" /> Resume
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="flex-1"
                    onClick={() => {
                      stop();
                      router.push("/games");
                    }}
                  >
                    Quit
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* Game Over screen */}
          {gameState === "ended" && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-background/90 to-background/70 backdrop-blur-sm">
              <Card className="w-full max-w-lg mx-4 p-8 text-center shadow-2xl">
                <Trophy className="h-24 w-24 mx-auto mb-6 text-yellow-500" />
                <h2 className="text-5xl font-bold mb-2">Game Over!</h2>

                <div className="grid grid-cols-2 gap-6 my-10">
                  <div className="bg-muted/50 rounded-xl p-6">
                    <p className="text-sm text-muted-foreground mb-1">Score</p>
                    <p className="text-4xl font-black text-primary">{score}</p>
                  </div>
                  <div className="bg-muted/50 rounded-xl p-6">
                    <p className="text-sm text-muted-foreground mb-1">Best Combo</p>
                    <p className="text-4xl font-black text-accent">×{maxCombo}</p>
                  </div>
                </div>

                {isSaving && <p className="text-muted-foreground mb-6">Saving score...</p>}

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button onClick={startGame} size="lg" className="flex-1 gap-2">
                    <RotateCcw className="h-5 w-5" /> Play Again
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="flex-1 gap-2"
                    onClick={() => router.push("/leaderboard")}
                  >
                    <Flame className="h-5 w-5" /> Leaderboard
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* Pause button (only when playing) */}
          {gameState === "playing" && (
            <Button
              variant="secondary"
              size="icon"
              className="absolute bottom-6 right-6 rounded-full shadow-lg bg-background/80 backdrop-blur-sm border"
              onClick={() => setGameState("paused")}
            >
              <Pause className="h-6 w-6" />
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}