"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";

declare global {
  interface Window {
    tf: any;
    poseDetection: any;
  }
}

export default function Home() {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    let detector: any;

    async function init() {
      if (!window.tf || !window.poseDetection) {
        console.log("TensorFlow not loaded yet...");
        return;
      }

      await window.tf.setBackend("webgl");
      await window.tf.ready();

      detector = await window.poseDetection.createDetector(
        window.poseDetection.SupportedModels.MoveNet,
        {
          modelType:
            window.poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
        }
      );

      startCamera(detector);
    }

    async function startCamera(detector: any) {
      if (!videoRef.current) return;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });

      videoRef.current.srcObject = stream;

      videoRef.current.onloadeddata = () => {
        detectPose(videoRef.current as HTMLVideoElement, detector);
      };
    }

    async function detectPose(
      video: HTMLVideoElement,
      detector: any
    ) {
      const poses = await detector.estimatePoses(video);

      if (poses.length > 0) {
        console.log("Pose detected");
      }

      requestAnimationFrame(() =>
        detectPose(video, detector)
      );
    }

    const interval = setInterval(() => {
      if (window.tf && window.poseDetection) {
        clearInterval(interval);
        init();
      }
    }, 100);

  }, []);

  return (
    <>
      {/* TensorFlow */}
      <Script
        src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.16.0/dist/tf.min.js"
        strategy="afterInteractive"
      />

      {/* WebGL backend */}
      <Script
        src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-webgl"
        strategy="afterInteractive"
      />

      {/* Pose detection */}
      <Script
        src="https://cdn.jsdelivr.net/npm/@tensorflow-models/pose-detection"
        strategy="afterInteractive"
      />

      <div style={{ textAlign: "center" }}>
        <h1>Street Fighter AI</h1>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          width={640}
          height={480}
          style={{ border: "2px solid black" }}
        />
      </div>
    </>
  );
}
