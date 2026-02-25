// js/main.js

import { ctx, resizeCanvases } from './canvas-setup.js';
import { initPose, updatePose } from './pose-detection.js';
import { updateAI } from './ai-opponent.js';
import { drawFighter, checkHit, updateHealth } from './game-state.js'; // if you split draw functions too

async function startGame() {
  await initPose();
  resizeCanvases();
  gameLoop();
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Placeholder background
  ctx.fillStyle = '#1a0033';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  updatePose();
  updateAI();

  drawFighter(game.me, true);
  drawFighter(game.opponent, false);

  requestAnimationFrame(gameLoop);
}

// Resize
window.addEventListener('resize', resizeCanvases);

// Start game when ready (called from ui-manager.js)
window.startGame = startGame;