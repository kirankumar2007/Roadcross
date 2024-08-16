const player = document.getElementById('player');
const road = document.getElementById('road');
const scoreElement = document.getElementById('score-value');

let playerPosition = 180;
let score = 0;

function movePlayer(e) {
    if (e.key === 'ArrowLeft' && playerPosition > 0) {
        playerPosition -= 10;
    } else if (e.key === 'ArrowRight' && playerPosition < 360) {
        playerPosition += 10;
    } else if (e.key === 'ArrowUp' && player.offsetTop > 0) {
        player.style.bottom = `${parseInt(player.style.bottom || 10) + 10}px`;
        checkCrossing();
    } else if (e.key === 'ArrowDown' && player.offsetTop < 550) {
        player.style.bottom = `${parseInt(player.style.bottom || 10) - 10}px`;
    }
    
    player.style.left = `${playerPosition}px`;
}

function checkCrossing() {
    if (player.offsetTop <= road.offsetTop) {
        score++;
        scoreElement.textContent = score;
        player.style.bottom = '10px';
    }
}

document.addEventListener('keydown', movePlayer);