"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

export default function PoseDetector() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [detector, setDetector] = useState(null);

  const drawPose = (poses) => {
    const ctx = canvasRef.current.getContext("2d");
    const video = videoRef.current;
    if (!ctx || !video) return;

    const canvasWidth = canvasRef.current.width;
    const canvasHeight = canvasRef.current.height;
    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;

    // Clear previous frame
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    poses.forEach((pose) => {
      // Draw keypoints
      pose.keypoints.forEach((kp) => {
        if (kp.score > 0.5) {
          const x = (kp.x / videoWidth) * canvasWidth;
          const y = (kp.y / videoHeight) * canvasHeight;
          ctx.beginPath();
          ctx.arc(x, y, 5, 0, 2 * Math.PI);
          ctx.fillStyle = "red";
          ctx.fill();
        }
      });

      // Draw skeleton
      const adjacentPairs = window.poseDetection.util.getAdjacentPairs(
        window.poseDetection.SupportedModels.MoveNet
      );
      adjacentPairs.forEach(([i, j]) => {
        const kp1 = pose.keypoints[i];
        const kp2 = pose.keypoints[j];
        if (kp1.score > 0.5 && kp2.score > 0.5) {
          const x1 = (kp1.x / videoWidth) * canvasWidth;
          const y1 = (kp1.y / videoHeight) * canvasHeight;
          const x2 = (kp2.x / videoWidth) * canvasWidth;
          const y2 = (kp2.y / videoHeight) * canvasHeight;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.lineWidth = 2;
          ctx.strokeStyle = "lime";
          ctx.stroke();
        }
      });
    });
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    async function initPoseDetector() {
      if (!window.tf || !window.poseDetection) return;

      const detector = await window.poseDetection.createDetector(
        window.poseDetection.SupportedModels.MoveNet
      );
      setDetector(detector);

      if (navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          video.onloadedmetadata = () => {
            video.play();

            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            // Start detection loop
            const detectLoop = async () => {
              if (!detector) return;
              const poses = await detector.estimatePoses(video);
              drawPose(poses);
              requestAnimationFrame(detectLoop);
            };
            detectLoop();
          };
        }
      }
    }

    initPoseDetector();
  }, [detector]);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "640px",
        margin: "0 auto",
      }}
    >
      <Script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs" strategy="beforeInteractive" />
      <Script
        src="https://cdn.jsdelivr.net/npm/@tensorflow-models/pose-detection"
        strategy="beforeInteractive"
      />

      <video
        ref={videoRef}
        autoPlay
        playsInline
        style={{
          width: "100%",
          height: "auto",
          borderRadius: "8px",
          objectFit: "cover",
        }}
      />
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}