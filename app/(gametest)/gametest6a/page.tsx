'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'

type GameOption = {
  game_id: string
  title: string
}

export default function AirJugglerPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [games, setGames] = useState<GameOption[]>([])
  const [selectedGameId, setSelectedGameId] = useState<string>('')
  
  const router = useRouter()

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const overlayRef = useRef<HTMLDivElement | null>(null)
  const overlayMessageRef = useRef<HTMLHeadingElement | null>(null)
  const startButtonRef = useRef<HTMLButtonElement | null>(null)
  const scoreRef = useRef<HTMLSpanElement | null>(null)
  const loadingOverlayRef = useRef<HTMLDivElement | null>(null)
  const loadingStatusRef = useRef<HTMLParagraphElement | null>(null)

  // --- Game Config ---
  const config = {
    ballCount: 1,
    ballRadius: 20,
    gravity: 0.2,
    bounceVelocity: -8,
    handRadius: 50,
    countdownTime: 3,
  }

  // --- Game State ---
  const gameState = {
    balls: [] as { x: number; y: number; vx: number; vy: number; radius: number; color: string }[],
    hands: [] as { x: number; y: number }[],
    score: 0,
    gameOver: false,
    startTime: 0,
    animationId: 0,
    countdown: 0,
    isCountingDown: false,
  }

  let detector: any = null
  let videoEl: HTMLVideoElement | null = null
  let isDetecting = false
  let sendHandsCallback: ((hands: { x: number; y: number }[]) => void) | null = null

  // --- Utility: Load Scripts ---
  const loadScript = (src: string) =>
    new Promise<void>((resolve, reject) => {
      const script = document.createElement('script')
      script.src = src
      script.async = true
      script.onload = () => resolve()
      script.onerror = () => reject(new Error(`Failed to load script: ${src}`))
      document.body.appendChild(script)
    })

  // --- Hand Tracking ---
  const setupHandTracking = async (
    videoElement: HTMLVideoElement,
    sendHands: (hands: { x: number; y: number }[]) => void
  ) => {
    videoEl = videoElement
    sendHandsCallback = sendHands

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } })
      videoEl.srcObject = stream
      await videoEl.play()

      const model = (window as any).handPoseDetection.SupportedModels.MediaPipeHands
      const detectorConfig = {
        runtime: 'mediapipe',
        solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1646424915',
        maxHands: 2,
        modelType: 'full',
      }

      detector = await (window as any).handPoseDetection.createDetector(model, detectorConfig)
      console.log('Hand tracking initialized successfully')
      return true
    } catch (error) {
      console.error('Error setting up hand tracking:', error)
      alert('Could not access webcam. Please grant camera permissions.')
      return false
    }
  }

  const startDetection = () => {
    if (!detector || !videoEl) return
    isDetecting = true
    detectHands()
  }

  const stopDetection = () => {
    isDetecting = false
  }

  const detectHands = async () => {
    if (!isDetecting || !detector || !videoEl) return

    try {
      const hands = await detector.estimateHands(videoEl)
      const handPositions = hands.map((hand: any) => {
        const palmBase = [0, 5, 9, 13, 17].map((i) => hand.keypoints[i])
        const avgX = palmBase.reduce((sum, kp) => sum + kp.x, 0) / palmBase.length
        const avgY = palmBase.reduce((sum, kp) => sum + kp.y, 0) / palmBase.length
        return { x: 640 - avgX, y: avgY } // mirror horizontally
      })
      if (sendHandsCallback) sendHandsCallback(handPositions)
    } catch (error) {
      console.error('Error detecting hands:', error)
    }

    setTimeout(detectHands, 33)
  }

  // --- Balls ---
  const initBalls = () => {
    gameState.balls = []
    for (let i = 0; i < config.ballCount; i++) {
      gameState.balls.push({
        x: 320,
        y: 100,
        vx: 0,
        vy: 0,
        radius: config.ballRadius,
        color: `hsl(${i * 120}, 70%, 60%)`,
      })
    }
  }

  const updateBalls = () => {
    const canvas = canvasRef.current!
    gameState.balls.forEach((ball) => {
      ball.vy += config.gravity
      ball.x += ball.vx
      ball.y += ball.vy

      // Bounce off walls
      if (ball.x - ball.radius < 0 || ball.x + ball.radius > canvas.width) {
        ball.vx *= -1
        ball.x = ball.x < canvas.width / 2 ? ball.radius : canvas.width - ball.radius
      }

      if (ball.y - ball.radius < 0) {
        ball.vy *= -1
        ball.y = ball.radius
      }
    })
  }

  const checkCollisions = () => {
    gameState.balls.forEach((ball) => {
      gameState.hands.forEach((hand) => {
        const dx = ball.x - hand.x
        const dy = ball.y - hand.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        if (distance < ball.radius + config.handRadius) {
          ball.vy = config.bounceVelocity
          ball.vx += dx * 0.1
          const angle = Math.atan2(dy, dx)
          ball.x = hand.x + Math.cos(angle) * (ball.radius + config.handRadius)
          ball.y = hand.y + Math.sin(angle) * (ball.radius + config.handRadius)
        }
      })
    })
  }

  const checkGameOver = () => gameState.balls.some((ball) => ball.y - ball.radius > canvasRef.current!.height)

  const updateScore = () => {
    if (gameState.startTime && !gameState.gameOver && scoreRef.current) {
      gameState.score = Math.floor((Date.now() - gameState.startTime) / 1000)
      scoreRef.current.textContent = gameState.score.toString()
    }
  }

  // --- Rendering ---
  const render = () => {
    const ctx = canvasRef.current!.getContext('2d')!
    const video = videoRef.current!

    // Draw video
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      ctx.save()
      ctx.scale(-1, 1)
      ctx.drawImage(video, -canvasRef.current!.width, 0, 640, 480)
      ctx.restore()
      ctx.fillStyle = 'rgba(0,0,0,0.3)'
      ctx.fillRect(0, 0, 640, 480)
    } else {
      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, 640, 480)
    }

    // Draw balls
    gameState.balls.forEach((ball) => {
      ctx.fillStyle = ball.color
      ctx.beginPath()
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = 'white'
      ctx.lineWidth = 2
      ctx.stroke()
    })

    // Draw hands
    gameState.hands.forEach((hand, index) => {
      ctx.strokeStyle = 'rgba(255,255,255,0.8)'
      ctx.lineWidth = 4
      ctx.beginPath()
      ctx.arc(hand.x, hand.y, config.handRadius, 0, Math.PI * 2)
      ctx.stroke()
      ctx.fillStyle = 'rgba(100,200,255,0.3)'
      ctx.fill()
      ctx.fillStyle = 'white'
      ctx.beginPath()
      ctx.arc(hand.x, hand.y, 5, 0, Math.PI * 2)
      ctx.fill()
      ctx.font = 'bold 16px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(`Hand ${index + 1}`, hand.x, hand.y - config.handRadius - 10)
    })

    // Countdown
    if (gameState.isCountingDown) {
      ctx.fillStyle = 'rgba(0,0,0,0.5)'
      ctx.fillRect(0, 0, 640, 480)
      ctx.fillStyle = 'white'
      ctx.font = 'bold 72px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(Math.ceil(gameState.countdown).toString(), 320, 240)
      ctx.font = 'bold 24px Arial'
      ctx.fillText('Get Ready!', 320, 300)
    }
  }

  const gameLoop = () => {
    if (gameState.gameOver) return

    if (gameState.isCountingDown) {
      gameState.countdown -= 1 / 60
      if (gameState.countdown <= 0) {
        gameState.isCountingDown = false
        gameState.startTime = Date.now()
      }
    } else {
      updateBalls()
      checkCollisions()
      updateScore()
      if (checkGameOver()) endGame()
    }

    render()
    gameState.animationId = requestAnimationFrame(gameLoop)
  }

  // --- Game Controls ---
  const startGame = async () => {
    if (!overlayRef.current || !videoRef.current || !loadingOverlayRef.current || !loadingStatusRef.current) return

    // Reset game state
    gameState.gameOver = false
    gameState.startTime = 0
    gameState.score = 0
    gameState.hands = []
    gameState.countdown = config.countdownTime
    gameState.isCountingDown = true
    initBalls()

    // Show loading overlay
    loadingOverlayRef.current.style.display = 'flex'
    loadingStatusRef.current.textContent = 'Requesting camera access...'

    const success = await setupHandTracking(videoRef.current, (hands) => (gameState.hands = hands))
    
    loadingOverlayRef.current.style.display = 'none'
    if (!success) {
      endGame()
      if (overlayMessageRef.current) overlayMessageRef.current.textContent = 'Camera access required to play!'
      return
    }

    overlayRef.current.style.display = 'none'
    startDetection()
    gameLoop()
  }

  const endGame = () => {
    gameState.gameOver = true
    cancelAnimationFrame(gameState.animationId)
    stopDetection()

    if (!overlayRef.current || !overlayMessageRef.current || !startButtonRef.current) return

    const emoji = gameState.score > 30 ? '🎉' : gameState.score > 15 ? '👏' : '💪'
    const message = gameState.score > 30 ? 'Amazing!' : gameState.score > 15 ? 'Great Job!' : 'Game Over!'

    overlayMessageRef.current.innerHTML = `
      <div style="font-size:3rem;margin-bottom:0.5rem;">${emoji}</div>
      <div style="font-size:2rem;margin-bottom:0.5rem;">${message}</div>
      <div style="font-size:1.2rem;color:#666;font-family:'Poppins',sans-serif;font-weight:600;">
        You survived ${gameState.score} seconds
      </div>
    `
    startButtonRef.current.textContent = 'Play Again'
    overlayRef.current.style.display = 'flex'
  }

  // --- Load Scripts & Attach Button ---
  useEffect(() => {
    const initScripts = async () => {
      await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs')
      await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/hands')
      await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow-models/hand-pose-detection')
      startButtonRef.current?.addEventListener('click', startGame)
    }
    initScripts()

    return () => {
      cancelAnimationFrame(gameState.animationId)
      stopDetection()
    }
  }, [])

  // --- Supabase User & Games ---
  useEffect(() => {
    const supabase = createClient()
    const initialize = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        router.push('/auth/login')
        return
      }

      setUser(session.user)

      const { data: gamesData, error: gamesError } = await supabase
        .from('gameslist')
        .select('game_id, title')
        .order('title', { ascending: true })

      if (gamesError) console.error('Error loading games:', gamesError.message)
      else if (gamesData?.length) {
        setGames(gamesData as GameOption[])
        setSelectedGameId(gamesData[0].game_id)
      }

      setLoading(false)
    }

    initialize()
  }, [router])

  return (
    <div className="container">
      <h1>Air Juggler</h1>
      <p className="instructions">Use your hands to keep the balls in the air!</p>
      <p className="mb-8">Logged in as: <strong>{user?.email}</strong></p>

      <div className="canvas-wrapper" style={{ position: 'relative', width: 640, height: 480 }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          width={640}
          height={480}
          style={{ position: 'absolute', top: 0, left: 0, transform: 'scaleX(-1)', zIndex: 1 }}
        />
        <canvas
          ref={canvasRef}
          width={640}
          height={480}
          style={{ position: 'absolute', top: 0, left: 0, zIndex: 2, pointerEvents: 'none' }}
        />
        <div
          ref={overlayRef}
          style={{
            position: 'absolute',
            top: '0%',
            left: '0%',
            width: 640,
            height: 480,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 3,
          }}
        >
          <h2 ref={overlayMessageRef}>Ready to Play?</h2>
          <button ref={startButtonRef}>Start Game</button>
        </div>
      </div>

      <div id="scoreDisplay">
        <p>Time: <span ref={scoreRef}>0</span>s</p>
      </div>

      <div
        ref={loadingOverlayRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 640,
          height: 480,
          background: 'rgba(0,0,0,0.7)',
          display: 'none',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 4,
        }}
      >
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div className="loader" />
          <h2>Loading TensorFlow.js</h2>
          <p ref={loadingStatusRef}>Initializing models...</p>
        </div>
      </div>
    </div>
  )
}
