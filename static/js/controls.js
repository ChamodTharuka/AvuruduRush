class Controls {
    constructor() {
        this.left = false;
        this.right = false;
        this.jump = false;
        this.setupKeyboard();
        this.setupTouch();
    }

    setupKeyboard() {
        document.addEventListener('keydown', (e) => {
            e.preventDefault(); // Prevent default keyboard behavior
            switch(e.key) {
                case 'ArrowLeft':
                    this.left = true;
                    break;
                case 'ArrowRight':
                    this.right = true;
                    break;
                case ' ':
                case 'Space':
                    this.jump = true;
                    e.preventDefault(); // Prevent page scrolling on space
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
                case ' ':
                case 'Space':
                    this.jump = false;
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
            const y = touch.clientY - rect.top;

            if (y < rect.height / 3) {
                this.jump = true;
            } else if (x < rect.width / 2) {
                this.left = true;
            } else {
                this.right = true;
            }
        });

        canvas.addEventListener('touchend', () => {
            this.left = false;
            this.right = false;
            this.jump = false;
        });
    }
}