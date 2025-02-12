class Controls {
    constructor() {
        this.left = false;
        this.right = false;
        this.setupKeyboard();
        this.setupTouch();
    }

    setupKeyboard() {
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.left = true;
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.right = true;
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

            if (x < rect.width / 2) {
                this.left = true;
                this.right = false;
            } else {
                this.right = true;
                this.left = false;
            }
        });

        canvas.addEventListener('touchend', () => {
            this.left = false;
            this.right = false;
        });
    }
}