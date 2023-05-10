class AsteroidDeployer {
  // Asteroid deployment manager

  constructor(player, particles) {
    this.collection = [];
    this.player = player;
    this.particles = particles;
  }

  init(total) {
    // console.log("init");
    this.collection = [];
    for (let i = 0; i < total; i++) {
      let asteroid = new Asteroid(1);
      asteroid.init();
      this.collection.push(asteroid);
    }
  }

  update() {
    // console.log("update");
    this.collection.forEach((a) => {
      a.update();
      a.checkForCollisionWithBullet(
        this.player.projectileDeployer.collection,
        this.particles,
        this
      );
      a.checkForCollisionWithPlayer(this.player);
    });
  }

  render() {
    // console.log("render");
    this.collection.forEach((a) => {
      a.render();
    });
  }

  spawn(size, tot, owner) {
    for (let i = 0; i < tot; i++) {
      let asteroid = new Asteroid(size);
      asteroid.init();
      asteroid.x = owner.x + owner.img.owner.width / 2;
      asteroid.y = owner.y + owner.img.owner.height / 2;
      this.collection.push(asteroid);
    }
  }
}

class ItemDeployer {
  // Item deployment manager

  constructor(player) {
    this.collection = [];

    this.player = player;
  }

  init(total) {
    // console.log("init");
    this.collection = [];
    for (let i = 0; i < total; i++) {
      let item = new Item();
      item.init();
      this.collection.push(item);
    }
  }

  update() {
    this.collection.forEach((a) => {
      a.update();
      a.checkForCollisionWithPlayer(this.player);
    });
  }

  render() {
    this.collection.forEach((a) => {
      a.render();
    });
  }

  spawn(tot, owner) {
    for (let i = 0; i < tot; i++) {
      let item = new Item(owner);
      item.init();
      this.collection.push(item);
    }
  }
}

// Asteroid object
class Asteroid {
  constructor(size) {
    this.size = size;
    this.fx = new Fx();
    this.img = null;
    this.explosion = null;
    this.x = 0;
    this.y = 0;
    this.angle = 0;
    this.speed = 0;
    this.rotation = 0;
    this.rotationSpeed = 0;
    this.active = false;
    this.item = new ItemDeployer();
  }

  init() {
    this.fx.init();
    this.setImg();
    this.explosion = window.gui.getResource("explosion-audio");
    this.x = Math.random() * this.fx.cnv.width;
    this.y = Math.random() * this.fx.cnv.height;
    this.angle = Math.random() * Math.PI * 2;
    this.speed = Math.random() * 3 + 1;
    this.rotation = 0;
    this.rotationSpeed = Math.random() * (0.04 - -0.04) + -0.04;
    this.active = true;
  }

  // choose asteroid size
  setImg() {
    switch (this.size) {
      case 1:
        this.img = window.gui.getResource("asteroid-img");
        break;
      case 2:
        this.img = window.gui.getResource("asteroid-large");
        break;
      case 3:
        this.img = window.gui.getResource("asteroid-small");
        break;
    }
  }

  // position update
  update() {
    if (this.active) {
      this.x += this.speed * Math.cos(this.angle);
      this.y += this.speed * Math.sin(this.angle);
      this.rotation += this.rotationSpeed;
      this.checkBounds();
    }
  }

  checkBounds() {
    if (this.x < -this.img.width) {
      this.x = this.fx.cnv.width;
    } else if (this.x > this.fx.cnv.width) {
      this.x = -this.img.width;
    }

    if (this.y < -this.img.height) {
      this.y = this.fx.cnv.height;
    } else if (this.y > this.fx.cnv.height) {
      this.y = -this.img.height;
    }
  }

  render() {
    if (this.active) {
      this.fx.rotateAndDraw(this.img, this.x, this.y, this.rotation);
    }
  }

  // collision detection

