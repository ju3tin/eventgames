

// Game initialization
function init() {
    updateUI();
    gameLoop();
}

// Event listeners
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        if (gameState === 'start') {
            startGame();
        } else if (gameState === 'playing') {
            jump();
        }
    }
});

// Prevent context menu on right click
canvas.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});


canvas.addEventListener('click', (e) => {
    e.preventDefault();
    if (gameState === 'playing') {
        jump();
    }
});

restartBtn.addEventListener('click', () => {
    startGame();
});

// Touch support for mobile
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (gameState === 'start') {
        startGame();
    } else if (gameState === 'playing') {
        jump();
    }
});


init();