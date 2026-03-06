// components/PoseDetector.js
"use client"; // make sure this runs only on the client

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

export default function PoseDetector() {
  const videoRef = useRef(null);
  const [detector, setDetector] = useState(null);

  useEffect(() => {
    // Only run client-side
    if (typeof window === "undefined") return;

    async function initPoseDetector() {
      // Wait for the libraries to load
      if (!window.tf || !window.poseDetection) {
        console.warn("TensorFlow or poseDetection not loaded yet");
        return;
      }

      const detector = await window.poseDetection.createDetector(
        window.poseDetection.SupportedModels.MoveNet
      );
      setDetector(detector);

      // Start webcam
      if (navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) videoRef.current.srcObject = stream;
      }
    }

    initPoseDetector();
  }, []);

  return (
    <div>
      <h2>Pose Detection Example</h2>
      
      {/* Load TensorFlow.js and Pose Detection from CDN */}
      <Script
        src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs"
        strategy="beforeInteractive"
      />
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
      {detector && <p>Pose Detector Ready!</p>}
    </div>
  );
}