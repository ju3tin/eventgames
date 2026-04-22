'use client';

import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    tf: any;
    posenet: any;
  }
}

export default function PoseNetPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [net, setNet] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState('Loading TensorFlow.js and PoseNet...');

  // Load TF.js and PoseNet from CDN
  useEffect(() => {
    const loadScripts = async () => {
      // Load TensorFlow.js
      const tfScript = document.createElement('script');
      tfScript.src = 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@latest/dist/tf.min.js';
      tfScript.async = true;

      // Load PoseNet
      const posenetScript = document.createElement('script');
      posenetScript.src = 'https://unpkg.com/@tensorflow-models/posenet@2.2.1/dist/posenet.min.js';
      posenetScript.async = true;

      document.head.appendChild(tfScript);

      tfScript.onload = () => {
        document.head.appendChild(posenetScript);
      };

      posenetScript.onload = async () => {
        try {
          setStatus('Loading PoseNet model... (this may take 10-20 seconds the first time)');
          
          // @ts-ignore - global posenet from script
          const loadedNet = await window.posenet.load({
            architecture: 'MobileNetV1',
            outputStride: 16,
            inputResolution: { width: 640, height: 480 },
            multiplier: 0.75,
          });

          setNet(loadedNet);
          setIsLoading(false);
          setStatus('PoseNet loaded! Starting webcam...');
        } catch (err) {
          setStatus('Error loading PoseNet: ' + (err as Error).message);
        }
      };
    };

    loadScripts();

    return () => {
      // Cleanup scripts if needed (optional)
    };
  }, []);

  // Start webcam and pose detection loop
  useEffect(() => {
    if (!net || !videoRef.current) return;

    let animationFrameId: number;
    let isRunning = true;

    const startPoseDetection = async () => {
      const video = videoRef.current!;
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext('2d', { willReadFrequently: true })!;

      // Get webcam stream
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 },
        });
        video.srcObject = stream;
        await video.play();

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        setStatus('✅ Pose detection running — move in front of the camera!');
      } catch (err) {
        setStatus('Error accessing webcam: ' + (err as Error).message);
        return;
      }

      const detectPose = async () => {
        if (!isRunning || !net || !video) return;

        try {
          // Estimate single pose
          const pose = await net.estimateSinglePose(video, {
            flipHorizontal: false,
          });

          // Clear canvas
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Draw video frame (optional - comment out if you want only skeleton)
          ctx.save();
          ctx.scale(1, 1); // Mirror effect (common for pose demos)
          ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
          ctx.restore();

          // Draw keypoints and skeleton
          drawKeypoints(pose.keypoints, 0.6, ctx);
          drawSkeleton(pose.keypoints, 0.6, ctx);
        } catch (e) {
          console.error(e);
        }

        animationFrameId = requestAnimationFrame(detectPose);
      };

      detectPose();
    };

    startPoseDetection();

    return () => {
      isRunning = false;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [net]);

  // Helper drawing functions
  const drawKeypoints = (keypoints: any[], minConfidence: number, ctx: CanvasRenderingContext2D) => {
    keypoints.forEach((keypoint) => {
      if (keypoint.score >= minConfidence) {
        ctx.beginPath();
        ctx.arc(keypoint.position.x, keypoint.position.y, 6, 0, 2 * Math.PI);
        ctx.fillStyle = '#ff0000';
        ctx.fill();
      }
    });
  };

  const drawSkeleton = (keypoints: any[], minConfidence: number, ctx: CanvasRenderingContext2D) => {
    const adjacentKeyPoints = window.posenet.getAdjacentKeyPoints(keypoints, minConfidence);

    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 3;

    adjacentKeyPoints.forEach((keypointsPair: any[]) => {
      const [from, to] = keypointsPair;
      ctx.beginPath();
      ctx.moveTo(from.position.x, from.position.y);
      ctx.lineTo(to.position.x, to.position.y);
      ctx.stroke();
    });
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-8">TensorFlow.js PoseNet Demo</h1>
      
      <div className="relative w-full max-w-[640px]">
        <video
          ref={videoRef}
          className="hidden"
          width="640"
          height="480"
        />
        
        <canvas
          ref={canvasRef}
          className="border border-gray-700 rounded-xl shadow-2xl"
          width="640"
          height="480"
        />
      </div>

      <div className="mt-6 text-center">
        <p className="text-lg mb-2">{status}</p>
        {isLoading && (
          <div className="animate-pulse text-yellow-400">Please wait while the model downloads...</div>
        )}
      </div>

      <div className="mt-8 text-sm text-gray-400 max-w-md text-center">
        This demo loads TensorFlow.js + PoseNet directly from CDN (no npm packages).
        It detects 17 body keypoints in real time using your webcam.
      </div>
    </div>
  );
}
