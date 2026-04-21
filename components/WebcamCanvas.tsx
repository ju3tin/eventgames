import { useEffect, useRef, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as poseDetection from '@tensorflow-models/pose-detection';
import '@tensorflow/tfjs-backend-webgl';

const WebcamCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [detector, setDetector] =
    useState<poseDetection.PoseDetector | null>(null);

  // Initialize TensorFlow and load MoveNet
  useEffect(() => {
    const init = async () => {
      try {
        await tf.setBackend('webgl');
        await tf.ready();

        const model = await poseDetection.createDetector(
          poseDetection.SupportedModels.MoveNet,
          {
            modelType:
              poseDetection.movenet.ModelType.SINGLEPOSE_LIGHTNING,
          }
        );

        setDetector(model);
      } catch (err) {
        console.error('Model init error:', err);
      }
    };

    init();
  }, []);

  // Start webcam
  useEffect(() => {
    const setupCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 },
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch (err) {
        console.error('Webcam error:', err);
      }
    };

    setupCamera();
  }, []);

  // Draw loop
  useEffect(() => {
    let animationId: number;

    const render = async () => {
      if (!canvasRef.current || !videoRef.current || !detector) {
        animationId = requestAnimationFrame(render);
        return;
      }

      const canvas = canvasRef.current;
      const video = videoRef.current;
      const ctx = canvas.getContext('2d');

      if (!ctx) return;

      // Match canvas to video size
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Mirror the video (selfie view)
      ctx.save();
      ctx.scale(-1, 1);
      ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
      ctx.restore();

      // Detect poses
      const poses = await detector.estimatePoses(video);

      // Draw keypoints
      poses.forEach((pose) => {
        pose.keypoints.forEach((keypoint) => {
          if (keypoint.score && keypoint.score > 0.5) {
            ctx.beginPath();
            ctx.arc(
              canvas.width - keypoint.x, // flip X to match mirrored video
              keypoint.y,
              5,
              0,
              2 * Math.PI
            );
            ctx.fillStyle = 'red';
            ctx.fill();
          }
        });
      });

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationId);
  }, [detector]);

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#000',
      }}
    >
      <video ref={videoRef} style={{ display: 'none' }} />
      <canvas ref={canvasRef} />
    </div>
  );
};

export default WebcamCanvas;
