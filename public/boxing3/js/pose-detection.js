// js/pose-detection.js

import { poseCanvas, poseCtx, resizeCanvases } from './canvas-setup.js';

let detector = null;

export async function initPose() {
  const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
  video.srcObject = stream;

  detector = await poseDetection.createDetector(
    poseDetection.SupportedModels.MoveNet,
    { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING }
  );

  // Resize once camera is ready
  video.onloadeddata = () => {
    resizeCanvases();
  };
}

export async function updatePose() {
  if (!detector || !poseCtx) {
    console.warn("Pose detector or poseCtx not ready yet");
    return;
  }

  const poses = await detector.estimatePoses(video);
  poseCtx.clearRect(0, 0, poseCanvas.width, poseCanvas.height);

  if (poses.length > 0) {
    const kp = poses[0].keypoints;
    const leftWrist = kp.find(k => k.name === 'left_wrist');
    const rightWrist = kp.find(k => k.name === 'right_wrist');
    const nose = kp.find(k => k.name === 'nose');
    const leftHip = kp.find(k => k.name === 'left_hip');
    const rightHip = kp.find(k => k.name === 'right_hip');

    if (leftWrist && rightWrist && nose && leftHip && rightHip) {
      const avgHipY = (leftHip.y + rightHip.y) / 2;
      const noseY = nose.y;

      game.me.ducking = avgHipY > noseY + 120;

      if ((leftWrist.y < noseY - 60 || rightWrist.y < noseY - 60) && Date.now() - game.lastPunch > 700) {
        game.me.attacking = true;
        game.lastPunch = Date.now();
        checkHit();
        setTimeout(() => game.me.attacking = false, 400);
      }
    }
  }
}