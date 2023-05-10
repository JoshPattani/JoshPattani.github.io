class Player {
  // Player control class

  constructor(particles) {
    this.fx = new Fx();
    this.eventHandler = new EventHandler();
    this.projectileDeployer = new ProjectileDeployer(this);
    this.particles = particles;

    this.img = null;
    this.pewPew = null;
    this.explosion = null;

    // physics vars
    this.rotationSpeed = 5;
    this.thrustPower = 5;
    this.friction = 0.89;

    // math vars
    this.x = 0;
    this.y = 0;
    this.angle = 0;
    this.thrust = { x: 0, y: 0 };
    this.rotation = 0;

    this.reload = 10;
    this.frames = 0;

    this.speed = 0;
    this.maxSpeed = 10;

    // game vars
    this.alive = 1;
    this.dying = 2;
    this.dead = 3;
    this.state = this.alive;
    this.dyingTime = 240;

    this.score = 0;
    this.shots = 0;
    this.hits = 0;

    this.lives = 3;
    this.livesMax = 3;

    // shield attr

    // this.shield = 100;
    // this.shieldMax = 100;
    // this.shieldRecharge = 0;
  }

  init() {
    console.log("player-init");
    this.fx.init();
    this.projectileDeployer.init();
    this.eventHandler.init();
    this.img = window.gui.getResource("player-img");
    this.pewPew = window.gui.getResource("laser-audio");
    this.explosion = window.gui.getResource("explosion-audio");

    this.x = this.fx.cnv.width / 2 - this.img.width / 2;
    this.y = this.fx.cnv.height / 2 - this.img.height / 2;
    this.thrust = { x: 0, y: 0 };
    this.angle = (-90 / 180) * Math.PI;
    this.rotation = 0;
    this.reload = 10;
    this.frames = 0;

    this.state = this.alive;
    this.dyingTime = 240;
  }

  update() {
    // stop game
    if (this.state == this.dead) {
      window.gui.stopGame();
      return;
    }
    // dying state
    if (this.state == this.dying) {
      this.dyingTime--;
      if (this.dyingTime < 0) {
        this.state = this.dead;
        this.lives--;
        if (this.lives < 0) {
          this.lives = 0;
        }
      }
      return;
    }

    // alive state

    this.frames++;
    this.rotation = 0;
    this.thrust.x = this.thrust.x * this.friction;
    this.thrust.y = this.thrust.y * this.friction; //add friction

    // screen wrap
    if (this.x > this.fx.cnv.width) {
      this.x = 0 - this.img.width / 2;
    }
    if (this.x + this.img.width < 0) {
      this.x = this.fx.cnv.width;
    }
    if (this.y > this.fx.cnv.height) {
      this.y = 0;
    }
    if (this.y + this.img.height < 0) {
      this.y = this.fx.cnv.height;
    }

    // key press movements
    if (this.eventHandler.isDown("ArrowLeft")) {
      this.rotation = -this.rotationSpeed * (Math.PI / 180);
    }
    if (this.eventHandler.isDown("ArrowRight")) {
      this.rotation = this.rotationSpeed * (Math.PI / 180);
    }
    if (this.eventHandler.isDown("ArrowUp")) {
      this.thrust.x = Math.cos(this.angle) * this.thrustPower;
      this.thrust.y = Math.sin(this.angle) * this.thrustPower;
    }

    // shoot
    if (this.eventHandler.isDown(" ")) {
      if (this.frames > this.reload) {
        this.frames = 0;
        this.pewPew.pause();
        this.pewPew.currentTime = 0;
        this.pewPew.play();
        this.projectileDeployer.fire();
      }
    }

    // update position
    this.angle += this.rotation;
    this.x += this.thrust.x;
    this.y += this.thrust.y;

    // update projectileDeployer
    this.projectileDeployer.update();
  }

  // Shield function & recharge - function not added

  // this.frames %= 60;
  // this.reload--;
  // if (this.reload < 0) {
  //   this.reload = 0;
  // }
  // if (this.shield < this.shieldMax) {
  //   this.shieldRecharge--;
  //   if (this.shieldRecharge < 0) {
  //     this.shieldRecharge = 0;
  //   }
  //   if (this.shieldRecharge == 0) {
  //     this.shield++;
  //   }
  // }
  // else {
  //   this.dyingTime--;
  //   if (this.dyingTime < 0) {
  //     this.state = this.alive;
  //     this.lives--;
  //     if (this.lives < 0) {
  //       this.lives = 0;
  //     }
  //     this.shield = this.shieldMax;
  //     this.shieldRecharge = 0;
  //     this.dyingTime = 240;
  //   }
  // }
  // }

  render() {
    this.projectileDeployer.render();
    if (this.state == this.alive) {
      this.fx.rotateAndDraw(this.img, this.x, this.y, this.angle);
    }
  }

  kill() {
    this.state = this.dead;
    this.particles.spawn(16, this);

    // this.explosion.pause();
    // this.explosion.currentTime = 0;
    // this.explosion.play();
  }
}
