import { useEffect, useRef, useState } from 'react';

const WebcamCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [detector, setDetector] = useState<any>(null);
  const [reps, setReps] = useState(0);
  const [stage, setStage] = useState<'up' | 'down'>('up');

  // Load TF + model
  useEffect(() => {
    const init = async () => {
      const tf = await import('@tensorflow/tfjs');
      await import('@tensorflow/tfjs-backend-webgl');
      const poseDetection = await import('@tensorflow-models/pose-detection');

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
    };

    init();
  }, []);

  // Webcam
  useEffect(() => {
    const startCamera = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    };

    startCamera();
  }, []);

  // Helper: draw line
  const drawLine = (ctx: CanvasRenderingContext2D, a: any, b: any, width: number) => {
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.lineWidth = width;
    ctx.strokeStyle = 'lime';
    ctx.stroke();
  };

  // Helper: angle calculation
  const getAngle = (a: any, b: any, c: any) => {
    const ab = { x: a.x - b.x, y: a.y - b.y };
    const cb = { x: c.x - b.x, y: c.y - b.y };

    const dot = ab.x * cb.x + ab.y * cb.y;
    const magAB = Math.sqrt(ab.x ** 2 + ab.y ** 2);
    const magCB = Math.sqrt(cb.x ** 2 + cb.y ** 2);

    const angle = Math.acos(dot / (magAB * magCB));
    return (angle * 180) / Math.PI;
  };

  // Main loop
  useEffect(() => {
    let raf: number;

    const render = async () => {
      if (!canvasRef.current || !videoRef.current || !detector) {
        raf = requestAnimationFrame(render);
        return;
      }

      const canvas = canvasRef.current;
      const video = videoRef.current;
      const ctx = canvas.getContext('2d');

      if (!ctx || video.videoWidth === 0) {
        raf = requestAnimationFrame(render);
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Mirror
      ctx.save();
      ctx.scale(-1, 1);
      ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
      ctx.restore();

      const poses = await detector.estimatePoses(video);

      poses.forEach((pose: any) => {
        const kp = pose.keypoints;

        // Draw keypoints
        kp.forEach((p: any) => {
          if (p.score > 0.5) {
            ctx.beginPath();
            ctx.arc(canvas.width - p.x, p.y, 5, 0, 2 * Math.PI);
            ctx.fillStyle = 'red';
            ctx.fill();
          }
        });

        // Skeleton connections (basic)
        const pairs = [
          [5, 7], [7, 9], // left arm
          [6, 8], [8, 10], // right arm
          [5, 6], // shoulders
          [5, 11], [6, 12], // torso
          [11, 12], // hips
          [11, 13], [13, 15], // left leg
          [12, 14], [14, 16], // right leg
        ];

        pairs.forEach(([i, j]) => {
          if (kp[i].score > 0.5 && kp[j].score > 0.5) {
            drawLine(
              ctx,
              { x: canvas.width - kp[i].x, y: kp[i].y },
              { x: canvas.width - kp[j].x, y: kp[j].y },
              2
            );
          }
        });

        // 🏋️ Squat detection (right leg)
        const hip = kp[12];
        const knee = kp[14];
        const ankle = kp[16];

        if (hip.score > 0.5 && knee.score > 0.5 && ankle.score > 0.5) {
          const angle = getAngle(hip, knee, ankle);

          // Draw angle text
          ctx.fillStyle = 'yellow';
          ctx.font = '16px Arial';
          ctx.fillText(
            `Angle: ${Math.round(angle)}`,
            canvas.width - knee.x,
            knee.y - 10
          );

          // Rep logic
          if (angle > 160) {
            if (stage === 'down') {
              setReps((r) => r + 1);
              setStage('up');
            }
          }

          if (angle < 100) {
            setStage('down');
          }
        }
      });

      // Draw rep counter
      ctx.fillStyle = 'white';
      ctx.font = '24px Arial';
      ctx.fillText(`Reps: ${reps}`, 20, 40);

      raf = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(raf);
  }, [detector, stage]);

  return (
    <div style={{ height: '100vh', background: 'black' }}>
      <video ref={videoRef} style={{ display: 'none' }} playsInline />
      <canvas ref={canvasRef} />
    </div>
  );
};

export default WebcamCanvas;
