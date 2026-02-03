// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game state variables
let gameActive = false;
let lives = 3;
let score = 0;
let timeLeft = 60;
let gameTimer = null;
let scoreTimer = null;

// Player object
const player = {
    x: 100,
    y: 270,
    width: 40,
    height: 40,
    velocityY: 0,
    jumping: false,
    gravity: 0.8,
    jumpPower: -15
};

// Arrays for game objects
let obstacles = [];
let nextObstacleTime = 0;

// =====================================
// Function 1: สุ่มเวลาที่อุปสรรคจะออกมา
// =====================================
function getRandomObstacleDelay() {
    // สุ่มเวลาระหว่าง 1.5 ถึง 3.5 วินาที (1500-3500 มิลลิวินาที)
    // ทำให้อุปสรรคแต่ละตัวออกมาไม่เท่ากัน
    return Math.random() * 2000 + 1500;
}

// สุ่มประเภทของอุปสรรค
function getRandomObstacleType() {
    const types = ['cactus', 'bird', 'cloud'];
    const random = Math.random();
    
    // กระจายโอกาสของแต่ละประเภท
    if (random < 0.5) return 'cactus';      // 50% โอกาส - กระบองเพชร
    else if (random < 0.8) return 'bird';   // 30% โอกาส - นก
    else return 'cloud';                     // 20% โอกาส - เมฆ (ผ่านได้)
}

// สร้างอุปสรรคใหม่
function createObstacle() {
    const type = getRandomObstacleType();
    const obstacle = {
        type: type,
        x: canvas.width,
        speed: 5 + Math.random() * 2  // ความเร็วสุ่ม 5-7
    };
    
    // กำหนดคุณสมบัติตามประเภท
    if (type === 'cactus') {
        obstacle.y = 280;
        obstacle.width = 30;
        obstacle.height = 40;
        obstacle.canPassThrough = false;
    } else if (type === 'bird') {
        obstacle.y = 200 + Math.random() * 80; // บินในระดับสูงที่แตกต่างกัน
        obstacle.width = 40;
        obstacle.height = 25;
        obstacle.canPassThrough = false;
    } else { // cloud
        obstacle.y = 100 + Math.random() * 100;
        obstacle.width = 60;
        obstacle.height = 30;
        obstacle.canPassThrough = true; // เมฆผ่านได้ไม่ต้องหลบ
    }
    
    obstacles.push(obstacle);
}

// =====================================
// Function 2: จับเวลา 60 วินาที และจบเกมพร้อมแสดง Score
// =====================================
function startGameTimer() {
    // Timer นับถอยหลัง 60 วินาที
    gameTimer = setInterval(() => {
        timeLeft--;
        document.getElementById('timer').textContent = timeLeft;
        
        // เมื่อครบ 60 วินาที จบเกมและแสดงคะแนน
        if (timeLeft <= 0) {
            endGame('หมดเวลา! 🎉', true);
        }
    }, 1000);
    
    // เพิ่มคะแนนทุก 0.5 วินาที
    scoreTimer = setInterval(() => {
        if (gameActive) {
            score += 1;
            document.getElementById('score').textContent = score;
        }
    }, 500);
}

// =====================================
// Function 3: ระบบชีวิต 3 ชีวิต
// =====================================
function loseLife() {
    lives--;
    document.getElementById('lives').textContent = lives;
    
    // ตรวจสอบว่าหมดชีวิตหรือยัง
    if (lives <= 0) {
        endGame('หมดชีวิต! 💔', false);
    } else {
        // รีเซ็ตตำแหน่งผู้เล่น
        player.y = 270;
        player.velocityY = 0;
        player.jumping = false;
        
        // ลบอุปสรรคทั้งหมด
        obstacles = [];
        
        // หยุดเกมชั่วคราว 1 วินาที (ให้ผู้เล่นเตรียมตัว)
        gameActive = false;
        setTimeout(() => {
            gameActive = true;
        }, 1000);
    }
}

// =====================================
// Game Over และ Restart
// =====================================
function endGame(message, isTimeUp) {
    gameActive = false;
    clearInterval(gameTimer);
    clearInterval(scoreTimer);
    
    // แสดงข้อความและคะแนน
    document.getElementById('gameOverTitle').textContent = message;
    document.getElementById('finalScore').textContent = score;
    
    const restartBtn = document.getElementById('restartBtn');
    
    // ถ้าหมดชีวิต ไม่สามารถเล่นซ้ำได้ ต้องโหลดหน้าใหม่
    if (lives <= 0 && !isTimeUp) {
        document.getElementById('livesLeft').textContent = 'หมดชีวิตแล้ว! กรุณาโหลดหน้าใหม่';
        restartBtn.disabled = true;
        restartBtn.textContent = 'โหลดหน้าใหม่';
        restartBtn.onclick = () => location.reload();
    } else {
        document.getElementById('livesLeft').textContent = `เหลือชีวิต: ${lives}`;
        restartBtn.disabled = false;
        restartBtn.onclick = restartGame;
    }
    
    document.getElementById('gameOverOverlay').style.display = 'flex';
}

