class Opponent {
    constructor(x, y, spriteManager, character) {
        this.x = x;
        this.y = y;
        this.width = 150;
        this.height = 200;
        this.action = 'idle';
        this.actionTime = 0;
        this.spriteManager = spriteManager;
        this.character = character;
        this.facing = 'left';
        this.currentAnimation = null;
        this.nextActionTime = 0;
        this.difficulty = 'normal'; 
        this.dodgeCooldown = 0;
        this.lastHitTime = 0;
        this.hitCooldown = 500;

        this.lastActionTime = 0;
        this.actionCooldown = 400;
    }

    update(deltaTime) {
        // Pause updates during countdown
        if (window.gameManager && window.gameManager.countdownActive) return;

        if (this.actionTime > 0){
            this.actionTime -= deltaTime;
            if (this.actionTime <= 0) {
                this.action = 'idle';
            }
        }

        if (this.dodgeCooldown > 0) {
            this.dodgeCooldown -= deltaTime;
        }

        // AI decision making
        if (Date.now() > this.nextActionTime) {
            this.decideNextAction();
        }

        // Get the current animation based on action
        this.currentAnimation = this.spriteManager.getAnimation(this.character, this.getActionName());

        // Update animation frames
        if (this.currentAnimation) {
            this.spriteManager.updateAnimation(this.currentAnimation, performance.now());
        }
    }

    getActionName() {
        switch(this.action) {
            case 'idle': return 'idle';
            case 'left punch': return 'leftJab';
            case 'right punch': return 'rightJab';
            case 'block': return 'block';
            case 'dodge': return 'dodge';
            case 'hit': return 'hit';
            case 'out': return 'out';
            default: return 'idle';
        }
    }

    // AI logic to decide next action
    decideNextAction() {
        // Adjust decision frequency based on difficulty
        const decisionFrequency = {
            'easy': 2000,
            'normal': 1500,
            'hard': 1000
        };

        const actions = ['idle', 'left punch', 'right punch', 'block', 'dodge'];

        // Weight actions based on difficulty
        const weights = {
            'easy': [0.3, 0.2, 0.2, 0.2, 0.1],
            'normal': [0.25, 0.25, 0.25, 0.15, 0.1],
            'hard': [0.2, 0.3, 0.3, 0.1, 0.1]
        };

        // Select action based on weights
        const randomValue = Math.random();
        let cumulativeWeight = 0;
        let selectedAction = 'idle';

        for (let i = 0; i < actions.length; i++) {
            cumulativeWeight += weights[this.difficulty][i];
            if (randomValue < cumulativeWeight) {
                selectedAction = actions[i];
                break;
            }
        }

        // Special logic for dodge
        if (selectedAction === 'dodge' && this.dodgeCooldown > 0) {
            const alternativeActions = ['idle', 'left punch', 'right punch', 'block'];
            const alternativeWeights = weights[this.difficulty].slice(0, 4);
            const totalWeight = alternativeWeights.reduce((sum, weight) => sum + weight, 0);

            const dodgeRandomValue = Math.random() * totalWeight;
            let dodgeCumulativeWeight = 0;

            for (let i = 0; i < alternativeActions.length; i++) {
                dodgeCumulativeWeight += alternativeWeights[i];
                if (dodgeRandomValue < dodgeCumulativeWeight) {
                    selectedAction = alternativeActions[i];
                    break;
                }
            }
        }

        this.performAction(selectedAction);
        console.log(`Opponent action: ${selectedAction}`);

        if (selectedAction === 'dodge') {
            this.dodgeCooldown = 2000; // 2 seconds cooldown
        }

        this.nextActionTime = Date.now() + decisionFrequency[this.difficulty] + Math.random() * 1000;
    }

    smartDecision(playerAction) {
        if (this.actionTime > 0) return;

        if ((playerAction === 'left punch' || playerAction === 'right punch') && this.dodgeCooldown <= 0 && Math.random() > 0.3) {
            this.action = 'dodge';
            this.actionTime = 500;
            this.dodgeCooldown = 2000;
            this.nextActionTime = Date.now() + 1000;
            return;
        }

        this.decideNextAction();
    }

    draw(ctx) {
        if (!this.currentAnimation) return;

        const frame = this.currentAnimation.frames[this.currentAnimation.currentFrame];

        if (frame) {
            ctx.save();

            // Move to center of opponent
            ctx.translate(this.x + this.width / 2, this.y + this.height / 2);

            // Flip context if facing left
            if (this.facing === 'left') {
                ctx.scale(-1, 1);
            }

            // Draw the sprite frame
            frame.draw(ctx, -this.width / 2, -this.height / 2, this.width, this.height);
            ctx.restore();
        } else {
            // Fallback to colored rectangle if sprite not available
            ctx.fillStyle = '#ff4500'; 
            ctx.fillRect(this.x, this.y, this.width, this.height);

            // Draw head
            ctx.beginPath();
            ctx.arc(this.x + this.width / 2, this.y - 20, 20, 0, Math.PI * 2);
            ctx.fill();
        }
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
    
        return true;
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

    canPerformAction(action) {
        const now = performance.now();
        return now - this.lastActionTime > this.actionCooldown;
    }

    canRegisterHit() {
        const now = performance.now();
        return now - this.lastHitTime > this.hitCooldown;
    }

    setDifficulty(level) {
        this.difficulty = level;
    }

    movePosition(direction, distance) {
        if (direction === 'left') {
            this.x -= distance;
        } else if (direction === 'right') {
            this.x += distance;
        }

        const minX = 400;
        const maxX = 700;

        this.x = Math.max(minX, Math.min(maxX, this.x));
    }
}