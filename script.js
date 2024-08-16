const gameArea = document.getElementById('game-area');
const player = document.getElementById('player');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('high-score');
const levelElement = document.getElementById('level');
const timeOfDayElement = document.getElementById('time-of-day');
const startButton = document.getElementById('start-button');
const pauseButton = document.getElementById('pause-button');

let gameState = {
    score: 0,
    highScore: 0,
    level: 1,
    isRunning: false,
    timeOfDay: 'day'
};

let vehicles = [];

function initGame() {
    createRoadsAndGrass();
    positionPlayer();
    gameState.isRunning = true;
    gameLoop();
}

function createRoadsAndGrass() {
    const roadCount = 5;
    const roadHeight = 80;
    const grassHeight = 40;
    const totalHeight = roadHeight + grassHeight;

    for (let i = 0; i < roadCount; i++) {
        const road = document.createElement('div');
        road.classList.add('road');
        road.style.bottom = `${i * totalHeight}px`;
        gameArea.appendChild(road);

        const grass = document.createElement('div');
        grass.classList.add('grass');
        grass.style.bottom = `${(i * totalHeight) + roadHeight}px`;
        gameArea.appendChild(grass);
    }
}

function positionPlayer() {
    player.style.left = `${gameArea.clientWidth / 2 - 15}px`;
    player.style.bottom = '10px';
}

function createVehicle() {
    const vehicle = document.createElement('div');
    vehicle.classList.add('vehicle');
    const laneIndex = Math.floor(Math.random() * 5);
    const lanePosition = laneIndex * 120 + 90; // 120 = road height + grass height
    vehicle.style.bottom = `${lanePosition}px`;
    vehicle.style.left = `${Math.random() < 0.5 ? -60 : gameArea.clientWidth}px`;
    vehicle.dataset.speed = Math.random() * 2 + 1;
    vehicle.dataset.direction = vehicle.style.left === '-60px' ? 'right' : 'left';
    gameArea.appendChild(vehicle);
    vehicles.push(vehicle);
}

function moveVehicles() {
    vehicles.forEach((vehicle, index) => {
        const currentLeft = parseInt(vehicle.style.left);
        const speed = parseFloat(vehicle.dataset.speed);
        const direction = vehicle.dataset.direction;

        if (direction === 'right') {
            vehicle.style.left = `${currentLeft + speed}px`;
            if (currentLeft > gameArea.clientWidth) {
                gameArea.removeChild(vehicle);
                vehicles.splice(index, 1);
            }
        } else {
            vehicle.style.left = `${currentLeft - speed}px`;
            if (currentLeft < -60) {
                gameArea.removeChild(vehicle);
                vehicles.splice(index, 1);
            }
        }
    });
}

function checkCollision() {
    const playerRect = player.getBoundingClientRect();
    for (let vehicle of vehicles) {
        const vehicleRect = vehicle.getBoundingClientRect();
        if (playerRect.left < vehicleRect.right &&
            playerRect.right > vehicleRect.left &&
            playerRect.top < vehicleRect.bottom &&
            playerRect.bottom > vehicleRect.top) {
            gameOver();
            return true;
        }
    }
    return false;
}

function gameOver() {
    gameState.isRunning = false;
    alert('Game Over! Click Start to play again.');
    resetGame();
}

function resetGame() {
    gameState.score = 0;
    gameState.level = 1;
    scoreElement.textContent = gameState.score;
    levelElement.textContent = gameState.level;
    positionPlayer();
    vehicles.forEach(vehicle => gameArea.removeChild(vehicle));
    vehicles = [];
}

function updateScore() {
    gameState.score++;
    scoreElement.textContent = gameState.score;
    if (gameState.score > gameState.highScore) {
        gameState.highScore = gameState.score;
        highScoreElement.textContent = gameState.highScore;
    }
    if (gameState.score % 10 === 0) {
        gameState.level++;
        levelElement.textContent = gameState.level;
    }
}

function gameLoop() {
    if (gameState.isRunning) {
        moveVehicles();
        if (Math.random() < 0.02) createVehicle();
        if (!checkCollision()) {
            updateScore();
            requestAnimationFrame(gameLoop);
        }
    }
}

startButton.addEventListener('click', () => {
    if (!gameState.isRunning) {
        resetGame();
        initGame();
    }
});

pauseButton.addEventListener('click', () => {
    gameState.isRunning = !gameState.isRunning;
    if (gameState.isRunning) gameLoop();
});

document.addEventListener('keydown', (e) => {
    if (!gameState.isRunning) return;

    const playerRect = player.getBoundingClientRect();
    switch(e.key) {
        case 'ArrowLeft':
            if (playerRect.left > 0) player.style.left = `${playerRect.left - 10}px`;
            break;
        case 'ArrowRight':
            if (playerRect.right < gameArea.clientWidth) player.style.left = `${playerRect.left + 10}px`;
            break;
        case 'ArrowUp':
            if (playerRect.top > 0) player.style.bottom = `${parseInt(player.style.bottom || 0) + 10}px`;
            break;
        case 'ArrowDown':
            if (playerRect.bottom < gameArea.clientHeight) player.style.bottom = `${parseInt(player.style.bottom || 0) - 10}px`;
            break;
    }
});

// Initial setup
positionPlayer();