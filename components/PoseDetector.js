"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

export default function PoseDetector() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [detector, setDetector] = useState(null);

  const drawPose = (poses) => {
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    // Clear only canvas, video is underneath
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    poses.forEach((pose) => {
      // Draw keypoints
      pose.keypoints.forEach((kp) => {
        if (kp.score > 0.5) {
          ctx.beginPath();
          ctx.arc(kp.x, kp.y, 5, 0, 2 * Math.PI);
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
          ctx.beginPath();
          ctx.moveTo(kp1.x, kp1.y);
          ctx.lineTo(kp2.x, kp2.y);
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

            // Set canvas to match video resolution (pixel-perfect)
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.style.width = "400px"; // CSS scaling
            canvas.style.height = "300px"; // CSS scaling

            // Detection loop
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
    <div style={{ position: "relative", width: 400, height: 300 }}>
      <Script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs" strategy="beforeInteractive" />
      <Script
        src="https://cdn.jsdelivr.net/npm/@tensorflow-models/pose-detection"
        strategy="beforeInteractive"
      />

      <video
        ref={videoRef}
        autoPlay
        playsInline
        style={{ width: 400, height: 300, border: "1px solid black" }}
      />
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          pointerEvents: "none",
        }}
      />
    </div>
  );
}