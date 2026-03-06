"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

export default function PoseDetector() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [detector, setDetector] = useState(null);

  // Draw keypoints and skeleton
  const drawPose = (poses) => {
    const ctx = canvasRef.current.getContext("2d");
    const video = videoRef.current;

    if (!ctx || !video) return;

    // Clear previous frame
    ctx.clearRect(0, 0, video.videoWidth, video.videoHeight);

    poses.forEach((pose) => {
      // Draw keypoints
      pose.keypoints.forEach((keypoint) => {
        if (keypoint.score > 0.5) { // only confident points
          ctx.beginPath();
          ctx.arc(keypoint.x, keypoint.y, 5, 0, 2 * Math.PI);
          ctx.fillStyle = "red";
          ctx.fill();
        }
      });

      // Draw skeleton lines
      const adjacentPairs = window.poseDetection.util.getAdjacentPairs(window.poseDetection.SupportedModels.MoveNet);
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

      // Start webcam
      if (navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;

          // Wait for video to load metadata
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play();

            // Set canvas size same as video
            canvasRef.current.width = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;

            // Start detection loop
            const detect = async () => {
              if (!detector) return;
              const poses = await detector.estimatePoses(videoRef.current);
              drawPose(poses);
              requestAnimationFrame(detect);
            };
            detect();
          };
        }
      }
    }

    initPoseDetector();
  }, [detector]);

  return (
    <div style={{ position: "relative", width: 400, height: 300 }}>
      {/* CDN Scripts */}
      <Script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs" strategy="beforeInteractive" />
      <Script src="https://cdn.jsdelivr.net/npm/@tensorflow-models/pose-detection" strategy="beforeInteractive" />

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
          width: 400,
          height: 300,
          pointerEvents: "none",
        }}
      />
    </div>
  );
}