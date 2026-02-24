const canvas = document.getElementById("gameCanvas");
const c = canvas.getContext("2d");

//set game canvas width and height
canvas.width = 1024;
canvas.height = 576;

c.fillRect(0, 0, canvas.width, canvas.height);

const gravity = 0.7;

const background = new Sprite({
  position: {
    x: 0,
    y: 0,
  },
  imageSrc: "./assets/sprite/background.png",
});

const shop = new Sprite({
  position: {
    x: 730,
    y: 230,
  },
  imageSrc: "./assets/sprite/shop.png",
  scale: 2,
  framesMax: 6,
});

const player = new Fighter({
  position: {
    x: 0,
    y: 0,
  },
  velocity: {
    x: 0,
    y: 0,
  },
  imageSrc: "./assets/sprite/samuraiMack/Idle.png",
  framesMax: 8,
  scale: 2,
  offset: {
    x: 165,
    y: 0,
  },
  sprites: {
    idle: {
      imageSrc: "./assets/sprite/samuraiMack/Idle.png",
      framesMax: 8,
    },
    run: {
      imageSrc: "./assets/sprite/samuraiMack/Run.png",
      framesMax: 8,
    },
    jump: {
      imageSrc: "./assets/sprite/samuraiMack/Jump.png",
      framesMax: 2,
    },
    fall: {
      imageSrc: "./assets/sprite/samuraiMack/Fall.png",
      framesMax: 2,
    },
    attack1: {
      imageSrc: "./assets/sprite/samuraiMack/Attack1.png",
      framesMax: 6,
    },
    takeHit: {
      imageSrc: "./assets/sprite/samuraiMack/Take Hit.png",
      framesMax: 4,
    },
    deathSprite: {
      imageSrc: "./assets/sprite/samuraiMack/Death.png",
      framesMax: 6,
    },
  },
  attackBox: {
    offset: {
      x: 60, //-40,
      y: 160,
    },
    width: 120,
    height: 40,
  },
}); //call a new instance of class to create player

const enemy = new Fighter({
  position: {
    x: 500,
    y: 0,
  },
  velocity: {
    x: 0,
    y: 0,
  },
  imageSrc: "./assets/sprite/kenji/kenji/Idle.png",
  framesMax: 4,
  scale: 2,
  offset: {
    x: 160,
    y: 14,
  },
  sprites: {
    idle: {
      imageSrc: "./assets/sprite/kenji/kenji/Idle.png",
      framesMax: 4,
    },
    run: {
      imageSrc: "./assets/sprite/kenji/kenji/Run.png",
      framesMax: 8,
    },
    jump: {
      imageSrc: "./assets/sprite/kenji/kenji/Jump.png",
      framesMax: 2,
    },
    fall: {
      imageSrc: "./assets/sprite/kenji/kenji/Fall.png",
      framesMax: 2,
    },
    attack1: {
      imageSrc: "./assets/sprite/kenji/kenji/Attack1.png",
      framesMax: 4,
    },
    takeHit: {
      imageSrc: "./assets/sprite/kenji/kenji/Take hit.png",
      framesMax: 3,
    },
    deathSprite: {
      imageSrc: "./assets/sprite/kenji/kenji/Death.png",
      framesMax: 7,
    },
  },
  attackBox: {
    offset: {
      x: -100, //80,
      y: 160,
    },
    width: 120,
    height: 40,
  },
}); //call a new instance of class to create enemy

//player.draw(); //draw player

//enemy.draw(); //draw a enemy
const keys = {
  ArrowLeft: {
    pressed: false,
  },
  ArrowRight: {
    pressed: false,
  },
  ArrowUp: {
    pressed: false,
  },
  w: {
    pressed: false,
  },
  d: {
    pressed: false,
  },
  a: {
    pressed: false,
  },
  s: {
    pressed: false,
  },
};

gameTimer();

