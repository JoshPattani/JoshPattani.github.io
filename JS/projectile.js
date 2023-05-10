class ProjectileDeployer {
  constructor(owner) {
    this.collection = [];
    this.owner = owner;
    this.max = 10;
    this.pointer = 0;
  }

  init() {
    this.pointer = 0;
    this.collection = [];
    for (let i = 0; i < this.max; i++) {
      let p = new Projectile(this.owner);
      p.init();
      this.collection.push(p);
    }
  }

  update() {
    this.collection.forEach((a) => {
      a.update();
    });
  }

  render() {
    this.collection.forEach((a) => {
      a.render();
    });
  }

  fire() {
    this.collection[this.pointer].fire();
    this.pointer++;
    if (this.pointer >= this.max) {
      this.pointer = 0;
    }
  }
}

class Projectile {
  constructor(owner) {
    this.owner = owner;
    this.fx = new Fx();
    this.angle = this.owner.angle;
    this.speed = 15;
    this.x = 0;
    this.y = 0;
    this.size = 7;
    this.lifeSpan = 100;
    this.active = false;
    this.life = this.lifeSpan;
  }

  init() {
    this.active = false;
    this.fx.init();
  }

  update() {
    if (this.active) {
      this.x += Math.cos(this.angle) * this.speed;
      this.y += Math.sin(this.angle) * this.speed;
      this.life--;
      if (this.life <= 0) {
        this.active = false;
      }
    }
  }

  render() {
    if (this.active) {
      this.fx.drawCircle(this.x, this.y, this.size, "#0ff214");
    }
  }

  fire() {
    this.active = true;
    this.life = this.lifeSpan;
    this.angle = this.owner.angle;
    this.x = this.owner.x + this.owner.img.width / 2;
    this.y = this.owner.y + this.owner.img.height / 2;
    // this.thrust = {
    //   x: Math.cos(this.angle) * this.speed,
    //   y: Math.sin(this.angle) * this.speed,
    // };
  }
}
