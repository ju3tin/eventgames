"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";

declare global {
  interface Window {
    Pose: any;
    Camera: any;
    ControlPanel: any;
    drawConnectors: any;
    drawLandmarks: any;
    POSE_CONNECTIONS: any;
    POSE_LANDMARKS_LEFT: any;
    POSE_LANDMARKS_RIGHT: any;
    POSE_LANDMARKS_NEUTRAL: any;
    FPS: any;
    StaticText: any;
    Toggle: any;
  }
}

export default function Page() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controlRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.Pose) return;

    const videoElement = videoRef.current!;
    const canvasElement = canvasRef.current!;
    const controlsElement = controlRef.current!;
    const canvasCtx = canvasElement.getContext("2d");

    const fpsControl = new window.FPS();

    let angle = 0;
    let stage = "DOWN";
    let counter = 0;

    function calculate_angle(hip: number[], knee: number[], ankle: number[]) {
      let radians =
        Math.atan2(ankle[1] - knee[1], ankle[0] - knee[0]) -
        Math.atan2(hip[1] - knee[1], hip[0] - knee[0]);

      let angle = Math.abs((radians * 180.0) / Math.PI);
      if (angle > 180) angle = 360 - angle;

      return angle;
    }

    function onResults(results: any) {
      if (!canvasCtx) return;

      fpsControl.tick();

      canvasCtx.save();
      canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
      canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

      window.drawConnectors(canvasCtx, results.poseLandmarks, window.POSE_CONNECTIONS, {
        color: "white",
      });

      window.drawLandmarks(canvasCtx, results.poseLandmarks, {
        color: "white",
      });

      const landmarks = results.poseLandmarks;

      const hip = [landmarks[23].x, landmarks[23].y];
      const knee = [landmarks[25].x, landmarks[25].y];
      const ankle = [landmarks[27].x, landmarks[27].y];

      angle = calculate_angle(hip, knee, ankle);

      if (angle > 140) stage = "UP";
      if (angle < 100 && stage === "UP") {
        stage = "DOWN";
        counter++;
      }

      canvasCtx.font = "30px Arial";
      canvasCtx.fillStyle = "red";
      canvasCtx.fillText(`${stage}: ${counter}`, 1000, 50);

      canvasCtx.restore();
    }

    const pose = new window.Pose({
      locateFile: (file: string) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
    });

    pose.onResults(onResults);

    const camera = new window.Camera(videoElement, {
      onFrame: async () => {
        await pose.send({ image: videoElement });
      },
      width: 1280,
      height: 720,
    });

    camera.start();

    new window.ControlPanel(controlsElement, {
      selfieMode: true,
      modelComplexity: 0,
      smoothLandmarks: true,
      minDetectionConfidence: 0.2,
      minTrackingConfidence: 0.2,
    })
      .add([
        new window.StaticText({ title: "Squat Counter" }),
        fpsControl,
        new window.Toggle({ title: "Selfie Mode", field: "selfieMode" }),
      ])
      .on((options: any) => {
        videoElement.classList.toggle("selfie", options.selfieMode);
        pose.setOptions(options);
      });

  }, []);

  return (
    <>
      {/* CDN scripts */}
      <Script src="https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js" strategy="beforeInteractive" />
      <Script src="https://cdn.jsdelivr.net/npm/@mediapipe/control_utils/control_utils.js" strategy="beforeInteractive" />
      <Script src="https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js" strategy="beforeInteractive" />
      <Script src="https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js" strategy="beforeInteractive" />

      <div className="container">
        <video ref={videoRef} className="input_video" />
        <canvas ref={canvasRef} className="output_canvas" width={1280} height={720} />
        <div ref={controlRef} className="control-panel" />
      </div>

      <style jsx>{`
        .container {
          position: relative;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
        }

        video {
          position: absolute;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transform: scaleX(-1);
        }

        canvas {
          position: absolute;
          width: 100%;
          height: 100%;
        }

        .control-panel {
          position: absolute;
          top: 10px;
          left: 10px;
          z-index: 10;
        }
      `}</style>
    </>
  );
}
