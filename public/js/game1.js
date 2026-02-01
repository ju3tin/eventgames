
// Game loop
function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

// Update game logic
function update() {
    if (gameState !== 'playing') return;
    // Update bird
    updateBirdPostion();

    // Generate pipes
    if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - 200) {
        generatePipe();
    }

    updatePipesPositions();

    // Check collisions
    if (checkCollisions()) {
        gameOver();
    }

}
function onSpaceClick() {
    if(gameState === 'start') {
        gameState = 'playing';
        score = 0;
        bird.y = canvas.height / 2;
        bird.velocity = 0;
        pipes.length = 0;
        updateUI();
    } else if(gameState === 'playing') {
        jump();
    }
}

// Start game
function startGame() {
    gameState = 'playing';
    score = 0;
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    pipes.length = 0;
    updateUI();
}

// Game over
function gameOver() {
    gameState = 'gameOver';
    
    // Update best score
    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem('flappyBest', bestScore);
    }
    
    updateUI();
}