  hasCollided(obj) {
    if (this.active) {
      let dx = this.x - obj.x;
      let dy = this.y - obj.y;
      let dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < this.img.width / 2 + obj.width / 2) {
        return true;
      }
    }
    return false;
  }

  checkForCollisionWithPlayer(player) {
    let active = player.state == player.alive ? true : false;
    let ent = {
      x: player.x,
      y: player.y,
      img: player.img,
      width: player.img.width,
      height: player.img.height,
      active: active,
    };
    if (this.hasCollided(ent)) {
      // player.kill();
    }
  }

  // bullet & asteroid collision - random chance of dropping powerup item
  checkForCollisionWithBullet(bullet, particles, service) {
    bullet.forEach((b) => {
      if (this.hasCollided(b)) {
        let drop = Math.random() * 10;
        if (drop > 8) {
          service.items.push(this.dropItem());
        }
        this.collision();

        let nxtSize = ++this.size;
        let tot = Math.random() * 4;
        if (nxtSize < 4) {
          service.spawn(nxtSize, tot, this);
        }
        b.active = false;
        particles.emit(bullet.x, bullet.y, 10);
        return true;
      }
    });
    return false;
  }

  // power up item drop
  dropItem() {
    let item = new Item();
    item.init();
    item.x = this.x;
    item.y = this.y;
    item.angle = Math.random() * 360;
    item.speed = Math.random() * 3 + 1;
    item.rotationSpeed = Math.random() * 4 - 2;
    return item;
  }

  // split asteroid
  // split() {
  //   let a1 = new Asteroid(this.size - 1);
  //   let a2 = new Asteroid(this.size - 1);
  //   a1.x = this.x;
  //   a1.y = this.y;
  //   a2.x = this.x;
  //   a2.y = this.y;
  //   a1.angle = Math.random() * 360;
  //   a2.angle = Math.random() * 360;
  //   a1.speed = Math.random() * 3 + 1;
  //   a2.speed = Math.random() * 3 + 1;
  //   a1.rotationSpeed = Math.random() * 4 - 2;
  //   a2.rotationSpeed = Math.random() * 4 - 2;
  //   this.collection.push(a1);
  //   this.collection.push(a2);
  // }

  // explosion sound
  collision() {
    this.active = false;
    this.explosion.pause();
    this.explosion.currentTime = 0;
    this.explosion.play();
  }
}

// Power up item object

class Item {
  constructor(owner) {
    this.fx = new Fx();
    this.img = null;
    this.explosion = null;
    this.x = 0;
    this.y = 0;
    this.angle = 0;
    this.speed = 0;
    this.rotation = 0;
    this.rotationSpeed = 0;
    this.active = false;
  }

  init() {
    this.fx.init();
    this.setImg();

    this.x = Math.random() * this.fx.cnv.width;
    this.y = Math.random() * this.fx.cnv.height;
    this.angle = Math.random() * 360;
    this.speed = Math.random() * 2 + 1;
    this.rotation = 0;
    this.rotationSpeed = Math.random() * 4 - 2;
    this.active = true;
  }

  // display stuff

  setImg() {
    this.img = window.gui.getResource("item-img");
  }

  update() {
    if (this.active) {
      this.x += this.speed * Math.cos((this.angle / 180) * Math.PI);
      this.y += this.speed * Math.sin((this.angle / 180) * Math.PI);
      this.rotation += this.rotationSpeed;
      this.checkBounds();
    }
  }

  checkBounds() {
    if (this.x < -this.img.width) {
      this.x = this.fx.cnv.width;
    } else if (this.x > this.fx.cnv.width) {
      this.x = -this.img.width;
    }

    if (this.y < -this.img.height) {
      this.y = this.fx.cnv.height;
    } else if (this.y > this.fx.cnv.height) {
      this.y = -this.img.height;
    }
  }

  render() {
    if (this.active) {
      this.fx.rotateAndDraw(this.img, this.x, this.y, this.rotation);
    }
  }

  // collision stuff

  checkForCollisionWithPlayer(player) {
    let active = player.state == player.alive ? true : false;
    let ent = {
      x: player.x,
      y: player.y,
      img: player.img,
      width: player.img.width,
      height: player.img.height,
      active: active,
    };
    return this.checkForCollision(ent);
  }

  checkForCollision(ent) {
    if (this.active && ent.active) {
      let dx = this.x - ent.x;
      let dy = this.y - ent.y;
      let dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < this.img.width / 2 + ent.width / 2) {
        this.active = false;
        // this.bonus.play();
        return true;
      }
    }
    return false;
  }
}