function animateCharacters() {
  window.requestAnimationFrame(animateCharacters); //we loop
  c.fillStyle = "black";
  c.fillRect(0, 0, canvas.width, canvas.height); //we call this to prevent charac from drawing a line
  background.update();
  shop.update();
  player.update();
  enemy.update();
  player.velocity.x = 0;
  enemy.velocity.x = 0;
  //player.image = player.sprites.idle.image

  if (keys.ArrowLeft.pressed && player.lastKey == "ArrowLeft") {
    player.velocity.x = -4;
    //player.image = player.sprites.run.image
    player.switchSprites("run");
  } else if (keys.ArrowRight.pressed && player.lastKey == "ArrowRight") {
    player.velocity.x = 4;
    //player.image = player.sprites.run.image
    player.switchSprites("run");
  } else if (keys.ArrowUp.pressed && player.lastKey == "ArrowUp") {
    player.velocity.y = -15;
    //player.image = player.sprites.jump.image
    //player.framesMax = player.sprites.jump.framesMax
    player.switchSprites("jump");
  } else if (player.velocity.y > 0) {
    player.switchSprites("fall");
  } else {
    player.switchSprites("idle");
  }

  //enemy
  if (keys.a.pressed && enemy.lastKey == "a") {
    enemy.velocity.x = -4;
    enemy.switchSprites("run");
  } else if (keys.d.pressed && enemy.lastKey == "d") {
    enemy.velocity.x = 4;
    enemy.switchSprites("run");
  } else if (keys.w.pressed && enemy.lastKey == "w") {
    enemy.velocity.y = -15;
    enemy.switchSprites("jump");
  } else if (enemy.velocity.y > 0) {
    enemy.switchSprites("fall");
  } else {
    enemy.switchSprites("idle");
  }

  //player attack collision
  if (
    /*player.attackBox.position.x + player.attackBox.width >= enemy.position.x &&
    player.attackBox.position.x <= enemy.position.x + enemy.width &&
    player.attackBox.position.y + player.attackBox.height >= enemy.position.y &&
    player.attackBox.position.y <= enemy.position.y + enemy.height*/
    playerCollision({
      rec1: player,
      rec2: enemy,
    }) &&
    player.isAttacking &&
    player.currentFrame === 4
  ) {
    player.isAttacking = false;
    enemy.health -= 10;
    enemy.takeHit();
    //document.getElementById("enemyHealth").style.width = enemy.health + "%";
    gsap.to('#enemyHealth',{
      width: enemy.health + "%"
    })
    console.log("hit");
  }

  //if player misses
  if (player.isAttacking && player.currentFrame == 4) {
    player.isAttacking = false;
  }

  if (
    /*player.attackBox.position.x + player.attackBox.width >= enemy.position.x &&
    player.attackBox.position.x <= enemy.position.x + enemy.width &&
    player.attackBox.position.y + player.attackBox.height >= enemy.position.y &&
    player.attackBox.position.y <= enemy.position.y + enemy.height*/
    playerCollision({
      rec1: enemy,
      rec2: player,
    }) &&
    enemy.isAttacking &&
    enemy.currentFrame == 2
  ) {
    player.health -= 10;
    player.takeHit();
    //document.getElementById("playerHealth").style.width = player.health + "%";
    gsap.to('#playerHealth',{
      width: player.health + "%"
    })
    enemy.isAttacking = false;
    console.log(player.health);
  }

  //if player misses
  if (enemy.isAttacking && enemy.currentFrame == 2) {
    enemy.isAttacking = false;
  }

  if (enemy.health <= 0 || player.health <= 0) {
    getWinner({ player, enemy, timerSet });
  }
}



//what happens when key is active
window.addEventListener("keydown", (event) => {
  const target = event.key;
  //console.log(target);
  if(!player.stopMovement) {
    switch (target) {
      case "ArrowRight":
        keys.ArrowRight.pressed = true;
        player.lastKey = "ArrowRight";
        break;
      case "ArrowLeft":
        keys.ArrowLeft.pressed = true;
        player.lastKey = "ArrowLeft";
        break;
      case "ArrowUp":
        keys.ArrowUp.pressed = true;
        player.lastKey = "ArrowUp";
        break;
      case " ":
        player.attack();
        break;
    }
  }

  if (!enemy.stopMovement) {
    switch (target) {
      //enemy
      case "d":
        keys.d.pressed = true;
        enemy.lastKey = "d";
        break;
      case "a":
        keys.a.pressed = true;
        enemy.lastKey = "a";
        break;
      case "w":
        keys.w.pressed = true;
        enemy.lastKey = "w";
        break;
      case "s":
        enemy.attack();
        enemy.lastKey = "s";
        break;
    }
  }
});

//what happens when key isn't active
window.addEventListener("keyup", (event) => {
  const target = event.key;
  switch (target) {
    case "ArrowRight":
      keys.ArrowRight.pressed = false;
      break;
    case "ArrowLeft":
      keys.ArrowLeft.pressed = false;
      break;
    case "ArrowUp":
      keys.ArrowUp.pressed = false;
      break;
    case "d":
      keys.d.pressed = false;
      break;
    case "a":
      keys.a.pressed = false;
      break;
    case "w":
      keys.w.pressed = false;
      break;
  }
});

animateCharacters();
