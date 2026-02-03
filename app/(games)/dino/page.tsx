// app/dino-jump/page.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import * as poseDetection from '@tensorflow-models/pose-detection';

// ────────────────────────────────────────────────
// Types & Constants
// ────────────────────────────────────────────────
interface Keypoint { 
  name: string;
  x: number;
  y: number;
  score: number;
}

const TOP_LINE_DEFAULT = 25;
const BOTTOM_LINE_DEFAULT = 75;

// ────────────────────────────────────────────────
// Main Component
// ────────────────────────────────────────────────
export default function DinoJumpGame() {
  const [status, setStatus] = useState('Loading AI model & webcam…');
  const [infoText, setInfoText] = useState('Idle');
  const [topLinePercent, setTopLinePercent] = useState(TOP_LINE_DEFAULT);
  const [bottomLinePercent, setBottomLinePercent] = useState(BOTTOM_LINE_DEFAULT);
  const [removeVideo, setRemoveVideo] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const detectorRef = useRef<poseDetection.PoseDetector | null>(null);

  // ────────────────────────────────────────────────
  // Initialize TensorFlow & MoveNet
  // ────────────────────────────────────────────────
  useEffect(() => {
    async function initTF() {
      try {
        setStatus('Initializing TensorFlow.js…');
        await tf.setBackend('webgl');
        await tf.ready();

        setStatus('Loading MoveNet model…');
        detectorRef.current = await poseDetection.createDetector(
          poseDetection.SupportedModels.MoveNet,
          { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING }
        );

        setStatus('Ready! Allow camera access if prompted.');
      } catch (err: any) {
        console.error(err);
        setStatus(`Error: ${err.message}`);
      }
    }

    initTF();
  }, []);

  // ────────────────────────────────────────────────
  // Start Webcam
  // ────────────────────────────────────────────────
  useEffect(() => {
    async function startWebcam() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      } catch (err: any) {
        setStatus('Webcam access denied or unavailable.');
        alert('Camera access is required to play.');
      }
    }

    startWebcam();
  }, []);

  // ────────────────────────────────────────────────
  // Pose Detection Loop
  // ────────────────────────────────────────────────
  useEffect(() => {
    let animationFrameId: number;

    const detectPose = async () => {
      if (!detectorRef.current || !videoRef.current || !canvasRef.current) {
        animationFrameId = requestAnimationFrame(detectPose);
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (!ctx) return;

      // Resize canvas to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw video frame (unless removed)
      if (!removeVideo) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }

      // Estimate poses
      const poses = await detectorRef.current.estimatePoses(video);

      if (poses.length > 0 && poses[0].keypoints) {
        const keypoints = poses[0].keypoints;
        drawKeypointsAndLines(keypoints, ctx);

        // Check eye/hip positions for jump/crouch
        checkPoseActions(keypoints, canvas.height);
      }

      animationFrameId = requestAnimationFrame(detectPose);
    };

    detectPose();

    return () => cancelAnimationFrame(animationFrameId);
  }, [removeVideo, topLinePercent, bottomLinePercent]);

  // ────────────────────────────────────────────────
  // Draw keypoints & skeleton lines
  // ────────────────────────────────────────────────
  function drawKeypointsAndLines(keypoints: Keypoint[], ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Draw red threshold lines
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 3;

    const topY = ctx.canvas.height * (topLinePercent / 100);
    const bottomY = ctx.canvas.height * (bottomLinePercent / 100);

    ctx.beginPath();
    ctx.moveTo(0, topY);
    ctx.lineTo(ctx.canvas.width, topY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, bottomY);
    ctx.lineTo(ctx.canvas.width, bottomY);
    ctx.stroke();

    // Draw keypoints (red dots)
    keypoints.forEach(kp => {
      if (kp.score > 0.3) {
        ctx.beginPath();
        ctx.arc(kp.x, kp.y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = 'red';
        ctx.fill();
      }
    });

    // Draw skeleton lines (yellow)
    const pairs = poseDetection.util.getAdjacentPairs(poseDetection.SupportedModels.MoveNet);
    ctx.strokeStyle = 'yellow';
    ctx.lineWidth = 2;

    pairs.forEach(([i, j]) => {
      const a = keypoints[i];
      const b = keypoints[j];
      if (a.score > 0.3 && b.score > 0.3) {
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    });
  }

  // ────────────────────────────────────────────────
  // Check pose for crouch / jump commands
  // ────────────────────────────────────────────────
  function checkPoseActions(keypoints: Keypoint[], canvasHeight: number) {
    const leftEye = keypoints.find(k => k.name === 'left_eye');
    const rightEye = keypoints.find(k => k.name === 'right_eye');
    const leftHip = keypoints.find(k => k.name === 'left_hip');
    const rightHip = keypoints.find(k => k.name === 'right_hip');

    const topThreshold = canvasHeight * (topLinePercent / 100);
    const bottomThreshold = canvasHeight * (bottomLinePercent / 100);

    // Crouch logic (hips below bottom line)
    if ((leftHip?.y ?? 0) > bottomThreshold || (rightHip?.y ?? 0) > bottomThreshold) {
      setInfoText('Crouch');
      simulateKey('keydown', 'ArrowDown');
    } else {
      simulateKey('keyup', 'ArrowDown');
    }

    // Jump logic (eyes above top line → head low → jump)
    if ((leftEye?.y ?? 0) < topThreshold || (rightEye?.y ?? 0) < topThreshold) {
      setInfoText('Jump');
      simulateKey('keydown', ' ');
      setTimeout(() => simulateKey('keyup', ' '), 100); // short press
    } else {
      setInfoText('Idle');
    }
  }

  // ────────────────────────────────────────────────
  // Simulate keyboard events for game control
  // ────────────────────────────────────────────────
  function simulateKey(type: 'keydown' | 'keyup', key: string) {
    const event = new KeyboardEvent(type, {
      key,
      code: key === ' ' ? 'Space' : key,
      bubbles: true,
      cancelable: true,
    });
    document.dispatchEvent(event);
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center p-4">
      <h1 className="text-4xl font-bold mb-4">Pose-Controlled Dino Jump</h1>
      <p className="text-gray-400 mb-6 text-center max-w-2xl">
        Use your body to control the T-Rex! Raise your head to jump, crouch to duck.
      </p>

      <div className="text-yellow-400 text-xl mb-6">{status}</div>

      {/* Settings Panel */}
      <div className="bg-white/10 backdrop-blur p-6 rounded-xl mb-8 w-full max-w-2xl">
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="flex-1">
            <label className="block mb-1">Top Line (Jump Trigger %)</label>
            <input
              type="range"
              min="0"
              max="100"
              value={topLinePercent}
              onChange={e => setTopLinePercent(Number(e.target.value))}
              className="w-full"
            />
            <span className="text-sm">{topLinePercent}%</span>
          </div>

          <div className="flex-1">
            <label className="block mb-1">Bottom Line (Crouch Trigger %)</label>
            <input
              type="range"
              min="0"
              max="100"
              value={bottomLinePercent}
              onChange={e => setBottomLinePercent(Number(e.target.value))}
              className="w-full"
            />
            <span className="text-sm">{bottomLinePercent}%</span>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <input
            type="checkbox"
            id="remove-video"
            checked={removeVideo}
            onChange={e => setRemoveVideo(e.target.checked)}
            className="w-5 h-5"
          />
          <label htmlFor="remove-video" className="cursor-pointer">
            Hide video overlay (show only skeleton)
          </label>
        </div>
      </div>

      {/* Video + Canvas */}
      <div className="relative w-full max-w-4xl mx-auto">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full rounded-xl ${removeVideo ? 'hidden' : ''}`}
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full rounded-xl pointer-events-none"
        />
      </div>

      {/* Status Info */}
      <div className="mt-6 text-3xl font-bold text-cyan-400">
        Status: {infoText}
      </div>

      <p className="mt-4 text-gray-500">
        Raise head above top red line = Jump<br />
        Lower hips below bottom red line = Crouch
      </p>
    </div>
  );
}