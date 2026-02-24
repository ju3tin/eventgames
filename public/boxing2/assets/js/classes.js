/**
 * after game console is initialized
 * we want charac to drop from the top
 * gravity adds speed to var velocity
 */

/**
 * Create a class to develope game characters
 * we'll use classes since we'll approach project from OOP perspertive
 */
class Sprite {
  //make constructor
  constructor({
    position,
    imageSrc,
    scale = 1,
    framesMax = 1,
    offset = { x: 0, y: 0 },
  }) {
    this.position = position; //set charac position(x,y);
    this.height = 150;
    this.width = 50;
    this.image = new Image(); //native api to create img html element
    this.image.src = imageSrc; //fill in source
    this.scale = scale; //increase image size
    (this.framesMax = framesMax), //we use this to loop through img frames
      (this.currentFrame = 0); //
    this.framesElapsed = 0; //how many frames we have elapsed throughout the whole animation
    this.framesHold = 6; //how many frames we hv to go through b4 we change currentFrame
    this.offset = offset;
  }

  draw() {
    c.drawImage(
      /**
       * set image frames before positions
       */
      this.image,
      this.currentFrame * (this.image.width / this.framesMax), //x ps of img crop mark
      0, //y ps of img crop mark
      this.image.width / this.framesMax, //crop width
      this.image.height, //crop height
      this.position.x - this.offset.x,
      this.position.y - this.offset.y,
      (this.image.width / this.framesMax) * this.scale,
      this.image.height * this.scale
    ); //canvas met to draw Img
  }

  animateFrames() {
    this.framesElapsed++; //framesElapsed will increase by 1 whenever update func in called
    if (this.framesElapsed % this.framesHold === 0) {
      /**
       * if framesElapsed div by framesHold = 0
       * then increase currentFrame
       * we use this to regulate speed of animation
       */
      if (this.currentFrame < this.framesMax - 1) {
        this.currentFrame++;
      } else {
        this.currentFrame = 0;
      }
    }
  }

  update() {
    this.draw();
    //this.framesElapsed++; //framesElapsed will increase by 1 whenever update func in called
    this.animateFrames();
  }
}
class Fighter extends Sprite {
  //make constructor
  constructor({
    position,
    velocity,
    color = "blue",
    //offset,
    imageSrc,
    scale = 1,
    framesMax = 1,
    offset = { x: 0, y: 0 }, //this is coming from sprite class
    sprites,
    attackBox = { offset: {}, width: undefined, height: undefined },
  }) {
    super({
      position,
      imageSrc,
      scale,
      framesMax,
      offset,
    });
    //this.position = position; //set charac position(x,y);
    this.velocity = velocity; //speed
    this.height = 150;
    this.width = 50;
    this.lastKey;
    this.color = color;
    this.sprites = sprites;
    /**
     * Essentially we'll use the instance of sprites to loop through the sprites imgs we ve
     * sprite in sprites will get the keys(run,idle,jump..) in sprites
     * this will allow us to switch between sprite imgs
     */
    for (const sprite in this.sprites) {
      //we use the create a new property img in sprites
      sprites[sprite].image = new Image();
      //then we assign the new created property to the imageSrc we already hv available
      sprites[sprite].image.src = sprites[sprite].imageSrc;
      console.log(sprites);
    }
    (this.attackBox = {
      position: {
        x: this.position.x,
        y: this.position.y,
      },
      offset: attackBox.offset,
      width: attackBox.width,
      height: attackBox.height,
    }),
      this.isAttacking,
      (this.health = 100);
    this.currentFrame = 0; //
    this.framesElapsed = 0; //how many frames we have elapsed throughout the whole animation
    this.framesHold = 4; //how many frames we hv to go through b4 we change currentFrame
    this.death = false;
    this.stopMovement
  }

