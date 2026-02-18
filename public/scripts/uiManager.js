class UIManager {
    constructor() {
        this.currentScreen = "control";
        this.selectedCharacter = "mac";
        this.selectedArena = "struggle";
        this.previewCanvases = {};
        this.previewAnimations = {};
        this.setupEventListeners();
        this.setupGameOverListeners();
        this.arenaImages = {};
    }

    setupGameOverListeners() {
        document
            .getElementById("playAgainBtn")
            .addEventListener("click", () => {
                this.playAgain();
            });

        document.getElementById("mainMenuBtn").addEventListener("click", () => {
            this.returnToMainMenu();
        });
    }

    playAgain() {
        document.getElementById("gameOverScreen").classList.add("hidden");
        this.showCharacterScreen();

        // Play lobby music
        soundManager.playLobbyMusic();
    }

    returnToMainMenu() {
        if (window.gameManager) {
            window.gameManager.resetGame();
        }

        // Play lobby music
        soundManager.playLobbyMusic();
    }

    setupEventListeners() {
        // Start button on control screen
        document.getElementById("startBtn").addEventListener("click", () => {
            this.showCharacterScreen();
        });

        // Character selection buttons
        document.querySelectorAll(".character-option").forEach((option) => {
            option.addEventListener("click", () => {
                this.selectCharacter(option.dataset.character);
            });
        });

        // Character select button
        document
            .getElementById("characterSelectBtn")
            .addEventListener("click", () => {
                this.showArenaScreen();
            });

        // Arena selection
        document.querySelectorAll(".arena-option").forEach((option) => {
            option.addEventListener("click", () => {
                this.selectArena(option.dataset.arena);
            });
        });

        // Arena select button
        document
            .getElementById("arenaSelectBtn")
            .addEventListener("click", () => {
                this.startGame();
            });

        document.querySelectorAll(".character-option").forEach((option) => {
            option.addEventListener("mouseenter", () => {
                this.previewAnimations[option.dataset.character].animation =
                    spriteManager.getAnimation(
                        option.dataset.character,
                        "leftJab"
                    );
            });
        });

        document.querySelectorAll(".character-option").forEach((option) => {
            option.addEventListener("mouseleave", () => {
                this.previewAnimations[option.dataset.character].animation =
                    spriteManager.getAnimation(
                        option.dataset.character,
                        "idle"
                    );
            });
        });

        // Mute button
        document.getElementById("muteBtn").addEventListener("click", () => {
            const isMuted = soundManager.toggleMute();
            document.getElementById("muteBtn").textContent = isMuted
                ? "UNMUTE"
                : "MUTE";
        });
    }

    // Show the character selection screen
    showCharacterScreen() {
        document.getElementById("controlScreen").classList.add("hidden");
        document.getElementById("characterScreen").classList.remove("hidden");
        this.currentScreen = "character";

        // Play lobby music for selection screens
        soundManager.playLobbyMusic();

        // Load character previews
        this.loadCharacterPreviews();
    }

    // Show the arena selection screen
    showArenaScreen() {
        document.getElementById("characterScreen").classList.add("hidden");
        document.getElementById("arenaScreen").classList.remove("hidden");
        this.currentScreen = "arena";

        // Play lobby music for selection screens
        soundManager.playLobbyMusic();

        // Load arena previews
        this.loadArenaPreviews();
    }

    // Start the game
    startGame() {
        document.getElementById("arenaScreen").classList.add("hidden");
        this.currentScreen = "game";

        // Initialize the game
        if (window.gameManager) {
            window.gameManager.startGame(
                this.selectedCharacter,
                this.selectedArena
            );
        }
    }

    // Select a character
    selectCharacter(character) {
        this.selectedCharacter = character;

        // Update UI to reflect selection
        document.querySelectorAll(".character-option").forEach((option) => {
            option.classList.remove("selected");
        });
        document
            .querySelector(`.character-option[data-character="${character}"]`)
            .classList.add("selected");
    }

    // Select an arena
    selectArena(arena) {
        this.selectedArena = arena;

        // Update UI to reflect selection
        document.querySelectorAll(".arena-option").forEach((option) => {
            option.classList.remove("selected");
        });
        document
            .querySelector(`.arena-option[data-arena="${arena}"]`)
            .classList.add("selected");
    }

    // Load character previews
    async loadCharacterPreviews() {
        if (!spriteManager.loaded) {
            await spriteManager.loadSprites();
        }

        const characters = ["mac", "don", "king"];

        for (const character of characters) {
            const canvasId = `${character}Preview`;
            const canvas = document.getElementById(canvasId);

            if (canvas) {
                // Store canvas and context
                this.previewCanvases[character] = {
                    element: canvas,
                    context: canvas.getContext("2d"),
                };

                this.previewAnimations[character] = {
                    animation: spriteManager.getAnimation(character, "idle"),
                    lastFrameTime: 0,
                };

                // Start animation loop
                this.animateCharacterPreview(character);
            }
        }

        // Default selection
        this.selectCharacter("mac");
    }

    // Animate character preview
    animateCharacterPreview(character) {
        if (
            !this.previewCanvases[character] ||
            !this.previewAnimations[character]
        )
            return;

        const canvas = this.previewCanvases[character].element;
        const ctx = this.previewCanvases[character].context;
        const animationState = this.previewAnimations[character];

        // Animation loop
        const animate = (timestamp) => {
            // Stop animate after leaving character screen
            if (this.currentScreen !== "character") return;

            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Update animation
            if (animationState.animation) {
                spriteManager.updateAnimation(
                    animationState.animation,
                    timestamp
                );

                // Get current frame
                const frame =
                    animationState.animation.frames[
                        animationState.animation.currentFrame
                    ];

                if (frame) {
                    // Calculate scaling to fit canvas
                    const scale =
                        Math.min(
                            canvas.width / frame.width,
                            canvas.height / frame.height
                        ) * 1; // 80% of canvas size

                    const scaledWidth = frame.width * scale;
                    const scaledHeight = frame.height * scale;

                    // Draw frame centered
                    const x = canvas.width - scaledWidth;
                    const y = canvas.height - scaledHeight;
                    frame.draw(ctx, x, y, scaledWidth, scaledHeight);
                }
            }

            requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);
    }

    stopPreviewAnimations() {
        Object.values(this.previewCanvases).forEach((canvas) => {
            if (canvas && canvas.context) {
                canvas.context.clearRect(
                    0,
                    0,
                    canvas.element.width,
                    canvas.element.height
                );
            }
        });

        this.previewCanvases = {};
        this.previewAnimations = {};
    }

    async loadArenaImages() {
        const arenas = ["lab", "struggle", "eya"];
        const imagePromises = arenas.map((arena) => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => resolve({ arena, img });
                img.onerror = () => {
                    console.error(`Failed to load image for arena: ${arena}`);
                    resolve({ arena, img: null });
                };
                img.src = `assets/arenas/${arena}.jpg`;
            });
        });

        const loadedImages = await Promise.all(imagePromises);
        loadedImages.forEach(({ arena, img }) => {
            this.arenaImages[arena] = img;
        });

        console.log("Arena preview images loaded:", this.arenaImages);
    }

    async loadArenaPreviews() {
        if (Object.keys(this.arenaImages).length === 0) {
            await this.loadArenaImages();
        }

        const arenas = ["lab", "struggle", "eya"];
        arenas.forEach((arena) => {
            const canvas = document.getElementById(`${arena}Preview`);
            if (canvas) {
                const ctx = canvas.getContext("2d");
                const img = this.arenaImages[arena];

                if (img) {
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                } else {
                    ctx.fillStyle = "#222";
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.fillStyle = "#fff";
                    ctx.font = "16px Arial";
                    ctx.textAlign = "center";
                    ctx.fillText(
                        "Image not available",
                        canvas.width / 2,
                        canvas.height / 2
                    );
                }
            }
        });

        // Default selection
        this.selectArena("lab");
    }
}

// Global instance
const uiManager = new UIManager();
