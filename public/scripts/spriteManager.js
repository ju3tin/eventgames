class SpriteManager {
    constructor() {
        this.sprites = {};
        this.characterAnimations = {};
        this.loaded = false;
    }

    async loadSprites() {
        const characterFiles = {
            'mac': "assets/sprites/blue.png",
            'don': "assets/sprites/green.png",
            'king': "assets/sprites/red.png",
            'tyson': "assets/sprites/dodo.png",
        };

        // Load player sprite sheet
        for (const [character, filePath] of Object.entries(characterFiles)) {
            const img = new Image();
            await new Promise((resolve) => {
                img.onload = resolve;
                img.src = filePath;
            });

            this.sprites[character] = img;

            // Create animations for this character
            this.characterAnimations[character] =
                this.createCharacterAnimations(img);
        }

        this.loaded = true;
        console.log("Sprites loaded");
    }

    createCharacterAnimations(player_img) {
        return {
            idle: {
                frames: [
                    new Sprite(player_img, 90, 10, 400, 500),
                    new Sprite(player_img, 550, 10, 400, 500),
                ],
                currentFrame: 0,
                frameCount: 2,
                frameDuration: 200,
                lastFrameTime: 0,
            },
            leftJab: {
                frames: [new Sprite(player_img,  50, 580, 400, 500)],
                currentFrame: 0,
                frameCount: 1,
                frameDuration: 200,
                lastFrameTime: 0,
            },
            rightJab: {
                frames: [new Sprite(player_img, 550, 580, 400, 500)],
                currentFrame: 0,
                frameCount: 1,
                frameDuration: 200,
                lastFrameTime: 0,
            },
            block: {
                frames: [new Sprite(player_img, 90, 1160, 400, 500)],
                currentFrame: 0,
                frameCount: 1,
                frameDuration: 200,
                lastFrameTime: 0,
            },
            dodge: {
                frames: [new Sprite(player_img, 540, 1160, 400, 500)],
                currentFrame: 0,
                frameCount: 1,
                frameDuration: 200,
                lastFrameTime: 0,
            },
            hit: {
                frames: [new Sprite(player_img, 550, 1750, 400, 500)],
                currentFrame: 0,
                frameCount: 1,
                frameDuration: 200,
                lastFrameTime: 0,
            },
            out: {
                frames: [new Sprite(player_img, 0, 1750, 550, 500)],
                currentFrame: 0,
                frameCount: 1,
                frameDuration: 200,
                lastFrameTime: 0,
            },
        };
    }

    getAnimation(character, name) {
        if (this.characterAnimations[character] && this.characterAnimations[character][name]){
            return this.characterAnimations[character][name];
        }

        return null;
    }

    updateAnimation(animation, timestamp) {
        if (!animation) return;

        if (timestamp - animation.lastFrameTime > animation.frameDuration) {
            animation.lastFrameTime = timestamp;
            animation.currentFrame =
                (animation.currentFrame + 1) % animation.frameCount;
        }
    }
}

const spriteManager = new SpriteManager();