const gameArea = document.getElementById('game-area');
const player = document.getElementById('player');
const scoreElement = document.getElementById('score-value');
const highScoreElement = document.getElementById('high-score-value');
const levelElement = document.getElementById('level-value');
const timeOfDayElement = document.getElementById('time-of-day');
const startButton = document.getElementById('start-button');
const pauseButton = document.getElementById('pause-button');
const roadsContainer = document.getElementById('roads');
const powerUpsContainer = document.getElementById('power-ups');
const gameOverScreen = document.getElementById('game-over');
const restartButton = document.getElementById('restart-button');
const backgroundMusic = new Audio('background-music.mp3');
const powerUpSound = new Audio('power-up-sound.mp3');
const collisionSound = new Audio('collision-sound.mp3');

const ROAD_HEIGHT = 70;
const ROAD_GAP = 40;
const VEHICLE_WIDTH = 70;
const VEHICLE_HEIGHT = 40;
const POWER_UP_SIZE = 35;
const POWER_UP_DURATION = 5000; // in milliseconds

let gameState = {
    player: { x: 0, y: 0, speed: 5, isInvincible: false },
    score: 0,
    highScore: 0,
    level: 1,
    isRunning: false,
    roads: [],
    vehicles: [],
    powerUps: [],
    timeOfDay: 'day',
    timeCycle: 0
};

function initGame() {
    gameState.player = { x: gameArea.clientWidth / 2 - 25, y: 0, speed: 5, isInvincible: false };
    gameState.score = 0;
    scoreElement.textContent = gameState.score;
    gameState.level = 1;
    levelElement.textContent = gameState.level;
    gameState.timeOfDay = 'day';
    timeOfDayElement.textContent = 'Day';
    gameArea.style.backgroundImage = 'url("day-background.jpg")';
    roadsContainer.innerHTML = '';
    powerUpsContainer.innerHTML = '';
    gameState.roads = [];
    gameState.vehicles = [];
    gameState.powerUps = [];
    createRoads();
    updatePlayerPosition();
    backgroundMusic.loop = true;
    backgroundMusic.play();
}

function createRoads() {
    const roadCount = Math.ceil(gameArea.clientHeight / (ROAD_HEIGHT + ROAD_GAP));
    for (let i = 0; i < roadCount; i++) {
        const road = document.createElement('div');
        road.classList.add('road');
        road.style.height = `${ROAD_HEIGHT}px`;
        road.style.width = `${gameArea.clientWidth}px`;
        road.style.bottom = `${i * (ROAD_HEIGHT + ROAD_GAP)}px`;
        road.style.backgroundImage = 'url("road-texture.jpg")';
        roadsContainer.appendChild(road);
        gameState.roads.push({ element: road, y: i * (ROAD_HEIGHT + ROAD_GAP) });
    }
}

function updatePlayerPosition() {
    player.style.left = `${gameState.player.x}px`;
    player.style.bottom = `${gameState.player.y}px`;
    player.style.backgroundImage = gameState.player.isInvincible ? 'url("player-shield.png")' : 'url("player-car.png")';
}

function movePlayer(direction) {
    const { x, y, speed } = gameState.player;
    switch(direction) {
        case 'left':
            if (x > 0) gameState.player.x -= speed;
            break;
        case 'right':
            if (x < gameArea.clientWidth - player.clientWidth) gameState.player.x += speed;
            break;
        case 'up':
            if (y < gameArea.clientHeight - player.clientHeight) gameState.player.y += speed;
            break;
        case 'down':
            if (y > 0) gameState.player.y -= speed;
            break;
    }
    updatePlayerPosition();
    checkCrossing();
}

function createVehicle() {
    const xPosition = Math.random() * (gameArea.clientWidth - VEHICLE_WIDTH);
    const vehicle = document.createElement('div');
    vehicle.classList.add('vehicle');
    vehicle.style.width = `${VEHICLE_WIDTH}px`;
    vehicle.style.height = `${VEHICLE_HEIGHT}px`;
    vehicle.style.left = `${xPosition}px`;
    vehicle.style.bottom = `${gameArea.clientHeight}px`;
    vehicle.style.backgroundImage = 'url("vehicle-texture.png")';
    gameArea.appendChild(vehicle);
    gameState.vehicles.push({ element: vehicle, x: xPosition, y: gameArea.clientHeight });
}

function moveVehicles() {
    gameState.vehicles.forEach((vehicle, index) => {
        vehicle.y -= 5; // Move downwards
        vehicle.element.style.bottom = `${vehicle.y}px`;

        if (vehicle.y < -VEHICLE_HEIGHT) {
            gameArea.removeChild(vehicle.element);
            gameState.vehicles.splice(index, 1);
        }
        checkCollision(vehicle);
    });
}

