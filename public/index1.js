const canvas1 = document.getElementById("gamecanvas1");
const c = canvas1.getContext("2d");

canvas1.width = 1024;
canvas1.height = 576;

c.fillRect(0, 0, canvas1.width, canvas1.height);

const gravity = 0.7;

const background = new Sprite({
    position: {
        x: 0,
        y: 0,
    },
    imageSrc: "/img/background.png",
});

const shop = new Sprite({
    position: {
        x: 600,
        y: 128,
    },
    imageSrc: "/img/shop.png",
    scale: 2.75,
    maxFrames: 6,
});

const player = new Fighter({
    position: {
        x: 0,
        y: 0,
    },
    velocity: {
        x: 0,
        y: 10,
    },
    offset: {
        x: 0,
        y: 0,
    },
    imageSrc: "/img/player1/Idle.png",
    maxFrames: 8,
    scale: 2.5,
    offset: {
        x: 215,
        y: 157,
    },
    sprites: {
        idle: {
            imageSrc: "/img/player1/Idle.png",
            maxFrames: 8,
        },
        run: {
            imageSrc: "/img/player1/Run.png",
            maxFrames: 8,
        },
        jump: {
            imageSrc: "/img/player1/Jump.png",
            maxFrames: 2,
        },
        fall: {
            imageSrc: "/img/player1/Fall.png",
            maxFrames: 2,
        },
        attack1: {
            imageSrc: "/img/player1/Attack1.png",
            maxFrames: 6,
        },
        takeHit: {
            imageSrc: "/img/player1/Take Hit.png",
            maxFrames: 4,
        },
        death: {
            imageSrc: "/img/player1/Death.png",
            maxFrames: 6,
        },
    },
    attackBox: {
        offSet: {
            x: 160,
            y: 50,
        },
        width: 100,
        height: 50,
    },
});

const enemy = new Fighter({
    position: {
        x: 970,
        y: 100,
    },
    velocity: {
        x: 0,
        y: 10,
    },
    offset: {
        x: -50,
        y: 0,
    },
    imageSrc: "/img/player2/Idle.png",
    maxFrames: 4,
    scale: 2.5,
    offset: {
        x: 215,
        y: 167,
    },
    sprites: {
        idle: {
            imageSrc: "/img/player2/Idle.png",
            maxFrames: 4,
        },
        run: {
            imageSrc: "/img/player2/Run.png",
            maxFrames: 8,
        },
        jump: {
            imageSrc: "/img/player2/Jump.png",
            maxFrames: 2,
        },
        fall: {
            imageSrc: "/img/player2/Fall.png",
            maxFrames: 2,
        },
        attack1: {
            imageSrc: "/img/player2/Attack1.png",
            maxFrames: 4,
        },
        takeHit: {
            imageSrc: "/img/player2/Take hit.png",
            maxFrames: 3,
        },
        death: {
            imageSrc: "/img/player2/Death.png",
            maxFrames: 7,
        },
    },
    attackBox: {
        offSet: {
            x: -170,
            y: 50,
        },
        width: 170,
        height: 50,
    },
});

const keys = {
    a: {
        pressed: false,
    },
    d: {
        pressed: false,
    },
    ArrowRight: {
        pressed: false,
    },
    ArrowLeft: {
        pressed: false,
    },
};

decreaseTimer();

function animate() {
    window.requestAnimationFrame(animate);
    c.fillStyle = "black";
    c.fillRect(0, 0, canvas1.width, canvas1.height);

    background.update();
    shop.update();

    c.fillStyle = "rgba(255,255,255,0.15)";
    c.fillRect(0, 0, canvas1.width, canvas1.height);

    player.update();
    enemy.update();

    player.velocity.x = 0;
    enemy.velocity.x = 0;

    //player moviment
    if (keys.a.pressed && player.lastKey === "a") {
        player.velocity.x = -5;
        player.switchSprite("run");
    } else if (keys.d.pressed && player.lastKey === "d") {
        player.velocity.x = 5;
        player.switchSprite("run");
    } else {
        player.switchSprite("idle");
    }

    //player jumping
    if (player.velocity.y < 0) {
        player.switchSprite("jump");
    } else if (player.velocity.y > 0) {
        player.switchSprite("fall");
    }

    //enemy moviment
    if (keys.ArrowLeft.pressed && enemy.lastKey === "ArrowLeft") {
        enemy.velocity.x = -5;
        enemy.switchSprite("run");
    } else if (keys.ArrowRight.pressed && enemy.lastKey === "ArrowRight") {
        enemy.velocity.x = 5;
        enemy.switchSprite("run");
    } else {
        enemy.switchSprite("idle");
    }

    //enemy jumping
    if (enemy.velocity.y < 0) {
        enemy.switchSprite("jump");
    } else if (enemy.velocity.y > 0) {
        enemy.switchSprite("fall");
    }

    //detect for collision & enemy gets hit
    if (
        rectangularCollision({ rectangle1: player, rectangle2: enemy }) &&
        player.isAttacking &&
        player.currentFrame === 4
    ) {
        enemy.takeHit();
        player.isAttacking = false;

        document.querySelector("#enemyHealth").style.width = enemy.health + "%";
    }

    //if player misses
    if (player.isAttacking && player.currentFrame === 4) {
        player.isAttacking = false;
    }

    if (
        rectangularCollision({ rectangle1: enemy, rectangle2: player }) &&
        enemy.isAttacking &&
        player.currentFrame === 2
    ) {
        player.takeHit();
        enemy.isAttacking = false;
        document.querySelector("#playerHealth").style.width =
            player.health + "%";
    }

    //if enemy misses
    if (enemy.isAttacking && enemy.currentFrame === 2) {
        enemy.isAttacking = false;
    }

    //end game based on health
    if (enemy.health <= 0 || player.health <= 0) {
        determineWinner({ player, enemy, timerID });
    }
}

animate();

window.addEventListener("keydown", (event) => {
    if (!player.dead) {
        switch (event.key) {
            case "d":
                keys.d.pressed = true;
                player.lastKey = "d";
                break;
            case "a":
                keys.a.pressed = true;
                player.lastKey = "a";
                break;
            case "w":
                player.velocity.y = -15;
                break;
            case " ":
                player.attack();
                break;
        }
    }

    if (!enemy.dead) {
        switch (event.key) {
            case "ArrowRight":
                keys.ArrowRight.pressed = true;
                enemy.lastKey = "ArrowRight";
                break;
            case "ArrowLeft":
                keys.ArrowLeft.pressed = true;
                enemy.lastKey = "ArrowLeft";
                break;
            case "ArrowUp":
                enemy.velocity.y = -15;
                break;
            case "ArrowDown":
                enemy.attack();
                break;
        }
    }
});

window.addEventListener("keyup", (event) => {
    switch (event.key) {
        case "d":
            keys.d.pressed = false;
            break;
        case "a":
            keys.a.pressed = false;
            break;
    }

    //enemy keys
    switch (event.key) {
        case "ArrowRight":
            keys.ArrowRight.pressed = false;
            break;
        case "ArrowLeft":
            keys.ArrowLeft.pressed = false;
            break;
    }
});
