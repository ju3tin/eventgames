// components/WebcamCanvas.tsx
import { useEffect, useRef } from 'react';

const WebcamCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

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

    const drawToCanvas = () => {
      if (canvasRef.current && videoRef.current) {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        if (context) {
          // Set canvas size to match window size
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;

          // Draw the video frame to the canvas
          context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        }
      }
      requestAnimationFrame(drawToCanvas); // Loop to continuously draw the webcam feed
    };

    // Start the drawing loop
    drawToCanvas();
  }, []);

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
