// canvas actions
function drawGround() {
    // Draw ground
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, canvas.height - 50, canvas.width, 50);
    
    // Draw ground pattern
    ctx.fillStyle = '#A0522D';
    for (let i = 0; i < canvas.width; i += 20) {
        ctx.fillRect(i, canvas.height - 50, 10, 50);
    }
}

function drawClouds() {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    
    drawCloud(100, 80, 0.8);
    drawCloud(300, 120, 0.6);
    drawCloud(50, 200, 0.7);
    drawCloud(350, 250, 0.5);
}

function drawCloud(x, y, scale) {
    ctx.save();
    ctx.scale(scale, scale);
    ctx.beginPath();
    ctx.arc(x / scale, y / scale, 20, 0, Math.PI * 2);
    ctx.arc((x + 25) / scale, y / scale, 25, 0, Math.PI * 2);
    ctx.arc((x + 50) / scale, y / scale, 20, 0, Math.PI * 2);
    ctx.arc((x + 25) / scale, (y - 15) / scale, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

function drawBird() {
    ctx.save();
    ctx.translate(bird.x + bird.width / 2, bird.y + bird.height / 2);
    
    // Rotate bird based on velocity
    const rotation = Math.min(Math.max(bird.velocity * 0.1, -0.5), 0.5);
    ctx.rotate(rotation);
    
    // Bird body
    ctx.fillStyle = bird.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, bird.width / 2, bird.height / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Bird wing
    ctx.fillStyle = '#FFA500';
    ctx.beginPath();
    ctx.ellipse(-5, -3, 8, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Bird eye
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.ellipse(5, -5, 6, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.ellipse(7, -5, 3, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Bird beak
    ctx.fillStyle = '#FF4500';
    ctx.beginPath();
    ctx.moveTo(12, -2);
    ctx.lineTo(18, 0);
    ctx.lineTo(12, 2);
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
}

function drawPipes() {
    // Draw pipes
    ctx.fillStyle = '#228B22';
    pipes.forEach(pipe => {
        // Top pipe
        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.topHeight);
        // Bottom pipe
        ctx.fillRect(pipe.x, pipe.topHeight + pipe.gap, pipeWidth, canvas.height - pipe.topHeight - pipe.gap);
        
        // Pipe caps
        ctx.fillStyle = '#32CD32';
        ctx.fillRect(pipe.x - 5, pipe.topHeight - 20, pipeWidth + 10, 20);
        ctx.fillRect(pipe.x - 5, pipe.topHeight + pipe.gap, pipeWidth + 10, 20);
        ctx.fillStyle = '#228B22';
    });
}

// Update UI
function updateUI() {
    startScreen.classList.toggle('hidden', gameState !== 'start');
    gameOverScreen.classList.toggle('hidden', gameState !== 'gameOver');
    gameUI.classList.toggle('hidden', gameState !== 'playing');
    
    if (gameState === 'gameOver') {
        finalScoreElement.textContent = `Score: ${score}`;
        bestScoreElement.textContent = `Best: ${bestScore}`;
    }
    
    if (gameState === 'playing') {
        scoreElement.textContent = score;
    }
}


// Render game
function render() {
    if (gameState !== 'playing') return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(0.7, '#98FB98');
    gradient.addColorStop(1, '#90EE90');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw clouds
    drawClouds();

    // Draw ground
    drawGround()
    if (gameState === 'playing' || gameState === 'gameOver') {
        // Draw pipes\
        console.log('draw pipes', pipes)
        drawPipes();

        // Draw bird
        drawBird();
    }
}