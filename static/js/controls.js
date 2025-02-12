class Controls {
    constructor() {
        this.left = false;
        this.right = false;
        this.lastKeyPress = 0;
        this.keyDelay = 200; // Delay between lane changes in milliseconds
        this.setupKeyboard();
        this.setupTouch();
    }

    setupKeyboard() {
        document.addEventListener('keydown', (e) => {
            const currentTime = Date.now();
            if (currentTime - this.lastKeyPress < this.keyDelay) {
                return; // Ignore rapid key presses
            }

            switch(e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.left = true;
                    this.right = false;
                    this.lastKeyPress = currentTime;
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.right = true;
                    this.left = false;
                    this.lastKeyPress = currentTime;
                    break;
            }
        });

        document.addEventListener('keyup', (e) => {
            switch(e.key) {
                case 'ArrowLeft':
                    this.left = false;
                    break;
                case 'ArrowRight':
                    this.right = false;
                    break;
            }
        });
    }

    setupTouch() {
        const canvas = document.getElementById('gameCanvas');

        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = canvas.getBoundingClientRect();
            const x = touch.clientX - rect.left;

            const currentTime = Date.now();
            if (currentTime - this.lastKeyPress < this.keyDelay) {
                return; // Ignore rapid touches
            }

            if (x < rect.width / 2) {
                this.left = true;
                this.right = false;
            } else {
                this.right = true;
                this.left = false;
            }
            this.lastKeyPress = currentTime;
        });

        canvas.addEventListener('touchend', () => {
            this.left = false;
            this.right = false;
        });
    }
}