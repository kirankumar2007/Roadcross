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
    gameState.player = { x: gameArea.clientWidth / 2 - 35, y: gameArea.clientHeight - 80, speed: 5, isInvincible: false };
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
            if (gameState.player.x < gameArea.clientWidth - 70) gameState.player.x += gameState.player.speed;
            break;
        case 'up':
            if (gameState.player.y < gameArea.clientHeight - 40) gameState.player.y += gameState.player.speed;
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
    vehicle.style.left = `${Math.random() > 0.5 ? '-50px' : gameArea.clientWidth + 'px'}`;
    gameArea.appendChild(vehicle);
    return { 
        element: vehicle, 
        x: parseInt(vehicle.style.left), 
        y: parseInt(vehicle.style.bottom), 
        direction: vehicle.style.left === '-50px' ? 1 : -1,
        speed: type === 'motorcycle' ? 3 : (type === 'truck' ? 1 : 2)
    };
}

function moveVehicles() {
    gameState.vehicles.forEach((vehicle, index) => {
        vehicle.x += vehicle.direction * vehicle.speed;
        vehicle.element.style.left = `${vehicle.x}px`;
        
        if (vehicle.x > gameArea.clientWidth || vehicle.x < -50) {
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

function movePowerUps() {
    gameState.powerUps.forEach((powerUp, index) => {
        powerUp.y -= 2;
        powerUp.element.style.bottom = `${powerUp.y}px`;
        
        if (powerUp.y < 0) {
            powerUp.element.remove();
            gameState.powerUps.splice(index, 1);
        }
    });
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
            setTimeout(() => gameState.player.isInvincible = false, POWER_UP_DURATION);
            break;
        case 'slowTime':
            gameState.level++;
            levelElement.textContent = gameState.level;
            break;
        case 'speedBoost':
            gameState.player.speed += 2;
            setTimeout(() => gameState.player.speed -= 2, POWER_UP_DURATION);
            break;
    }
}

function checkCrossing() {
    if (gameState.player.y <= 0) {
        gameState.score += 10;
        scoreElement.textContent = gameState.score;
        if (gameState.score > gameState.highScore) {
            gameState.highScore = gameState.score;
            highScoreElement.textContent = gameState.highScore;
        }
        gameState.player.y = gameArea.clientHeight - 40;
        levelElement.textContent = Math.floor(gameState.score / 100) + 1;
    }
}

function gameOver() {
    console.log("Game over!");
    gameState.isRunning = false;
    gameOverScreen.style.display = 'block';
}

function restartGame() {
    console.log("Restarting game...");
    gameOverScreen.style.display = 'none';
    initGame();
    gameState.isRunning = true;
    gameLoop();
}

function gameLoop() {
    if (gameState.isRunning) {
        moveVehicles();
        movePowerUps();
        checkCollisions();
        checkPowerUps();
        gameState.timeCycle++;
        if (gameState.timeCycle % 1000 === 0) {
            gameState.timeOfDay = gameState.timeOfDay === 'day' ? 'night' : 'day';
            gameArea.classList.toggle('night', gameState.timeOfDay === 'night');
            timeOfDayElement.textContent = gameState.timeOfDay;
        }
        requestAnimationFrame(gameLoop);
    }
}

// Placeholder functions
function placeholderFunction1() { console.log("Placeholder function 1"); }
function placeholderFunction2() { console.log("Placeholder function 2"); }
function placeholderFunction3() { console.log("Placeholder function 3"); }
function placeholderFunction4() { console.log("Placeholder function 4"); }
function placeholderFunction5() { console.log("Placeholder function 5"); }

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

// Event listeners for player controls
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
