const gameArea = document.getElementById('game-area');
const player = document.getElementById('player');
const scoreElement = document.getElementById('score-value');
const highScoreElement = document.getElementById('high-score-value');
const levelElement = document.getElementById('level-value');
const timeOfDayElement = document.getElementById('time-of-day');
const startButton = document.getElementById('start-button');
const pauseButton = document.getElementById('pause-button');
const restartButton = document.getElementById('restart-button');
const roadsContainer = document.getElementById('roads');
const powerUpsContainer = document.getElementById('power-ups');
const gameOverScreen = document.getElementById('game-over');

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

const ROAD_HEIGHT = 60;
const ROAD_GAP = 40;
const VEHICLE_TYPES = ['car', 'truck', 'motorcycle'];
const POWER_UP_TYPES = ['shield', 'slowTime', 'speedBoost'];
const POWER_UP_DURATION = 5000;

function initGame() {
    console.log("Initializing game...");
    gameState.player = { x: gameArea.clientWidth / 2 - 25, y: gameArea.clientHeight - 60, speed: 5, isInvincible: false };
    updatePlayerPosition();
    createRoads();
    gameState.isRunning = true;
    gameLoop();
}

function createRoads() {
    const roadCount = Math.ceil(gameArea.clientHeight / (ROAD_HEIGHT + ROAD_GAP)) + 1;
    for (let i = 0; i < roadCount; i++) {
        const road = document.createElement('div');
        road.classList.add('road');
        road.style.bottom = `${i * (ROAD_HEIGHT + ROAD_GAP)}px`;
        roadsContainer.appendChild(road);
        gameState.roads.push({ element: road, y: i * (ROAD_HEIGHT + ROAD_GAP) });
    }
    console.log("Roads created.");
}

function updatePlayerPosition() {
    player.style.left = `${gameState.player.x}px`;
    player.style.bottom = `${gameState.player.y}px`;
}

function movePlayer(direction) {
    switch(direction) {
        case 'left':
            if (gameState.player.x > 0) gameState.player.x -= gameState.player.speed;
            break;
        case 'right':
            if (gameState.player.x < gameArea.clientWidth - 50) gameState.player.x += gameState.player.speed;
            break;
        case 'up':
            if (gameState.player.y < gameArea.clientHeight - 50) gameState.player.y += gameState.player.speed;
            break;
        case 'down':
            if (gameState.player.y > 0) gameState.player.y -= gameState.player.speed;
            break;
    }
    updatePlayerPosition();
    checkCrossing();
}

function createVehicle(road) {
    const type = VEHICLE_TYPES[Math.floor(Math.random() * VEHICLE_TYPES.length)];
    const vehicle = document.createElement('div');
    vehicle.classList.add('vehicle', type);
    vehicle.style.bottom = `${road.y + ROAD_HEIGHT / 2 - 15}px`;
    vehicle.style.left = `${Math.random() > 0.5 ? '-60px' : gameArea.clientWidth + 'px'}`;
    gameArea.appendChild(vehicle);
    return { 
        element: vehicle, 
        x: parseInt(vehicle.style.left), 
        y: parseInt(vehicle.style.bottom), 
        direction: vehicle.style.left === '-60px' ? 1 : -1,
        speed: Math.random() * 2 + 1
    };
}

function moveVehicles() {
    gameState.vehicles.forEach((vehicle, index) => {
        vehicle.x += vehicle.direction * vehicle.speed;
        vehicle.element.style.left = `${vehicle.x}px`;
        
        if (vehicle.x > gameArea.clientWidth || vehicle.x < -60) {
            vehicle.element.remove();
            gameState.vehicles.splice(index, 1);
        }
    });
}

function createPowerUp() {
    const type = POWER_UP_TYPES[Math.floor(Math.random() * POWER_UP_TYPES.length)];
    const powerUp = document.createElement('div');
    powerUp.classList.add('power-up');
    powerUp.dataset.type = type;
    powerUp.textContent = type.charAt(0).toUpperCase();
    powerUp.style.bottom = `${Math.random() * (gameArea.clientHeight - 30)}px`;
    powerUp.style.left = `${Math.random() * (gameArea.clientWidth - 30)}px`;
    powerUpsContainer.appendChild(powerUp);
    gameState.powerUps.push({ element: powerUp, type });
}

