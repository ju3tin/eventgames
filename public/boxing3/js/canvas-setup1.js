// js/canvas-setup.js – run this FIRST

const gameCanvas = document.getElementById('c');

let poseCtx = null;
//let ctx = null;

if (poseCanvas && gameCanvas) {
  poseCtx = poseCanvas.getContext('2d');
 // ctx = gameCanvas.getContext('2d');

  if (!poseCtx || !ctx) {
    console.error("Failed to get 2D context from canvas");
  }
} else {
  console.error("Canvas elements missing in DOM");
}

function resizeCanvases() {
  if (gameCanvas) {
    gameCanvas.width = window.innerWidth;
    gameCanvas.height = window.innerHeight;
  }
  if (poseCanvas && video.videoWidth) {
    poseCanvas.width = video.videoWidth;
    poseCanvas.height = video.videoHeight;
  }
}

window.addEventListener('resize', resizeCanvases);
resizeCanvases(); // initial call