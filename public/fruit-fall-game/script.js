const gameArea = document.getElementById('game-area');
const scoreDisplay = document.getElementById('score');
const resultDisplay = document.getElementById('result');
const startButton = document.getElementById('start-btn');

let fruits = ['apple.png', 'banana.png', 'grapes.png'];
let score = 0;
let fallingSpeed = 3000; // initial speed (milliseconds)
let gameInterval;

startButton.addEventListener('click', startGame);

function startGame() {
    score = 0;
    fallingSpeed = 3000; // reset the speed
    resultDisplay.textContent = '';
    scoreDisplay.textContent = `Score: ${score}`;
    clearInterval(gameInterval);
    gameInterval = setInterval(() => createFruits(Math.floor(Math.random() * 3) + 1), fallingSpeed); // Create 1-3 fruits at a time
}

function createFruits(count) {
    for (let i = 0; i < count; i++) {
        const fruit = document.createElement('img');
        fruit.src = fruits[Math.floor(Math.random() * fruits.length)];
        fruit.classList.add('fruit');
        fruit.style.left = `${Math.random() * (gameArea.offsetWidth - 50)}px`;
        fruit.style.top = '0px';
        gameArea.appendChild(fruit);

        let fruitFall = setInterval(() => {
            let fruitTop = parseInt(window.getComputedStyle(fruit).getPropertyValue('top'));
            if (fruitTop >= gameArea.offsetHeight - 50) {
                clearInterval(fruitFall);
                gameArea.removeChild(fruit);
                gameOver();
            } else {
                fruit.style.top = `${fruitTop + 5}px`;
            }
        }, 50);

        fruit.addEventListener('click', () => {
            score++;
            scoreDisplay.textContent = `Score: ${score}`;
            gameArea.removeChild(fruit);
            clearInterval(fruitFall);

            // Speed up the falling after every 5 fruits clicked
            if (score % 5 === 0) {
                speedUp();
            }
        });
    }
}

function gameOver() {
    clearInterval(gameInterval);
    resultDisplay.textContent = 'Game Over! Your score: ' + score;
}

function speedUp() {
    clearInterval(gameInterval);
    fallingSpeed -= 300; // Fruits drop faster every 5 successful clicks
    if (fallingSpeed < 1000) {
        fallingSpeed = 1000; // Minimum speed limit
    }
    gameInterval = setInterval(() => createFruits(Math.floor(Math.random() * 3) + 1), fallingSpeed); // 1-3 fruits at a time
}