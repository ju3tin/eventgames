class SoundManager {
    constructor() {
        this.sounds = {};
        this.backgroundMusics = {};
        this.lobbyMusic = null;
        this.currentBackgroundMusic = null;
        this.isMuted = false;
        this.volume = 0.7;
        this.userInteracted = false; 
        this.pendingMusic = null;
    }

    async loadSounds() {
        this.lobbyMusic = new Audio('assets/sounds/lobby_music.mp3');
        this.lobbyMusic.loop = true;
        this.lobbyMusic.volume = this.volume * 0.5;

        await new Promise((resolve) => {
            this.lobbyMusic.addEventListener('canplaythrough', () => resolve());
            this.lobbyMusic.addEventListener('error', () => {
                console.error('Failed to load lobby music');
                resolve();
            });
        });

        const arenaMusicFiles = {
            'lab': 'assets/sounds/lab_music.mp3',
            'struggle': 'assets/sounds/struggle_music.mp3',
            'eya': 'assets/sounds/eya_music.mp3'
        };

        for (const [arena, path] of Object.entries(arenaMusicFiles)) {
            const audio = new Audio(path);
            audio.loop = true;
            audio.volume = this.volume * 0.5;

            await new Promise((resolve) => {
                audio.addEventListener('canplaythrough', () => {
                    this.backgroundMusics[arena] = audio;
                    resolve();
                });
                audio.addEventListener('error', () => {
                    console.error('Failed to load background music for arena:', arena);
                    resolve();
                });
            });
        }

        const soundFiles = {
            'punch': 'assets/sounds/punch.mp3',
            'hit': 'assets/sounds/hit.mp3',
            'victory': 'assets/sounds/victory.mp3',
            'defeat': 'assets/sounds/defeat.mp3',
            'countdown': 'assets/sounds/countdown.mp3',
        };

        const loadPromises = Object.entries(soundFiles).map(([name, path]) => {
            return new Promise((resolve) =>{
                const audio = new Audio(path);
                audio.addEventListener('canplaythrough', () => {
                    this.sounds[name] = audio;
                    resolve();
                });
                audio.addEventListener('error', () => {
                    console.error('Failed to load sound:', name);
                    resolve();
                });
            });
        });

        await Promise.all(loadPromises);
        console.log('All sounds loaded');

        this.setupInteractionListeners();
    }

    setupInteractionListeners() {
        const interactionEvents = ['click', 'keydown', 'touchstart'];

        const handleInteractions = () => {
            this.userInteracted = true;

            // Play any pending music
            if (this.pendingMusic) {
                if (this.pendingMusic === 'lobby') {
                    this.playLobbyMusic();
                } else {
                    this.playBackgroundMusic(this.pendingMusic);
                }
                this.pendingMusic = null;
            }

            // Remove listeners after first interaction
            interactionEvents.forEach(event => {
                document.removeEventListener(event, handleInteractions, true);
            });
        };

        // Add listeners for user interaction
        interactionEvents.forEach(event => {
            document.addEventListener(event, handleInteractions, true);
        });
    }

    playLobbyMusic() {
        if (this.isMuted) return;

        if (!this.userInteracted) {
            this.pendingMusic = 'lobby';
            return;
        }

        if (this.currentBackgroundMusic === this.lobbyMusic) return;

        this.stopBackgroundMusic();

        if (this.lobbyMusic) {
            this.currentBackgroundMusic = this.lobbyMusic;
            this.lobbyMusic.currentTime = 0;
            this.lobbyMusic.play().catch(e => console.log("Lobby music play error:", e));
        }
    }

    playBackgroundMusic(arena) {
        if (this.isMuted) return;

        if (!this.userInteracted) {
            this.pendingMusic = arena;
            return;
        }

        // Stop any currently playing music
        this.stopBackgroundMusic();

        const music = this.backgroundMusics[arena];
        if (music) {
            this.currentBackgroundMusic = music;
            music.currentTime = 0;
            music.play().catch(e => console.log("Background music play error:", e));
        }
    }

    stopBackgroundMusic() {
        if (this.currentBackgroundMusic) {
            this.currentBackgroundMusic.pause();
            this.currentBackgroundMusic.currentTime = 0;
            this.currentBackgroundMusic = null;
        }
    }

    playSound(soundName) {
        if (this.sounds[soundName] && !this.isMuted) {
            const sound = this.sounds[soundName].cloneNode();
            sound.volume = this.volume;
            sound.play().catch(e => console.log(`Sound play error (${soundName}):`, e));
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.isMuted) {
            this.stopBackgroundMusic();
        }
        else if (this.currentBackgroundMusic) {
            this.currentBackgroundMusic.play().catch(e => console.log("Background music play error:", e));
        }
        return this.isMuted; 
    }
}

window.soundManager = new SoundManager();