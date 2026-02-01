// Game canvas
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// UI elements
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const gameUI = document.getElementById('gameUI');
const scoreElement = document.getElementById('score');
const finalScoreElement = document.getElementById('finalScore');
const bestScoreElement = document.getElementById('bestScore');
const restartBtn = document.getElementById('restartBtn');
// Game objects
const bird = {
    x: 50,
    y: canvas.height / 2,
    width: 30,
    height: 30,
    velocity: 0,
    gravity: 0.5,
    jumpPower: -8,
    color: '#FFD700'
};

let gameState = 'start'; // 'start', 'playing', 'gameOver'
let score = 0;
let bestScore = localStorage.getItem('flappyBest') || 0;

let pipes = [];
const pipeGap = 150;
const pipeWidth = 60;
const pipeSpeed = 2;

function randomPipeGap() {
    return Math.random() * (pipeGap * 3 - pipeGap) + pipeGap;
}

// Generate new pipe
function generatePipe() {
    const gap = randomPipeGap();
    const minHeight = 50;
    const maxHeight = canvas.height - gap - minHeight - 50; // Account for ground
    const topHeight = Math.random() * (maxHeight - minHeight) + minHeight;
    
    const distancBetweenTwoPipe = Math.random() * (canvas.width * 2 - canvas.width) + canvas.width;
    pipes.push({
        x: distancBetweenTwoPipe,
        topHeight: topHeight,
        gap: gap
    });
}

function updateBirdPostion() {
    // Update bird
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;
}

function jump() {
    bird.velocity = bird.jumpPower;
}

function updatePipesPositions() {
    for (let i = pipes.length - 1; i >= 0; i--) {
        pipes[i].x -= pipeSpeed;

        // Remove pipes that are off screen
        if (pipes[i].x + pipeWidth < 0) {
            pipes.splice(i, 1);
            score++;
            scoreElement.textContent = score;
        }
    }
}

function idTheBirdInsideThepipe(pipe) {
    const isBeforePipeEnd = bird.x < pipe.x + pipeWidth;
    const isAfterPipeStart = bird.x + bird.width > pipe.x;
    const isBelowBottomPipe = bird.y < pipe.topHeight;
    const isAboveTopPipe = bird.y + bird.height > pipe.topHeight + pipe.gap;

    return isBeforePipeEnd && isAfterPipeStart && ( isBelowBottomPipe || isAboveTopPipe);
}

// Check collisions
function checkCollisions() {
    // Check collision with pipes
    for (let pipe of pipes) {
        if (idTheBirdInsideThepipe(pipe)) {
            return true;
        }
    }
    
    // Check collision with ground
    if (bird.y + bird.height > canvas.height - 50) {
        return true;
    }

    // Check if bird is out of bounds
    if(bird.y > canvas.height || bird.y < 0) {
        return true;
    }
    
    return false;
}
