class ParticleDeployer {
  constructor() {
    this.collection = [];
    this.fx = new Fx();
  }

  init() {
    // console.log("init");
    this.collection = [];
    this.fx.init();
  }

  update() {
    this.collection.forEach((a) => {
      a.update();
      if (a.active == false) {
        this.collection.splice(this.collection.indexOf(a), 1);
      }
    });
  }

  render() {
    this.collection.forEach((a) => {
      a.render();
    });
  }

  spawn(tot, owner) {
    for (let i = 0; i < tot; i++) {
      let particle = new Particle(owner);
      particle.init();
      this.collection.push(particle);
      particle.activate();
    }
  }
}

class Particle {
  constructor(owner) {
    this.owner = owner;
    this.fx = new Fx();
    this.img = new Image();
    this.x = 0;
    this.y = 0;
    this.size = 3;
    this.angle = 0;
    this.speed = 0;
    this.active = false;
    this.life = 0;
    this.lifeMax = 0;
    this.color = "#14f01b";
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
      this.fx.drawCircle(this.x, this.y, this.size, this.color);
    }
  }

  activate() {
    this.angle = Math.random() * Math.PI * 2.0;
    this.speed = Math.random() * 15;
    this.alive = this.lifeSpan;
    this.x = this.owner.x + this.owner.img.width / 2;
    this.y = this.owner.y + this.owner.img.height / 2;
    this.active = true;
  }
}
