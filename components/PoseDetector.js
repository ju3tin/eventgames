"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

export default function PoseDetector() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [detector, setDetector] = useState(null);

  const drawPose = (poses, ctx, video) => {
    const canvasWidth = canvasRef.current.width;
    const canvasHeight = canvasRef.current.height;

    // Draw the video frame first
    ctx.drawImage(video, 0, 0, canvasWidth, canvasHeight);

    // Draw keypoints and skeleton
    poses.forEach((pose) => {
      // Keypoints
      pose.keypoints.forEach((kp) => {
        if (kp.score > 0.5) {
          const x = (kp.x / video.videoWidth) * canvasWidth;
          const y = (kp.y / video.videoHeight) * canvasHeight;
          ctx.beginPath();
          ctx.arc(x, y, 5, 0, 2 * Math.PI);
          ctx.fillStyle = "red";
          ctx.fill();
        }
      });

      // Skeleton lines
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
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    let animationFrameId;

    async function initPoseDetector() {
      if (!window.tf || !window.poseDetection) return;

      const detector = await window.poseDetection.createDetector(
        window.poseDetection.SupportedModels.MoveNet
      );
      setDetector(detector);

      // Setup webcam
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

            const ctx = canvas.getContext("2d");

            // Detection + draw loop
            const detectLoop = async () => {
              if (!detector) return;
              const poses = await detector.estimatePoses(video);
              drawPose(poses, ctx, video);
              animationFrameId = requestAnimationFrame(detectLoop);
            };
            detectLoop();
          };
        }
      }
    }

    initPoseDetector();

    return () => cancelAnimationFrame(animationFrameId);
  }, [detector]);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "640px",
        aspectRatio: "4/3",
        margin: "0 auto",
      }}
    >
      <Script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs" strategy="beforeInteractive" />
      <Script
        src="https://cdn.jsdelivr.net/npm/@tensorflow-models/pose-detection"
        strategy="beforeInteractive"
      />

      {/* Hidden video element, only used as source */}
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