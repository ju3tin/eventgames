// js/canvas-setup.js – run this FIRST (load it before other scripts)

// DOM elements
export const video = document.getElementById('video');
export const poseCanvas = document.getElementById('pose');
export const gameCanvas = document.getElementById('c');

// Contexts – created immediately
export let poseCtx = null;
export let ctx = null;

if (poseCanvas && gameCanvas) {
  poseCtx = poseCanvas.getContext('2d');
  ctx = gameCanvas.getContext('2d');

  if (!poseCtx || !ctx) {
    console.error("Failed to get 2D context from canvas");
    alert("Canvas 2D context not supported in this browser");
  }
} else {
  console.error("Canvas elements not found in DOM");
}

// Resize handler – call this when game starts or window resizes
export function resizeCanvases() {
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