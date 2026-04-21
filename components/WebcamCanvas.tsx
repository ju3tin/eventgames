// components/WebcamCanvas.tsx
import { useEffect, useRef, useState } from 'react';

const WebcamCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [model, setModel] = useState<any>(null);

  useEffect(() => {
    // Load the MoveNet model from TensorFlow.js CDN
    const loadModel = async () => {
      try {
        // Wait for the MoveNet model to be loaded
        const moveNetModel = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, {
          modelType: poseDetection.movenet.ModelType.SINGLEPOSE_LIGHTNING,
        });
        setModel(moveNetModel);
      } catch (error) {
        console.error('Error loading MoveNet model:', error);
      }
    };

    loadModel();
  }, []);

  useEffect(() => {
    const startWebcam = async () => {
      try {
        // Request webcam access
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Error accessing webcam:', err);
      }
    };

    startWebcam();

    const drawToCanvas = async () => {
      if (canvasRef.current && videoRef.current && model) {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        if (context) {
          // Set canvas size to match window size
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;

          // Draw the video frame to the canvas
          context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

          // Run MoveNet model to get pose detection
          const poses = await model.estimatePoses(videoRef.current);

          // Draw keypoints on the canvas
          poses.forEach((pose: any) => {
            pose.keypoints.forEach((keypoint: any) => {
              if (keypoint.score > 0.5) {
                context.beginPath();
                context.arc(keypoint.position.x, keypoint.position.y, 5, 0, 2 * Math.PI);
                context.fillStyle = 'red';
                context.fill();
              }
            });
          });
        }
      }

      requestAnimationFrame(drawToCanvas); // Loop to continuously draw the webcam feed and update pose
    };

    // Start the drawing loop
    drawToCanvas();
  }, [model]);

  return (
    <div style={{ position: 'relative', height: '100vh', width: '100vw' }}>
      {/* Fullscreen video element (hidden) */}
      <video ref={videoRef} style={{ display: 'none' }} autoPlay />
      {/* Fullscreen canvas */}
      <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0 }} />
    </div>
  );
};

export default WebcamCanvas;
