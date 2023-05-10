class Game {
  constructor() {
    this.fx = new Fx();
    this.particleDeployer = new ParticleDeployer();
    this.player = new Player(this.particleDeployer);
    this.asteroids = new AsteroidDeployer(this.player, this.particleDeployer);
    this.items = new ItemDeployer(this.player);
    // this.baddies = new BaddieDeployer(this.player);

    // this.score = new Score();
  }

  init() {
    // console.log("init");
    this.fx.init();
    this.player.init();
    this.particleDeployer.init();
    this.asteroids.init(8);

    this.items.init();
    // this.baddies.init();
    // this.score.init();
  }

  resize() {
    // console.log("resize");
  }

  update() {
    // console.log("update");
    this.player.update();
    this.asteroids.update();
    this.items.update();
    // this.baddies.update();
    // this.score.update();
    this.particleDeployer.update();
  }

  render() {
    // console.log("render");
    // display background & player
    this.fx.fillCanvas("#000");
    this.player.render();
    this.asteroids.render();
    this.items.render();
    // this.baddies.render();
    // this.score.render();
    this.particleDeployer.render();
  }
}
