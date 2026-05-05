const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game Variables
const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [
    { x: 10, y: 10 }
];

let apple = {
    x: Math.floor(Math.random() * tileCount),
    y: Math.floor(Math.random() * tileCount),
    size: 1.0
};

let dx = 0;
let dy = 0;
let nextDx = 0;
let nextDy = 0;

let score = 0;
let gameRunning = false;
let gameOver = false;
let timeLeft = 60;
let gameStarted = false;

// DOM Elements
const scoreDisplay = document.getElementById('score');
const timerDisplay = document.getElementById('timer');
const appleSizeDisplay = document.getElementById('appleSize');
const gameOverScreen = document.getElementById('gameOver');
const finalScoreDisplay = document.getElementById('finalScore');
const startScreen = document.getElementById('startScreen');

// Event Listeners
document.addEventListener('keydown', handleKeyPress);

function handleKeyPress(e) {
    const key = e.key.toLowerCase();

    if (key === ' ') {
        e.preventDefault();
        if (!gameStarted || gameOver) {
            startGame();
        }
        return;
    }

    if (gameRunning) {
        if (key === 'w' && dy === 0) {
            nextDx = 0;
            nextDy = -1;
        } else if (key === 's' && dy === 0) {
            nextDx = 0;
            nextDy = 1;
        } else if (key === 'a' && dx === 0) {
            nextDx = -1;
            nextDy = 0;
        } else if (key === 'd' && dx === 0) {
            nextDx = 1;
            nextDy = 0;
        }
    }
}

function startGame() {
    snake = [{ x: 10, y: 10 }];
    dx = 0;
    dy = 0;
    nextDx = 0;
    nextDy = 0;
    score = 0;
    timeLeft = 60;
    gameRunning = true;
    gameOver = false;
    gameStarted = true;
    apple = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount),
        size: 1.0
    };

    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');

    updateDisplay();
    startTimer();
    gameLoop();
}

function startTimer() {
    const timerInterval = setInterval(() => {
        if (gameRunning) {
            timeLeft--;
            timerDisplay.textContent = timeLeft;

            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                endGame();
            }
        }
    }, 1000);
}

function gameLoop() {
    if (!gameRunning) return;

    // Only update if the snake is actually moving
    if (dx !== 0 || dy !== 0) {
        update();
    }

    draw();

    setTimeout(gameLoop, 100);
}

function update() {
    dx = nextDx;
    dy = nextDy;

    const head = { x: snake[0].x + dx, y: snake[0].y + dy };

    // Check wall collision
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        endGame();
        return;
    }

    // Check self collision
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        endGame();
        return;
    }

    snake.unshift(head);

    // Check apple collision
    if (head.x === apple.x && head.y === apple.y) {
        score += 2;
        apple.size += 0.5;
        appleSizeDisplay.textContent = apple.size.toFixed(1);
        updateDisplay();

        // Add segments to snake based on apple size
        const newSegmentsCount = Math.floor(apple.size);
        for (let i = 0; i < newSegmentsCount; i++) {
            snake.push({ ...snake[snake.length - 1] });
        }

        // Generate new apple
        apple = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount),
            size: 1.0
        };
        appleSizeDisplay.textContent = '1.0';
    } else {
        snake.pop();
    }
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid (optional, for visual help)
    ctx.strokeStyle = '#eee';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= tileCount; i++) {
        ctx.beginPath();
        ctx.moveTo(i * gridSize, 0);
        ctx.lineTo(i * gridSize, canvas.height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i * gridSize);
        ctx.lineTo(canvas.width, i * gridSize);
        ctx.stroke();
    }

    // Draw snake (green)
    snake.forEach((segment, index) => {
        if (index === 0) {
            ctx.fillStyle = '#00a000'; // Darker green for head
        } else {
            ctx.fillStyle = '#22cc22'; // Bright green for body
        }
        ctx.fillRect(
            segment.x * gridSize + 1,
            segment.y * gridSize + 1,
            gridSize - 2,
            gridSize - 2
        );
        ctx.strokeStyle = '#008000';
        ctx.lineWidth = 1;
        ctx.strokeRect(
            segment.x * gridSize + 1,
            segment.y * gridSize + 1,
            gridSize - 2,
            gridSize - 2
        );
    });

    // Draw apple (red, grows with size)
    ctx.fillStyle = '#ff4444';
    const appleRadius = (gridSize / 2) * apple.size;
    const applePixelX = apple.x * gridSize + gridSize / 2;
    const applePixelY = apple.y * gridSize + gridSize / 2;

    ctx.beginPath();
    ctx.arc(applePixelX, applePixelY, appleRadius, 0, Math.PI * 2);
    ctx.fill();

    // Apple stem
    ctx.strokeStyle = '#228B22';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(applePixelX, applePixelY - appleRadius);
    ctx.lineTo(applePixelX, applePixelY - appleRadius - 5);
    ctx.stroke();
}

function updateDisplay() {
    scoreDisplay.textContent = score;
    timerDisplay.textContent = timeLeft;
    appleSizeDisplay.textContent = apple.size.toFixed(1);
}

function endGame() {
    gameRunning = false;
    gameOver = true;
    finalScoreDisplay.textContent = score;
    gameOverScreen.classList.remove('hidden');
}

// Show start screen on load
window.addEventListener('load', () => {
    startScreen.classList.remove('hidden');
});