function createPowerUp() {
    const xPosition = Math.random() * (gameArea.clientWidth - POWER_UP_SIZE);
    const powerUp = document.createElement('div');
    powerUp.classList.add('power-up');
    powerUp.style.width = `${POWER_UP_SIZE}px`;
    powerUp.style.height = `${POWER_UP_SIZE}px`;
    powerUp.style.left = `${xPosition}px`;
    powerUp.style.bottom = `${gameArea.clientHeight}px`;
    const type = ['shield', 'slowTime', 'speedBoost'][Math.floor(Math.random() * 3)];
    powerUp.dataset.type = type;
    powerUp.textContent = type === 'shield' ? '🛡️' : type === 'slowTime' ? '⏱️' : '🚀';
    powerUp.style.backgroundImage = type === 'shield' ? 'url("shield-texture.png")' : type === 'slowTime' ? 'url("slow-time-texture.png")' : 'url("speed-boost-texture.png")';
    powerUpsContainer.appendChild(powerUp);
    gameState.powerUps.push({ element: powerUp, x: xPosition, y: gameArea.clientHeight, type });
}

function movePowerUps() {
    gameState.powerUps.forEach((powerUp, index) => {
        powerUp.y -= 3; // Move downwards
        powerUp.element.style.bottom = `${powerUp.y}px`;

        if (powerUp.y < -POWER_UP_SIZE) {
            powerUpsContainer.removeChild(powerUp.element);
            gameState.powerUps.splice(index, 1);
        }
        checkPowerUpCollision(powerUp);
    });
}

function checkCollision(vehicle) {
    if (gameState.player.isInvincible) return;

    const playerRect = player.getBoundingClientRect();
    const vehicleRect = vehicle.element.getBoundingClientRect();

    if (playerRect.left < vehicleRect.right &&
        playerRect.right > vehicleRect.left &&
        playerRect.top < vehicleRect.bottom &&
        playerRect.bottom > vehicleRect.top) {
        collisionSound.play();
        gameOver();
    }
}

function checkPowerUpCollision(powerUp) {
    const playerRect = player.getBoundingClientRect();
    const powerUpRect = powerUp.element.getBoundingClientRect();

    if (playerRect.left < powerUpRect.right &&
        playerRect.right > powerUpRect.left &&
        playerRect.top < powerUpRect.bottom &&
        playerRect.bottom > powerUpRect.top) {
        powerUpSound.play();
        activatePowerUp(powerUp.dataset.type);
        powerUpsContainer.removeChild(powerUp.element);
        gameState.powerUps = gameState.powerUps.filter(p => p !== powerUp);
    }
}

function activatePowerUp(type) {
    switch(type) {
        case 'shield':
            gameState.player.isInvincible = true;
            player.style.boxShadow = '0 0 15px 10px blue';
            setTimeout(() => {
                gameState.player.isInvincible = false;
                player.style.boxShadow = 'none';
            }, POWER_UP_DURATION);
            break;
        case 'slowTime':
            gameState.vehicles.forEach(vehicle => vehicle.speed = 2);
            setTimeout(() => {
                gameState.vehicles.forEach(vehicle => vehicle.speed = 5);
            }, POWER_UP_DURATION);
            break;
        case 'speedBoost':
            gameState.player.speed *= 2;
            setTimeout(() => {
                gameState.player.speed /= 2;
            }, POWER_UP_DURATION);
            break;
    }
}

function checkCrossing() {
    if (gameState.player.y >= gameArea.clientHeight - player.clientHeight) {
        gameState.score++;
        scoreElement.textContent = gameState.score;
        gameState.player.y = 0;
        updatePlayerPosition();
        updateLevel();
    }
}

function updateLevel() {
    gameState.level = Math.floor(gameState.score / 5) + 1;
    levelElement.textContent = gameState.level;
}

function updateTimeOfDay() {
    gameState.timeCycle++;
    if (gameState.timeCycle >= 600) {
        gameState.timeCycle = 0;
        gameState.timeOfDay = gameState.timeOfDay === 'day' ? 'night' : 'day';
        timeOfDayElement.textContent = gameState.timeOfDay.charAt(0).toUpperCase() + gameState.timeOfDay.slice(1);
        gameArea.style.backgroundImage = gameState.timeOfDay === 'day' ? 'url("day-background.jpg")' : 'url("night-background.jpg")';
    }
}

function gameOver() {
    backgroundMusic.pause();
    gameOverScreen.style.display = 'block';
    restartButton.addEventListener('click', () => {
        gameOverScreen.style.display = 'none';
        initGame();
        gameState.isRunning = true;
        gameLoop();
    });
}

function gameLoop() {
    if (gameState.isRunning) {
        moveVehicles();
        movePowerUps();
        updateTimeOfDay();
        requestAnimationFrame(gameLoop);
    }
}

document.addEventListener('keydown', (e) => {
    switch(e.key) {
        case 'ArrowLeft':
            movePlayer('left');
            break;
        case 'ArrowRight':
            movePlayer('right');
            break;
        case 'ArrowUp':
            movePlayer('up');
            break;
        case 'ArrowDown':
            movePlayer('down');
            break;
    }
});

startButton.addEventListener('click', () => {
    if (!gameState.isRunning) {
        initGame();
        gameState.isRunning = true;
        gameLoop();
    }
});

pauseButton.addEventListener('click', () => {
    gameState.isRunning = false;
});
