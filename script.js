const gameArea = document.getElementById('game-area');
const player = document.getElementById('player');
const scoreElement = document.getElementById('score-value');
const highScoreElement = document.getElementById('high-score-value');
const levelElement = document.getElementById('level-value');
const startButton = document.getElementById('start-button');
const pauseButton = document.getElementById('pause-button');
const roadsContainer = document.getElementById('roads');

let gameState = {
    player: { x: 0, y: 0 },
    score: 0,
    highScore: 0,
    level: 1,
    isRunning: false,
    roads: [],
    cars: []
};

const ROAD_HEIGHT = 60;
const ROAD_GAP = 40;
const PLAYER_SPEED = 5;
const CAR_SPEED = 2;

function initGame() {
    gameState.player = { x: gameArea.clientWidth / 2 - 15, y: gameArea.clientHeight - 40 };
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
            if (gameState.player.x > 0) gameState.player.x -= PLAYER_SPEED;
            break;
        case 'right':
            if (gameState.player.x < gameArea.clientWidth - 30) gameState.player.x += PLAYER_SPEED;
            break;
        case 'up':
            if (gameState.player.y < gameArea.clientHeight - 30) gameState.player.y += PLAYER_SPEED;
            break;
        case 'down':
            if (gameState.player.y > 0) gameState.player.y -= PLAYER_SPEED;
            break;
    }
    updatePlayerPosition();
    checkCrossing();
}

function createCar(road) {
    const car = document.createElement('div');
    car.classList.add('car');
    car.style.bottom = `${road.y + ROAD_HEIGHT / 2 - 12.5}px`;
    car.style.left = `${Math.random() > 0.5 ? '-50px' : gameArea.clientWidth + 'px'}`;
    gameArea.appendChild(car);
    return { element: car, x: parseInt(car.style.left), y: parseInt(car.style.bottom), direction: car.style.left === '-50px' ? 1 : -1 };
}

function moveCars() {
    gameState.cars.forEach((car, index) => {
        car.x += car.direction * CAR_SPEED;
        car.element.style.left = `${car.x}px`;
        
        if (car.x > gameArea.clientWidth + 50 || car.x < -50) {
            gameArea.removeChild(car.element);
            gameState.cars.splice(index, 1);
        }
        
        checkCollision(car);
    });
}

function checkCollision(car) {
    const playerRect = player.getBoundingClientRect();
    const carRect = car.element.getBoundingClientRect();
    
    if (playerRect.left < carRect.right &&
        playerRect.right > carRect.left &&
        playerRect.top < carRect.bottom &&
        playerRect.bottom > carRect.top) {
        gameOver();
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
    scoreElement.textContent = gameState.score;
    levelElement.textContent = gameState.level;
    gameState.cars.forEach(car => gameArea.removeChild(car.element));
    gameState.cars = [];
    initGame();
}

function gameLoop() {
    if (gameState.isRunning) {
        moveCars();
        if (Math.random() < 0.02 * gameState.level) {
            const randomRoad = gameState.roads[Math.floor(Math.random() * gameState.roads.length)];
            gameState.cars.push(createCar(randomRoad));
        }
        requestAnimationFrame(gameLoop);
    }
}

function startGame() {
    if (!gameState.isRunning) {
        gameState.isRunning = true;
        gameLoop();
        startButton.textContent = 'Restart';
    } else {
        resetGame();
    }
}

function togglePause() {
    gameState.isRunning = !gameState.isRunning;
    if (gameState.isRunning) {
        gameLoop();
        pauseButton.textContent = 'Pause';
    } else {
        pauseButton.textContent = 'Resume';
    }
}

document.addEventListener('keydown', (e) => {
    if (gameState.isRunning) {
        switch(e.key) {
            case 'ArrowLeft':
            case 'a':
                movePlayer('left');
                break;
            case 'ArrowRight':
            case 'd':
                movePlayer('right');
                break;
            case 'ArrowUp':
            case 'w':
                movePlayer('up');
                break;
            case 'ArrowDown':
            case 's':
                movePlayer('down');
                break;
        }
    }
});

startButton.addEventListener('click', startGame);
pauseButton.addEventListener('click', togglePause);

initGame();