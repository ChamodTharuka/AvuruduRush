const tukTukImg = new Image();
tukTukImg.src = '/static/assets/car.png';

const kavumImg = new Image();
kavumImg.src = '/static/assets/kavum.png'; // Updated image for Kavum

const kiribathImg = new Image();
kiribathImg.src = '/static/assets/kiribath.png'; // Updated image for Kiribath

const obstacleImg = new Image();
obstacleImg.src = '/static/assets/obstacle.png'; // Updated image for Obstacle

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.controls = new Controls();
        this.score = 0;
        this.timeLeft = 90;
        this.gameOver = false;
        this.items = [];
        this.obstacles = [];
        this.roadOffset = 0;
        this.roadSpeed = 5;

        // Set initial canvas dimensions
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;

        // Road boundaries
        this.roadBoundaries = {
            left: 0,
            right: this.canvas.width
        };

        this.player = {
            x: this.canvas.width / 2,
            y: this.canvas.height - 100,
            width: 40,
            height: 60,
            speed: 6  // Reduced speed for smoother control
        };

        window.addEventListener('resize', () => this.resize());
        this.startGame();
    }

    resize() {
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;
        this.roadBoundaries.right = this.canvas.width;
    }

    startGame() {
        audioManager.initialize();
        this.spawnItems();
        this.spawnObstacles();
        this.gameLoop();
        this.startTimer();
    }

    spawnItems() {
        if (this.items.length < 5) {
            this.items.push({
                x: Math.random() * (this.roadBoundaries.right - 30),
                y: -30,
                width: 30,
                height: 30,
                type: Math.random() < 0.5 ? 'kavum' : 'kiribath',
                speed: 2 + Math.random() * 2
            });
        }
    }

    spawnObstacles() {
        if (this.obstacles.length < 3) {
            this.obstacles.push({
                x: Math.random() * (this.roadBoundaries.right - 40),
                y: -50,
                width: 40,
                height: 60,
                speed: 3 + Math.random()
            });
        }
    }

    update() {
        if (this.gameOver) return;

        // Update road offset for scrolling effect
        this.roadOffset = (this.roadOffset + this.roadSpeed) % this.canvas.height;

        // Smooth movement
        if (this.controls.left) {
            this.player.x -= this.player.speed;
        }
        if (this.controls.right) {
            this.player.x += this.player.speed;
        }

        // Keep player within road boundaries
        this.player.x = Math.max(
            this.player.width / 2,
            Math.min(this.player.x, this.roadBoundaries.right - this.player.width / 2)
        );

        // Update items
        this.items.forEach((item, index) => {
            item.y += item.speed;

            // Collision detection
            if (this.checkCollision(this.player, item)) {
                this.score += item.type === 'kavum' ? 10 : 20;
                this.items.splice(index, 1);
                audioManager.playCollect();
                document.getElementById('score').textContent = this.score;
            }

            if (item.y > this.canvas.height) {
                this.items.splice(index, 1);
            }
        });

        // Update obstacles
        this.obstacles.forEach((obstacle, index) => {
            obstacle.y += obstacle.speed;

            if (this.checkCollision(this.player, obstacle)) {
                this.timeLeft -= 5;
                this.obstacles.splice(index, 1);
                audioManager.playCollision();
            }

            if (obstacle.y > this.canvas.height) {
                this.obstacles.splice(index, 1);
            }
        });

        this.spawnItems();
        this.spawnObstacles();
    }


    
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw grass background
        this.ctx.fillStyle = '#85A878';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw road
        this.ctx.fillStyle = '#333333';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw lane markers
        const markerHeight = 40;
        const markerGap = 60;
        const totalMarkers = Math.ceil(this.canvas.height / (markerHeight + markerGap));

        this.ctx.fillStyle = '#ffffff';
        for (let i = 0; i < totalMarkers; i++) {
            const y = ((i * (markerHeight + markerGap) + this.roadOffset) % this.canvas.height) - markerHeight;
            this.ctx.fillRect(this.canvas.width / 2 - 5, y, 10, markerHeight);
        }
 
        // Draw tuk-tuk (player)
        // Increase Tuk-Tuk size by multiplying width & height
        const tukTukWidth = this.player.width * 1.8;  // Increase width by 1.5x
        const tukTukHeight = this.player.height * 1.3;  // Increase height by 1.5x

        // Adjust position to center the larger image
        const playerX = this.player.x - tukTukWidth / 2;
        const playerY = this.player.y - tukTukHeight / 2;

        // Draw larger Tuk-Tuk
        this.ctx.drawImage(tukTukImg, playerX, playerY, tukTukWidth, tukTukHeight);


        // Draw items (Kavum & Kiribath)
        this.items.forEach(item => {
            var itemX = item.x - item.width / 2;
            var itemY = item.y;

            if (item.type === 'kavum') {
                this.ctx.drawImage(kavumImg, itemX, itemY, item.width, item.height);
            } else {
                this.ctx.drawImage(kiribathImg, itemX, itemY, item.width, item.height);
            }
        });

        // Draw obstacles
        this.obstacles.forEach(obstacle => {
            var obstacleX = obstacle.x - obstacle.width / 2;
            var obstacleY = obstacle.y;
            this.ctx.drawImage(obstacleImg, obstacleX, obstacleY, obstacle.width, obstacle.height);
        });
    }

    checkCollision(rect1, rect2) {
        const rect1X = rect1.x - rect1.width / 2;
        const rect2X = rect2.x - rect2.width / 2;

        return rect1X < rect2X + rect2.width &&
               rect1X + rect1.width > rect2X &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }

    startTimer() {
        const timerElement = document.getElementById('timer');
        const timer = setInterval(() => {
            this.timeLeft--;
            timerElement.textContent = this.timeLeft;

            if (this.timeLeft <= 0) {
                clearInterval(timer);
                this.endGame();
            }
        }, 1000);
    }

    endGame() {
        this.gameOver = true;
        audioManager.playGameOver();
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('gameOver').classList.remove('hidden');
    }

    gameLoop() {
        if (!this.gameOver) {
            this.update();
            this.draw();
            requestAnimationFrame(() => this.gameLoop());
        }
    }
}

function submitScore() {
    const playerName = document.getElementById('playerName').value;
    if (!playerName) return;

    fetch('/api/submit_score', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name: playerName,
            score: game.score
        })
    }).then(() => {
        window.location.href = '/leaderboard';
    });
}

function restartGame() {
    window.location.reload();
}

const game = new Game();