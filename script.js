const gameContainer = document.getElementById('game-container');
const player = document.getElementById('player');
const scoreElement = document.getElementById('score-value');
const highScoreElement = document.getElementById('high-score-value');
const levelElement = document.getElementById('level-value');
const startButton = document.getElementById('start-button');
const pauseButton = document.getElementById('pause-button');

let playerPosition = { x: 180, y: 10 };
let score = 0;
let highScore = 0;
let level = 1;
let cars = [];
let isGameRunning = false;
let gameLoopId;

function movePlayer(e) {
    if (!isGameRunning) return;

    const step = 10;
    switch (e.key) {
        case 'ArrowLeft':
            if (playerPosition.x > 0) playerPosition.x -= step;
            break;
        case 'ArrowRight':
            if (playerPosition.x < 360) playerPosition.x += step;
            break;
        case 'ArrowUp':
            if (playerPosition.y < 560) playerPosition.y += step;
            break;
        case 'ArrowDown':
            if (playerPosition.y > 10) playerPosition.y -= step;
            break;
    }
    updatePlayerPosition();
    checkCollision();
    checkCrossing();
}

function updatePlayerPosition() {
    player.style.left = `${playerPosition.x}px`;
    player.style.bottom = `${playerPosition.y}px`;
}

function createCar() {
    const car = document.createElement('div');
    car.classList.add('car');
    car.style.top = `${Math.random() * 500}px`;
    car.style.right = '-60px';
    gameContainer.appendChild(car);
    cars.push(car);
}

function moveCars() {
    cars.forEach((car, index) => {
        const currentPosition = parseInt(car.style.right);
        if (currentPosition > 400) {
            gameContainer.removeChild(car);
            cars.splice(index, 1);
        } else {
            car.style.right = `${currentPosition + 5}px`;
        }
    });
}

function checkCollision() {
    const playerRect = player.getBoundingClientRect();
    for (let car of cars) {
        const carRect = car.getBoundingClientRect();
        if (
            playerRect.left < carRect.right &&
            playerRect.right > carRect.left &&
            playerRect.top < carRect.bottom &&
            playerRect.bottom > carRect.top
        ) {
            gameOver();
            return;
        }
    }
}

function checkCrossing() {
    if (playerPosition.y >= 560) {
        score++;
        scoreElement.textContent = score;
        playerPosition.y = 10;
        updatePlayerPosition();
        updateLevel();
    }
}

function updateLevel() {
    level = Math.floor(score / 5) + 1;
    levelElement.textContent = level;
}

function gameOver() {
    alert('Game Over! Your score: ' + score);
    updateHighScore();
    resetGame();
}

function updateHighScore() {
    if (score > highScore) {
        highScore = score;
        highScoreElement.textContent = highScore;
    }
}

function resetGame() {
    playerPosition = { x: 180, y: 10 };
    updatePlayerPosition();
    score = 0;
    scoreElement.textContent = score;
    level = 1;
    levelElement.textContent = level;
    cars.forEach(car => gameContainer.removeChild(car));
    cars = [];
    startButton.textContent = 'Start Game';
    isGameRunning = false;
    cancelAnimationFrame(gameLoopId);
}

function gameLoop() {
    if (isGameRunning) {
        moveCars();
        if (Math.random() < 0.02 * level) createCar();
        checkCollision();
        gameLoopId = requestAnimationFrame(gameLoop);
    }
}

function startGame() {
    if (!isGameRunning) {
        isGameRunning = true;
        gameLoop();
        startButton.textContent = 'Restart';
    } else {
        resetGame();
    }
}

function togglePause() {
    if (isGameRunning) {
        isGameRunning = false;
        cancelAnimationFrame(gameLoopId);
        pauseButton.textContent = 'Resume';
    } else {
        isGameRunning = true;
        gameLoop();
        pauseButton.textContent = 'Pause';
    }
}

document.addEventListener('keydown', movePlayer);
startButton.addEventListener('click', startGame);
pauseButton.addEventListener('click', togglePause);