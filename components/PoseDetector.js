"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

export default function PoseHandsDetector() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [poseDetector, setPoseDetector] = useState(null);
  const [handDetector, setHandDetector] = useState(null);

  const lastPoseFrame = useRef(performance.now());
  const lastHandFrame = useRef(performance.now());
  const poseFPS = useRef(0);
  const handFPS = useRef(0);

  const drawKeypoints = (keypoints, ctx, video, color = "lime") => {
    const canvasWidth = canvasRef.current.width;
    const canvasHeight = canvasRef.current.height;

    keypoints.forEach((kp) => {
      const x = (kp.x / video.videoWidth) * canvasWidth;
      const y = (kp.y / video.videoHeight) * canvasHeight;
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();
    });
  };

  const drawSkeleton = (keypoints, connections, ctx, video, color = "lime") => {
    const canvasWidth = canvasRef.current.width;
    const canvasHeight = canvasRef.current.height;

    connections.forEach(([i, j]) => {
      const kp1 = keypoints[i];
      const kp2 = keypoints[j];
      const x1 = (kp1.x / video.videoWidth) * canvasWidth;
      const y1 = (kp1.y / video.videoHeight) * canvasHeight;
      const x2 = (kp2.x / video.videoWidth) * canvasWidth;
      const y2 = (kp2.y / video.videoHeight) * canvasHeight;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.lineWidth = 2;
      ctx.strokeStyle = color;
      ctx.stroke();
    });
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    let animationFrameId;
    let frameCount = 0;

    async function initDetectors() {
      if (!window.tf || !window.poseDetection || !window.handPoseDetection) return;

      // Use WebGL for faster inference
      await window.tf.setBackend("webgl");
      await window.tf.ready();

      // Pose detector (MoveNet Lightning)
      const poseDetector = await window.poseDetection.createDetector(
        window.poseDetection.SupportedModels.MoveNet,
        { modelType: window.poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING }
      );
      setPoseDetector(poseDetector);

      // Hand detector (MediaPipe Hands via TF.js)
      const handDetector = await window.handPoseDetection.createDetector(
        window.handPoseDetection.SupportedModels.MediaPipeHands,
        { runtime: "tfjs", maxHands: 2 }
      );
      setHandDetector(handDetector);

      // Setup webcam (low resolution for mobile)
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } });
      const video = videoRef.current;
      if (!video) return;
      video.srcObject = stream;
      video.onloadedmetadata = () => {
        video.play();

        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");

        const detectLoop = async () => {
          frameCount++;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          // Pose detection every 2 frames
          if (poseDetector && frameCount % 2 === 0) {
            const poses = await poseDetector.estimatePoses(video);

            let totalPoseScore = 0;
            let poseKeyCount = 0;
            poses.forEach((pose) => {
              drawKeypoints(pose.keypoints, ctx, video, "red");
              drawSkeleton(pose.keypoints, window.poseDetection.util.getAdjacentPairs(window.poseDetection.SupportedModels.MoveNet), ctx, video, "red");

              pose.keypoints.forEach(kp => { totalPoseScore += kp.score; poseKeyCount++; });
            });

            const now = performance.now();
            poseFPS.current = 1000 / (now - lastPoseFrame.current);
            lastPoseFrame.current = now;
            const avgPoseConfidence = poseKeyCount > 0 ? totalPoseScore / poseKeyCount : 0;

            ctx.fillStyle = "white";
            ctx.font = "16px sans-serif";
            ctx.fillText(`Pose FPS: ${poseFPS.current.toFixed(1)}`, 10, 20);
            ctx.fillText(`Pose Confidence: ${avgPoseConfidence.toFixed(2)}`, 10, 40);
          }

          // Hand detection every 2 frames
          if (handDetector && frameCount % 2 === 0) {
            const hands = await handDetector.estimateHands(video);

            let totalHandScore = 0;
            let handKeyCount = 0;

            hands.forEach((hand) => {
              drawKeypoints(hand.keypoints, ctx, video, "cyan");

              const connections = [
                [0,1],[1,2],[2,3],[3,4],
                [0,5],[5,6],[6,7],[7,8],
                [0,9],[9,10],[10,11],[11,12],
                [0,13],[13,14],[14,15],[15,16],
                [0,17],[17,18],[18,19],[19,20]
              ];
              drawSkeleton(hand.keypoints, connections, ctx, video, "cyan");

              hand.keypoints.forEach(kp => { totalHandScore += kp.score; handKeyCount++; });
            });

            const now = performance.now();
            handFPS.current = 1000 / (now - lastHandFrame.current);
            lastHandFrame.current = now;
            const avgHandConfidence = handKeyCount > 0 ? totalHandScore / handKeyCount : 0;

            ctx.fillStyle = "white";
            ctx.font = "16px sans-serif";
            ctx.fillText(`Hand FPS: ${handFPS.current.toFixed(1)}`, 10, 60);
            ctx.fillText(`Hand Confidence: ${avgHandConfidence.toFixed(2)}`, 10, 80);
          }

          animationFrameId = requestAnimationFrame(detectLoop);
        };
        detectLoop();
      };
    }

    initDetectors();

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div style={{ position: "relative", width: "100%", maxWidth: "640px", aspectRatio: "4/3", margin: "0 auto" }}>
      <Script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs" strategy="beforeInteractive" />
      <Script src="https://cdn.jsdelivr.net/npm/@tensorflow-models/pose-detection" strategy="beforeInteractive" />
      <Script src="https://cdn.jsdelivr.net/npm/@tensorflow-models/hand-pose-detection" strategy="beforeInteractive" />

      <video ref={videoRef} style={{ display: "none" }} playsInline autoPlay />
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%", borderRadius: "8px", display: "block" }} />
    </div>
  );
}