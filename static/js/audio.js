class AudioManager {
    constructor() {
        this.synth = new Tone.Synth().toDestination();
        this.initialized = false;
    }

    async initialize() {
        if (this.initialized) return;
        await Tone.start();
        this.initialized = true;
    }

    playCollect() {
        this.synth.triggerAttackRelease("C5", "8n");
    }

    playJump() {
        this.synth.triggerAttackRelease("G4", "16n");
    }

    playCollision() {
        this.synth.triggerAttackRelease("C3", "8n");
    }

    playGameOver() {
        this.synth.triggerAttackRelease("C4", "4n");
    }
}

const audioManager = new AudioManager();
