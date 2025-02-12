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

        // Load road pattern
        this.roadPattern = new Image();
        this.roadPattern.src = 'data:image/svg+xml,' + encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="100" height="600">
                <rect width="100" height="600" fill="#333333"/>
                <rect x="45" y="0" width="10" height="60" fill="#FFFFFF"/>
                <rect x="45" y="100" width="10" height="60" fill="#FFFFFF"/>
                <rect x="45" y="200" width="10" height="60" fill="#FFFFFF"/>
                <rect x="45" y="300" width="10" height="60" fill="#FFFFFF"/>
                <rect x="45" y="400" width="10" height="60" fill="#FFFFFF"/>
                <rect x="45" y="500" width="10" height="60" fill="#FFFFFF"/>
            </svg>
        `);

        // Set initial canvas dimensions
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;

        this.player = {
            x: this.canvas.width / 2,
            y: this.canvas.height - 100,
            width: 60,
            height: 40,
            speed: 8,
            jumping: false,
            velocity: 0
        };

        window.addEventListener('resize', () => this.resize());
        this.startGame();
    }

    resize() {
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;
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
                x: Math.random() * (this.canvas.width - 30),
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
                x: Math.random() * (this.canvas.width - 40),
                y: -50,
                width: 40,
                height: 40,
                speed: 3 + Math.random()
            });
        }
    }

    update() {
        if (this.gameOver) return;

        // Update road offset
        this.roadOffset = (this.roadOffset + this.roadSpeed) % 600;

        // Player movement
        if (this.controls.left) this.player.x -= this.player.speed;
        if (this.controls.right) this.player.x += this.player.speed;

        // Jumping
        if (this.controls.jump && !this.player.jumping) {
            this.player.jumping = true;
            this.player.velocity = -15;
            audioManager.playJump();
        }

        // Apply gravity
        if (this.player.jumping) {
            this.player.y += this.player.velocity;
            this.player.velocity += 0.8;

            if (this.player.y >= this.canvas.height - 100) {
                this.player.y = this.canvas.height - 100;
                this.player.jumping = false;
                this.player.velocity = 0;
            }
        }

        // Keep player in bounds
        this.player.x = Math.max(0, Math.min(this.player.x, this.canvas.width - this.player.width));

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

        // Draw scrolling road pattern
        const pattern = this.ctx.createPattern(this.roadPattern, 'repeat');
        this.ctx.save();
        this.ctx.translate(0, this.roadOffset);
        this.ctx.fillStyle = pattern;
        this.ctx.fillRect(0, -600, this.canvas.width, this.canvas.height + 600);
        this.ctx.restore();

        // Draw player (tuk-tuk)
        this.ctx.fillStyle = '#FF6B6B';
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);

        // Draw items
        this.items.forEach(item => {
            this.ctx.fillStyle = item.type === 'kavum' ? '#FFE66D' : '#4ECDC4';
            this.ctx.fillRect(item.x, item.y, item.width, item.height);
        });

        // Draw obstacles
        this.obstacles.forEach(obstacle => {
            this.ctx.fillStyle = '#2C3E50';
            this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        });
    }

    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
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