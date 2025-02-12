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

        // Define lanes
        this.laneWidth = this.canvas.width / 2;
        this.lanes = [
            this.laneWidth / 2,  // Center of left lane
            this.canvas.width - this.laneWidth / 2  // Center of right lane
        ];
        this.currentLane = 0;  // 0 = left lane, 1 = right lane

        this.player = {
            x: this.lanes[this.currentLane],
            y: this.canvas.height - 100,
            width: 40,
            height: 60,  // Make the tuk-tuk taller for top-down view
            targetX: this.lanes[this.currentLane],
            speed: 10,
            lerpFactor: 0.15  // Smooth movement factor
        };

        window.addEventListener('resize', () => this.resize());
        this.startGame();
    }

    resize() {
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;
        this.laneWidth = this.canvas.width / 2;
        this.lanes = [
            this.laneWidth / 2,
            this.canvas.width - this.laneWidth / 2
        ];
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
            const lane = Math.floor(Math.random() * 2);
            this.items.push({
                x: this.lanes[lane],
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
            const lane = Math.floor(Math.random() * 2);
            this.obstacles.push({
                x: this.lanes[lane],
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

        // Lane-based movement
        if (this.controls.left && this.currentLane > 0) {
            this.currentLane = 0;
            this.player.targetX = this.lanes[this.currentLane];
            audioManager.playJump();
        }
        if (this.controls.right && this.currentLane < 1) {
            this.currentLane = 1;
            this.player.targetX = this.lanes[this.currentLane];
            audioManager.playJump();
        }

        // Smooth movement between lanes
        const dx = this.player.targetX - this.player.x;
        this.player.x += dx * this.player.lerpFactor;

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

        this.ctx.fillStyle = '#FFFFFF';
        for (let i = 0; i < totalMarkers; i++) {
            const y = ((i * (markerHeight + markerGap) + this.roadOffset) % this.canvas.height) - markerHeight;
            this.ctx.fillRect(this.canvas.width / 2 - 5, y, 10, markerHeight);
        }

        // Draw player (tuk-tuk)
        this.ctx.fillStyle = '#FF6B6B';
        const playerX = this.player.x - this.player.width / 2;
        const playerY = this.player.y;
        this.ctx.fillRect(playerX, playerY, this.player.width, this.player.height);

        // Draw items
        this.items.forEach(item => {
            this.ctx.fillStyle = item.type === 'kavum' ? '#FFE66D' : '#4ECDC4';
            const itemX = item.x - item.width / 2;
            this.ctx.fillRect(itemX, item.y, item.width, item.height);
        });

        // Draw obstacles
        this.obstacles.forEach(obstacle => {
            this.ctx.fillStyle = '#2C3E50';
            const obstacleX = obstacle.x - obstacle.width / 2;
            this.ctx.fillRect(obstacleX, obstacle.y, obstacle.width, obstacle.height);
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