function checkCollisions() {
    gameState.vehicles.forEach(vehicle => {
        const vehicleRect = vehicle.element.getBoundingClientRect();
        const playerRect = player.getBoundingClientRect();
        if (!(vehicleRect.right < playerRect.left || 
              vehicleRect.left > playerRect.right || 
              vehicleRect.bottom < playerRect.top || 
              vehicleRect.top > playerRect.bottom)) {
            if (!gameState.player.isInvincible) gameOver();
        }
    });
}

function checkPowerUps() {
    gameState.powerUps.forEach((powerUp, index) => {
        const powerUpRect = powerUp.element.getBoundingClientRect();
        const playerRect = player.getBoundingClientRect();
        if (!(powerUpRect.right < playerRect.left || 
              powerUpRect.left > playerRect.right || 
              powerUpRect.bottom < playerRect.top || 
              powerUpRect.top > playerRect.bottom)) {
            activatePowerUp(powerUp.type);
            powerUp.element.remove();
            gameState.powerUps.splice(index, 1);
        }
    });
}

function activatePowerUp(type) {
    console.log(`Activating power-up: ${type}`);
    switch (type) {
        case 'shield':
            gameState.player.isInvincible = true;
            player.style.backgroundColor = '#00F';
            setTimeout(() => {
                gameState.player.isInvincible = false;
                player.style.backgroundColor = '#FF6347';
            }, POWER_UP_DURATION);
            break;
        case 'slowTime':
            gameState.vehicles.forEach(vehicle => vehicle.speed *= 0.5);
            setTimeout(() => {
                gameState.vehicles.forEach(vehicle => vehicle.speed *= 2);
            }, POWER_UP_DURATION);
            break;
        case 'speedBoost':
            gameState.player.speed += 2;
            setTimeout(() => gameState.player.speed -= 2, POWER_UP_DURATION);
            break;
    }
}

function checkCrossing() {
    if (gameState.player.y >= gameArea.clientHeight - 50) {
        gameState.score += 10;
        scoreElement.textContent = gameState.score;
        if (gameState.score > gameState.highScore) {
            gameState.highScore = gameState.score;
            highScoreElement.textContent = gameState.highScore;
        }
        gameState.player.y = 0;
        gameState.level = Math.floor(gameState.score / 100) + 1;
        levelElement.textContent = gameState.level;
    }
}

function gameOver() {
    console.log("Game over!");
    gameState.isRunning = false;
    gameOverScreen.style.display = 'flex';
}

function restartGame() {
    console.log("Restarting game...");
    gameOverScreen.style.display = 'none';
    gameState.score = 0;
    scoreElement.textContent = '0';
    gameState.level = 1;
    levelElement.textContent = '1';
    gameState.vehicles.forEach(vehicle => vehicle.element.remove());
    gameState.vehicles = [];
    gameState.powerUps.forEach(powerUp => powerUp.element.remove());
    gameState.powerUps = [];
    initGame();
}

function gameLoop() {
    if (gameState.isRunning) {
        moveVehicles();
        checkCollisions();
        checkPowerUps();
        
        if (Math.random() < 0.02) createVehicle(gameState.roads[Math.floor(Math.random() * gameState.roads.length)]);
        if (Math.random() < 0.005) createPowerUp();
        
        gameState.timeCycle++;
        if (gameState.timeCycle % 1000 === 0) {
            gameState.timeOfDay = gameState.timeOfDay === 'day' ? 'night' : 'day';
            gameArea.classList.toggle('night', gameState.timeOfDay === 'night');
            timeOfDayElement.textContent = gameState.timeOfDay.charAt(0).toUpperCase() + gameState.timeOfDay.slice(1);
        }
        
        requestAnimationFrame(gameLoop);
    }
}

startButton.addEventListener('click', () => {
    if (!gameState.isRunning) {
        initGame();
    }
});

pauseButton.addEventListener('click', () => {
    gameState.isRunning = !gameState.isRunning;
    if (gameState.isRunning) {
        gameLoop();
    }
});

restartButton.addEventListener('click', restartGame);

document.addEventListener('keydown', (e) => {
    if (gameState.isRunning) {
        switch (e.code) {
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
    }
});

console.log("JavaScript loaded.");