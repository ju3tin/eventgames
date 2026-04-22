"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

declare global {
  interface Window {
    tf: any;
    poseDetection: any;
  }
}

export default function Page() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const gameAreaRef = useRef<HTMLDivElement | null>(null);

  const [gameState, setGameState] = useState<
    "idle" | "countdown" | "playing" | "ended"
  >("idle");

  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [countdown, setCountdown] = useState(3);

  const detectorRef = useRef<any>(null);
  const animationRef = useRef<number | null>(null);

  const GAME_DURATION = 60;
  const SPAWN_INTERVAL = 800;
  const TARGET_LIFETIME = 2200;
  const HIT_RADIUS = 55;

  // ─────────────────────────────
  // Load model from CDN globals
  // ─────────────────────────────
  async function loadModel() {
    const tf = window.tf;
    const poseDetection = window.poseDetection;

    await tf.setBackend("webgl");
    await tf.ready();

    detectorRef.current = await poseDetection.createDetector(
      poseDetection.SupportedModels.MoveNet,
      { modelType: "SinglePose.Lightning" }
    );
  }

  // ─────────────────────────────
  async function startCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" },
    });

    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
    }
  }

  // ─────────────────────────────
  async function startGame() {
    if (gameState !== "idle") return;

    if (!detectorRef.current) {
      await loadModel();
    }

    await startCamera();

    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setTimeLeft(GAME_DURATION);

    setGameState("countdown");

    let c = 3;
    setCountdown(c);

    const cd = setInterval(() => {
      c--;
      setCountdown(c);

      if (c <= 0) {
        clearInterval(cd);
        setGameState("playing");
        startGameLoop();
      }
    }, 1000);
  }

  // ─────────────────────────────
  function startGameLoop() {
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          endGame();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    const spawner = setInterval(spawnTarget, SPAWN_INTERVAL);

    const detect = async () => {
      if (gameState !== "playing") return;

      const video = videoRef.current;
      const gameArea = gameAreaRef.current;

      if (!video || !gameArea) return;

      if (video.readyState >= 2) {
        const poses = await detectorRef.current.estimatePoses(video);

        if (poses?.length > 0) {
          const pose = poses[0];
          const rect = gameArea.getBoundingClientRect();

          const scaleX = rect.width / video.videoWidth;
          const scaleY = rect.height / video.videoHeight;

          const check = (kp: any) => {
            if (kp?.score > 0.35) {
              const x = rect.width - kp.x * scaleX;
              const y = kp.y * scaleY;
              checkHit(x, y);
            }
          };

          check(pose.keypoints[9]);
          check(pose.keypoints[10]);
        }
      }

      animationRef.current = requestAnimationFrame(detect);
    };

    detect();
  }

  // ─────────────────────────────
  function spawnTarget() {
    if (gameState !== "playing") return;

    const gameArea = gameAreaRef.current;
    if (!gameArea) return;

    const rect = gameArea.getBoundingClientRect();

    const x = Math.random() * rect.width;
    const y = Math.random() * rect.height;
    const r = 40;

    const el = document.createElement("div");
    el.className = "target";
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.width = `${r * 2}px`;
    el.style.height = `${r * 2}px`;

    el.dataset.x = String(x);
    el.dataset.y = String(y);
    el.dataset.radius = String(r);

    gameArea.appendChild(el);

    setTimeout(() => {
      el.remove();
      setCombo(0);
    }, TARGET_LIFETIME);
  }

  function checkHit(wx: number, wy: number) {
    const targets = document.querySelectorAll(".target");

    let hit = false;

    targets.forEach((t: any) => {
      const tx = parseFloat(t.dataset.x);
      const ty = parseFloat(t.dataset.y);
      const tr = parseFloat(t.dataset.radius);

      const dist = Math.hypot(wx - tx, wy - ty);

      if (dist < HIT_RADIUS + tr) {
        t.remove();
        hit = true;
      }
    });

    if (hit) {
      setCombo((c) => {
        const nc = c + 1;
        setMaxCombo((m) => Math.max(m, nc));
        setScore((s) => s + 100 + nc * 15);
        return nc;
      });
    }
  }

  function endGame() {
    setGameState("ended");
  }

  // ─────────────────────────────
  return (
    <>
      {/* CDN Scripts */}
      <Script
        src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js"
        strategy="beforeInteractive"
      />
      <Script
        src="https://cdn.jsdelivr.net/npm/@tensorflow-models/pose-detection@2.1.3"
        strategy="beforeInteractive"
      />

      <div className="container">
        <header>
          ⏱ {timeLeft}s ⚡ {combo} 🏆 {score}
        </header>

        <div ref={gameAreaRef} className="gameArea">
          <video ref={videoRef} autoPlay playsInline muted />
        </div>

        {gameState === "idle" && (
          <div className="overlay">
            <button onClick={startGame}>Start Game</button>
          </div>
        )}

        {gameState === "countdown" && (
          <div className="overlay">
            <div className="count">{countdown}</div>
          </div>
        )}

        {gameState === "ended" && (
          <div className="overlay">
            <h1>Game Over</h1>
            <p>Score: {score}</p>
            <p>Max Combo: {maxCombo}</p>
            <button onClick={() => location.reload()}>Play Again</button>
          </div>
        )}

        <style jsx>{`
          .container {
            height: 100vh;
            background: black;
            color: white;
          }

          header {
            position: fixed;
            top: 0;
            width: 100%;
            text-align: center;
            padding: 10px;
            background: rgba(0, 0, 0, 0.5);
          }

          .gameArea {
            width: 100%;
            height: 100%;
            position: relative;
          }

          video {
            width: 100%;
            height: 100%;
            object-fit: cover;
            opacity: 0.3;
            transform: scaleX(-1);
          }

          .target {
            position: absolute;
            background: red;
            border-radius: 50%;
          }

          .overlay {
            position: absolute;
            inset: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            background: rgba(0, 0, 0, 0.7);
            flex-direction: column;
          }

          .count {
            font-size: 120px;
          }
        `}</style>
      </div>
    </>
  );
}
