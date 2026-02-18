class Player {
    constructor(x, y, spriteManager, character) {
        this.x = x;
        this.y = y;
        this.width = 150;
        this.height = 200;
        this.health = 100;
        this.action = 'idle';
        this.actionTime = 0;
        this.spriteManager = spriteManager;
        this.character = character;
        this.facing = 'right';
        this.currentAnimation = null;
        this.lastHitTime = 0;
        this.hitCooldown = 1000;

        this.lastActionTime = 0;
        this.actionCooldown = 300; 

        // Pose tracking
        this.currentPose = 'idle';
        this.lastPoseTime = 0;
        this.poseChangeCooldown = 700;
    }

    update(deltaTime) {
        if (this.actionTime > 0) {
            this.actionTime -= deltaTime;
            if (this.actionTime <= 0) {
                this.action = 'idle';
            }
        }

        // Get the current animation based on action
        this.currentAnimation = this.spriteManager.getAnimation(this.character, this.getActionName());

        // Update animation frames
        if (this.currentAnimation) {
            this.spriteManager.updateAnimation(this.currentAnimation, performance.now());
        }
    }

    // Map animation name 
    getActionName() {
        switch(this.action) {
            case 'idle': return 'idle';
            case 'left punch': return 'leftJab';
            case 'right punch': return 'rightJab';
            case 'block': return 'block';
            case 'dodge': return 'dodge';
            case 'hit': return 'hit';
            default: return 'idle';
        }
    }

    draw(ctx) {
        if (!this.currentAnimation) return;

        // Get current frame
        const frame = this.currentAnimation.frames[this.currentAnimation.currentFrame];

        if (frame) {
            ctx.save();
 
            // Move origin to center of player
            ctx.translate(this.x + this.width / 2, this.y + this.height / 2);

            // Flip context if facing left
            if (this.facing === 'left') {
                ctx.scale(-1, 1);
            }

            // Draw the sprite frame 
            frame.draw(ctx, -this.width / 2, -this.height / 2, this.width, this.height);
            ctx.restore();
        } else {
            ctx.fillStyle = '#ff6600';
            ctx.fillRect(this.x, this.y, this.width, this.height);

            // Draw head
            ctx.beginPath();
            ctx.arc(this.x + this.width / 2, this.y - 20, 20, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    canRegisterHit() {
        const now = performance.now();
        return now - this.lastHitTime > this.hitCooldown;
    }

    canPerformAction(action) {
        const now = performance.now();
        return now - this.lastActionTime > this.actionCooldown;
    } 

    performAction(action) {
        if (!this.canPerformAction(action)) return false;

        this.action = action;
        this.actionTime = 500;
        this.lastActionTime = performance.now();

        // Play sound effects for punches
        switch(action) {
            case 'left punch':
            case 'right punch':
                soundManager.playSound('punch');
                break;
        }

        return true
    }

    takeDamage(amount) {
        if (!this.canRegisterHit()) return false;
        this.action = 'hit';
        this.actionTime = 300;
        this.health -= amount;
        this.lastHitTime = performance.now();

        // Play hit sound
        soundManager.playSound('hit');

        return true;
    }

    updatePose(pose) {
        // Ignore pose updates during countdown
        if (window.gameManager && window.gameManager.countdownActive) return false;

        const now = performance.now();

        if (pose === 'block' || pose === 'dodge' || now - this.lastPoseTime > this.poseChangeCooldown) {
            this.currentPose = pose;
            this.lastPoseTime = now;
            this.performAction(pose);
            return true;
        }

        return false;
    }
}