  /*draw() {
      c.fillStyle = this.color; //
      c.fillRect(this.position.x, this.position.y, this.width, this.height);
  
      //attackBox
      if (this.isAttacking) {
        c.fillStyle = "red";
        c.fillRect(
          this.attackBox.position.x,
          this.attackBox.position.y,
          this.attackBox.width,
          this.attackBox.height
        );
      }
    }*/

  update() {
    this.draw();
    if (!this.death) {
      this.animateFrames();
    }
    //below is where we draw attack box is accurately gauge attacks
    //c.fillRect(this.attackBox.position.x, this.attackBox.position.y, this.attackBox.width,this.attackBox.height)
    this.attackBox.position.x = this.position.x + this.attackBox.offset.x;
    this.attackBox.position.y = this.position.y + this.attackBox.offset.y;
    this.position.x += this.velocity.x; //how a charac moves on x axis
    this.position.y += this.velocity.y; //how a charac moves on y axis
    if (
      this.position.y + this.height + this.velocity.y >=
      canvas.height - 190
    ) {
      this.velocity.y = 0;
      this.position.y = 236.59999999999997;
      /**
       * this.position.y + this.height will give us height of charac
       * if we add this.velocity.y we charac height and current position
       * we prevent charac from overlooking the scope(height in this instance) of the game board
       */
    } else {
      this.velocity.y += gravity;
    }
    ///console.log(this.position.y)
  }

  attack() {
    this.switchSprites("attack1");
    this.isAttacking = true;
    /*setTimeout(() => {
      this.isAttacking = false;
    }, 100);*/
  }

  takeHit() {
    if (this.health <= 0) {
      this.switchSprites("deathSprite");
      this.stopMovement = true
    } else {
      this.switchSprites("takeHit");
      this.stopMovement = false
    }
  }

  switchSprites(sprite) {
    //death override
    if (this.image === this.sprites.deathSprite.image) {
      if (this.currentFrame === this.sprites.deathSprite.framesMax - 1) {
        this.death = true;
        //console.log(this.death)
      }
      return;
    }
    //override
    if (
      this.image == this.sprites.attack1.image &&
      this.currentFrame < this.sprites.attack1.framesMax - 1
    )
      return;

    //takehit override
    if (
      this.image == this.sprites.takeHit.image &&
      this.currentFrame < this.sprites.takeHit.framesMax - 1
    )
      return;

    switch (sprite) {
      case "idle":
        if (this.image !== this.sprites.idle.image) {
          this.image = this.sprites.idle.image;
          this.framesMax = this.sprites.idle.framesMax;
          this.currentFrame = 0;
        }
        break;
      case "run":
        if (this.image !== this.sprites.run.image) {
          this.image = this.sprites.run.image;
          this.framesMax = this.sprites.run.framesMax;
          this.currentFrame = 0;
        }
        break;
      case "jump":
        if (this.image !== this.sprites.jump.image) {
          this.image = this.sprites.jump.image;
          this.framesMax = this.sprites.jump.framesMax;
          this.currentFrame = 0;
        }
        break;
      case "fall":
        if (this.image !== this.sprites.fall.image) {
          this.image = this.sprites.fall.image;
          this.framesMax = this.sprites.fall.framesMax;
          this.currentFrame = 0;
        }
        break;
      case "attack1":
        if (this.image !== this.sprites.attack1.image) {
          this.image = this.sprites.attack1.image;
          this.framesMax = this.sprites.attack1.framesMax;
          this.currentFrame = 0;
        }
        break;
      case "takeHit":
        if (this.image !== this.sprites.takeHit.image) {
          this.image = this.sprites.takeHit.image;
          this.framesMax = this.sprites.takeHit.framesMax;
          this.currentFrame = 0;
        }
        break;
      case "deathSprite":
        if (this.image !== this.sprites.deathSprite.image) {
          this.image = this.sprites.deathSprite.image;
          this.framesMax = this.sprites.deathSprite.framesMax;
          this.currentFrame = 0;
        }
        break;
    }
  }
}