// เริ่มเกมใหม่ (เฉพาะเมื่อยังมีชีวิต)
function restartGame() {
    if (lives > 0) {
        document.getElementById('gameOverOverlay').style.display = 'none';
        score = 0;
        timeLeft = 60;
        obstacles = [];
        player.y = 270;
        player.velocityY = 0;
        player.jumping = false;
        
        document.getElementById('score').textContent = score;
        document.getElementById('timer').textContent = timeLeft;
        
        gameActive = true;
        startGameTimer();
    }
}

// =====================================
// Drawing Functions
// =====================================
function drawBackground() {
    // ท้องฟ้า
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, 280);
    
    // พื้นดิน
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, 280, canvas.width, 120);
    
    // เส้นหญ้า
    ctx.fillStyle = '#228B22';
    ctx.fillRect(0, 280, canvas.width, 10);
}

function drawPlayer() {
    // ตัว Mario (สีแดง)
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // หมวก
    ctx.fillStyle = '#c0392b';
    ctx.fillRect(player.x + 5, player.y - 10, 30, 10);
    
    // ตาซ้าย
    ctx.fillStyle = 'white';
    ctx.fillRect(player.x + 10, player.y + 10, 8, 8);
    
    // ตาขวา
    ctx.fillRect(player.x + 22, player.y + 10, 8, 8);
    
    // ม่านตาซ้าย
    ctx.fillStyle = 'black';
    ctx.fillRect(player.x + 14, player.y + 12, 4, 4);
    
    // ม่านตาขวา
    ctx.fillRect(player.x + 26, player.y + 12, 4, 4);
}

function drawObstacle(obs) {
    if (obs.type === 'cactus') {
        // ลำต้นกระบองเพชร
        ctx.fillStyle = '#27ae60';
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        
        // หนามซ้าย
        ctx.fillRect(obs.x - 5, obs.y + 10, 5, 5);
        ctx.fillRect(obs.x - 5, obs.y + 20, 5, 5);
        
        // หนามขวา
        ctx.fillRect(obs.x + obs.width, obs.y + 10, 5, 5);
        ctx.fillRect(obs.x + obs.width, obs.y + 20, 5, 5);
        
    } else if (obs.type === 'bird') {
        // ตัวนก
        ctx.fillStyle = obs.canPassThrough ? 'rgba(149, 165, 166, 0.5)' : '#34495e';
        ctx.beginPath();
        ctx.ellipse(obs.x + obs.width/2, obs.y + obs.height/2, 
                   obs.width/2, obs.height/2, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // ปีกซ้าย
        ctx.fillRect(obs.x - 10, obs.y + 5, 15, 5);
        
        // ปีกขวา
        ctx.fillRect(obs.x + obs.width - 5, obs.y + 5, 15, 5);
        
    } else { // cloud
        // เมฆ (โปร่งใส ผ่านได้)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.beginPath();
        ctx.arc(obs.x + 15, obs.y + 15, 15, 0, Math.PI * 2);
        ctx.arc(obs.x + 30, obs.y + 15, 18, 0, Math.PI * 2);
        ctx.arc(obs.x + 45, obs.y + 15, 15, 0, Math.PI * 2);
        ctx.fill();
    }
}

function draw() {
    drawBackground();
    drawPlayer();
    
    for (let obs of obstacles) {
        drawObstacle(obs);
    }
}

// =====================================
// Game Logic
// =====================================
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

function update() {
    if (!gameActive) return;
    
    // อัพเดตฟิสิกส์ผู้เล่น
    player.velocityY += player.gravity;
    player.y += player.velocityY;
    
    // จำกัดไม่ให้ตกผ่านพื้น
    if (player.y >= 270) {
        player.y = 270;
        player.velocityY = 0;
        player.jumping = false;
    }
    
    // สร้างอุปสรรคตามเวลาที่สุ่ม (Function 1)
    const currentTime = Date.now();
    if (currentTime >= nextObstacleTime) {
        createObstacle();
        nextObstacleTime = currentTime + getRandomObstacleDelay();
    }
    
    // อัพเดตและตรวจสอบอุปสรรค
    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].x -= obstacles[i].speed;
        
        // ตรวจสอบการชน (ถ้าไม่สามารถผ่านได้)
        if (!obstacles[i].canPassThrough && checkCollision(player, obstacles[i])) {
            loseLife(); // Function 3
            obstacles.splice(i, 1);
            continue;
        }
        
        // ลบอุปสรรคที่ออกนอกจอ
        if (obstacles[i].x + obstacles[i].width < 0) {
            obstacles.splice(i, 1);
        }
    }
}

// =====================================
// Game Loop
// =====================================
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// =====================================
// Controls
// =====================================
function jump() {
    if (!player.jumping && gameActive) {
        player.velocityY = player.jumpPower;
        player.jumping = true;
    }
}

// ควบคุมด้วยคีย์บอร์ด (SPACE)
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        jump();
    }
});

// ควบคุมด้วยการคลิก
canvas.addEventListener('click', jump);

// =====================================
// Start Game
// =====================================
gameActive = true;
startGameTimer();
nextObstacleTime = Date.now() + getRandomObstacleDelay();
gameLoop();
