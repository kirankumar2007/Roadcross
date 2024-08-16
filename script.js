const gameContainer = document.getElementById('game-container');
const player = document.getElementById('player');
const scoreElement = document.getElementById('score-value');

let playerPosition = { x: 180, y: 10 };
let score = 0;
let cars = [];

function movePlayer(e) {
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
    cars.forEach(car => {
        const carRect = car.getBoundingClientRect();
        if (
            playerRect.left < carRect.right &&
            playerRect.right > carRect.left &&
            playerRect.top < carRect.bottom &&
            playerRect.bottom > carRect.top
        ) {
            alert('Game Over! Your score: ' + score);
            resetGame();
        }
    });
}

function checkCrossing() {
    if (playerPosition.y >= 560) {
        score++;
        scoreElement.textContent = score;
        playerPosition.y = 10;
        updatePlayerPosition();
    }
}

function resetGame() {
    playerPosition = { x: 180, y: 10 };
    updatePlayerPosition();
    score = 0;
    scoreElement.textContent = score;
    cars.forEach(car => gameContainer.removeChild(car));
    cars = [];
}

function gameLoop() {
    moveCars();
    if (Math.random() < 0.02) createCar();
    checkCollision();
    requestAnimationFrame(gameLoop);
}

document.addEventListener('keydown', movePlayer);
gameLoop();