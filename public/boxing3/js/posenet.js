let detector = null;

async function initPose() {
  const loading = document.getElementById('loading-webcam');
  loading.innerHTML = '<h2>Starting Webcam...</h2><p>Please allow camera access.</p>';

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
    video.srcObject = stream;

    // Wait for video to be ready
    await new Promise(resolve => {
      video.onloadeddata = () => {
        resizeCanvases();
        resolve();
      };
    });

    loading.innerHTML = '<h2>Loading Pose Detection...</h2>';

    detector = await poseDetection.createDetector(
      poseDetection.SupportedModels.MoveNet,
      { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING }
    );

    loading.style.display = 'none';
    document.getElementById('start-screen').classList.remove('hidden');

  } catch (err) {
    console.error("Webcam error:", err);
    loading.innerHTML = `
      <h2>Webcam Access Failed</h2>
      <p>${err.message || 'Please allow camera access and refresh.'}</p>
      <button onclick="location.reload()" style="margin-top:1rem; padding:0.8rem 1.5rem; background:#ff0044; color:white; border:none; border-radius:8px;">
        Retry
      </button>
    `;
  }
}

// Start webcam immediately when page loads
window.addEventListener('load', initPose);

async function updatePose() {
  if (!detector || !poseCtx) {
    console.warn("Pose detector or context not ready");
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