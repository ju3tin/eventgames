"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

export default function PoseDetector() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [detector, setDetector] = useState(null);
  const handsRef = useRef(null);

  const lastFrameTimeRef = useRef(performance.now());
  const fpsRef = useRef(0);

  // Draw poses + hands on canvas
  const drawFrame = (poses, handResults, ctx, video) => {
    const canvas = canvasRef.current;
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.drawImage(video, 0, 0, canvasWidth, canvasHeight);

    let totalScore = 0;
    let keypointCount = 0;

    // Draw pose keypoints and skeleton
    poses.forEach((pose) => {
      pose.keypoints.forEach((kp) => {
        if (kp.score > 0.5) {
          const x = (kp.x / video.videoWidth) * canvasWidth;
          const y = (kp.y / video.videoHeight) * canvasHeight;
          ctx.beginPath();
          ctx.arc(x, y, 5, 0, 2 * Math.PI);
          ctx.fillStyle = "red";
          ctx.fill();

          totalScore += kp.score;
          keypointCount++;
        }
      });

      const adjacentPairs = window.poseDetection.util.getAdjacentPairs(
        window.poseDetection.SupportedModels.MoveNet
      );
      adjacentPairs.forEach(([i, j]) => {
        const kp1 = pose.keypoints[i];
        const kp2 = pose.keypoints[j];
        if (kp1.score > 0.5 && kp2.score > 0.5) {
          const x1 = (kp1.x / video.videoWidth) * canvasWidth;
          const y1 = (kp1.y / video.videoHeight) * canvasHeight;
          const x2 = (kp2.x / video.videoWidth) * canvasWidth;
          const y2 = (kp2.y / video.videoHeight) * canvasHeight;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.lineWidth = 2;
          ctx.strokeStyle = "lime";
          ctx.stroke();
        }
      });
    });

    // Draw hand landmarks
    if (handResults?.multiHandLandmarks) {
      handResults.multiHandLandmarks.forEach((landmarks) => {
        landmarks.forEach((lm) => {
          const x = lm.x * canvasWidth;
          const y = lm.y * canvasHeight;
          ctx.beginPath();
          ctx.arc(x, y, 4, 0, 2 * Math.PI);
          ctx.fillStyle = "yellow";
          ctx.fill();
        });

        const connections = window.Hands.HAND_CONNECTIONS;
        connections.forEach(([i, j]) => {
          const lm1 = landmarks[i];
          const lm2 = landmarks[j];
          ctx.beginPath();
          ctx.moveTo(lm1.x * canvasWidth, lm1.y * canvasHeight);
          ctx.lineTo(lm2.x * canvasWidth, lm2.y * canvasHeight);
          ctx.strokeStyle = "orange";
          ctx.lineWidth = 2;
          ctx.stroke();
        });
      });
    }

    // Draw FPS
    const now = performance.now();
    fpsRef.current = 1000 / (now - lastFrameTimeRef.current);
    lastFrameTimeRef.current = now;
    ctx.fillStyle = "white";
    ctx.font = "16px sans-serif";
    ctx.fillText(`FPS: ${fpsRef.current.toFixed(1)}`, 10, 20);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    let animationFrameId;

    async function init() {
      if (!window.tf || !window.poseDetection || !window.Hands) return;

      await window.tf.setBackend("webgl");
      await window.tf.ready();

      const poseDetector = await window.poseDetection.createDetector(
        window.poseDetection.SupportedModels.MoveNet,
        { modelType: window.poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING }
      );
      setDetector(poseDetector);

      const hands = new window.Hands.Hands({ 
        maxNumHands: 2, 
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });
      handsRef.current = hands;

      const video = videoRef.current;
      if (navigator.mediaDevices.getUserMedia && video) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
        video.onloadedmetadata = () => {
          video.play();

          const canvas = canvasRef.current;
          const ctx = canvas.getContext("2d");

          const resizeCanvas = () => {
            const parent = canvas.parentElement;
            canvas.width = parent.clientWidth;
            canvas.height = parent.clientHeight;
          };
          resizeCanvas();
          window.addEventListener("resize", resizeCanvas);

          hands.onResults((results) => {
            handsRef.current.latestResults = results;
          });

          const detectLoop = async () => {
            if (!poseDetector) return;

            const poses = await poseDetector.estimatePoses(video);
            const handResults = handsRef.current.latestResults;
            drawFrame(poses, handResults, ctx, video);

            animationFrameId = requestAnimationFrame(detectLoop);
          };
          detectLoop();

          const handsLoop = async () => {
            if (hands && video) {
              await hands.send({ image: video });
              requestAnimationFrame(handsLoop);
            }
          };
          handsLoop();
        };
      }

      return () => window.removeEventListener("resize", resizeCanvas);
    }

    init();

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "100vw",
        aspectRatio: "4/3",
        margin: "0 auto",
      }}
    >
      <Script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs" strategy="beforeInteractive" />
      <Script src="https://cdn.jsdelivr.net/npm/@tensorflow-models/pose-detection" strategy="beforeInteractive" />
      <Script src="https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js" strategy="beforeInteractive" />

      <video ref={videoRef} style={{ display: "none" }} playsInline autoPlay />
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "8px",
          display: "block",
        }}
      />
    </div>
  );
}