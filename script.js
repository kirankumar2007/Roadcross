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
    gameState.player = { x: gameArea.clientWidth / 2 - 15, y: gameArea.clientHeight - 40, speed: 5, isInvincible: false };
    updatePlayerPosition();
    createRoads();
}

function createRoads() {
    const roadCount = Math.floor(gameArea.clientHeight / (ROAD_HEIGHT + ROAD_GAP));
    for (let i = 0; i < roadCount; i++) {
        const road = document.createElement('div');
        road.classList.add('road');
        road.style.bottom = `${i * (ROAD_HEIGHT + ROAD_GAP)}px`;
        roadsContainer.appendChild(road);
        gameState.roads.push({ element: road, y: i * (ROAD_HEIGHT + ROAD_GAP) });
    }
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
            if (gameState.player.x < gameArea.clientWidth - 30) gameState.player.x += gameState.player.speed;
            break;
        case 'up':
            if (gameState.player.y < gameArea.clientHeight - 30) gameState.player.y += gameState.player.speed;
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
    vehicle.style.bottom = `${road.y + ROAD_HEIGHT / 2 - 12.5}px`;
    vehicle.style.left = `${Math.random() > 0.5 ? '-70px' : gameArea.clientWidth + 'px'}`;
    gameArea.appendChild(vehicle);
    return { 
        element: vehicle, 
        x: parseInt(vehicle.style.left), 
        y: parseInt(vehicle.style.bottom), 
        direction: vehicle.style.left === '-70px' ? 1 : -1,
        speed: type === 'motorcycle' ? 3 : (type === 'truck' ? 1 : 2)
    };
}

function moveVehicles() {
    gameState.vehicles.forEach((vehicle, index) => {
        vehicle.x += vehicle.direction * vehicle.speed;
        vehicle.element.style.left = `${vehicle.x}px`;
        
        if (vehicle.x > gameArea.clientWidth + 70 || vehicle.x < -70) {
            gameArea.removeChild(vehicle.element);
            gameState.vehicles.splice(index, 1);
        }
        
        checkCollision(vehicle);
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
        gameOver();
    }
}

function createPowerUp() {
    const type = POWER_UP_TYPES[Math.floor(Math.random() * POWER_UP_TYPES.length)];
    const powerUp = document.createElement('div');
    powerUp.classList.add('power-up');
    powerUp.style.left = `${Math.random() * (gameArea.clientWidth - 20)}px`;
    powerUp.style.bottom = `${Math.random() * (gameArea.clientHeight - 20)}px`;
    
    switch(type) {
        case 'shield':
            powerUp.innerHTML = '🛡️';
            powerUp.style.backgroundColor = 'gold';
            break;
        case 'slowTime':
            powerUp.innerHTML = '⏱️';
            powerUp.style.backgroundColor = 'lightblue';
            break;
        case 'speedBoost':
            powerUp.innerHTML = '🚀';
            powerUp.style.backgroundColor = 'orange';
            break;
    }
    
    powerUpsContainer.appendChild(powerUp);
    gameState.powerUps.push({ element: powerUp, type, x: parseInt(powerUp.style.left), y: parseInt(powerUp.style.bottom) });
}

function checkPowerUpCollision() {
    const playerRect = player.getBoundingClientRect();
    gameState.powerUps.forEach((powerUp, index) => {
        const powerUpRect = powerUp.element.getBoundingClientRect();
        
        if (playerRect.left < powerUpRect.right &&
            playerRect.right > powerUpRect.left &&
            playerRect.top < powerUpRect.bottom &&
            playerRect.bottom > powerUpRect.top) {
            activatePowerUp(powerUp.type);
            powerUpsContainer.removeChild(powerUp.element);
            gameState.powerUps.splice(index, 1);
        }
    });
}

function activatePowerUp(type) {
    switch(type) {
        case 'shield':
            gameState.player.isInvincible = true;
            player.style.boxShadow = '0 0 10px 5px gold';
            setTimeout(() => {
                gameState.player.isInvincible = false;
                player.style.boxShadow = 'none';
            }, POWER_UP_DURATION);
            break;
        case 'slowTime':
            gameState.vehicles.forEach(vehicle => vehicle.speed /= 2);
            setTimeout(() => {
                gameState.vehicles.forEach(vehicle => vehicle.speed *= 2);
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
    if (gameState.player.y >= gameArea.clientHeight - 30) {
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
    gameState.timeCycle += 1;
    if (gameState.timeCycle >= 600) {
        gameState.timeCycle = 0;
        gameState.timeOfDay = gameState.timeOfDay === 'day' ? 'night' : 'day';
        timeOfDayElement.textContent = gameState.timeOfDay.charAt(0).toUpperCase() + gameState.timeOfDay.slice(1);
        gameArea.style.backgroundColor = gameState.timeOfDay === 'day' ? '#98FB98' : '#1a3c40';
    }
}

function gameOver() {
    gameState.isRunning = false;
    alert(`Game Over! Your score: ${gameState.score}`);
    updateHighScore();
    resetGame();
}

function updateHighScore() {
    if (gameState.score > gameState.highScore) {
        gameState.highScore = gameState.score;
        highScoreElement.textContent = gameState.highScore;
    }
}

function resetGame() {
    gameState.score = 0;
    gameState.level = 1;
    gameState.timeOfDay = 'day';
    gameState.timeCycle = 0;
    scoreElement.textContent = gameState.score;
    levelElement.textContent = gameState.level;
    timeOfDayElement.textContent = 'Day';
    gameArea.style.backgroundColor = '#98FB98';
    gameState.vehicles.forEach(vehicle => gameArea.removeChild(vehicle.element));
    gameState.vehicles = [];
    gameState.powerUps.forEach(powerUp => powerUpsContainer.removeChild(powerUp.element));
    gameState.powerUps = [];
    initGame();
}

function gameLoop() {
    if (gameState.isRunning) {
        moveVehicles();
        checkPowerUpCollision();
        updateTimeOfDay();
        if (Math.random() < 0.02 * gameState.level) {
            const randomRoad = gameState.roads[Math.floor(Math.random() * gameState.roads.length)];
            gameState.vehicles.push(createVehicle(randomRoad));
        }
        if (Math.random() < 0.01 * gameState.level) {
            createPowerUp();
        }
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
        gameState.isRunning = true;
        gameLoop();
    }
});

pauseButton.addEventListener('click', () => {
    gameState.isRunning = false;
});
