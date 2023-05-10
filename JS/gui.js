class Gui {
  constructor(game) {
    this.cnv = null;
    this.ctx = null;
    this.resources = null;
    this.resourcesToLoad = 0;
    this.gameLoop = new GameLoop(game);
  }

  //Canvas and display methods

  resize() {
    if (this.cnv) {
      this.cnv.width = window.innerWidth;
      this.cnv.height = window.innerHeight;
    }
  }

  prepareCanvas() {
    this.cnv = document.getElementById("canvas");
    this.ctx = this.cnv.getContext("2d");
    document.body.style.margin = 0;
    document.body.style.padding = 0;
    this.resize();
  }

  toggleScreen(id, toggle) {
    let screen = document.getElementById(id);
    if (toggle) {
      screen.style.display = "block";
    } else {
      screen.style.display = "none";
    }
  }

  closeScreens() {
    let elems = document.querySelectorAll(".screen");
    [...elems].forEach((e) => {
      e.style.display = "none";
    });
  }

  showScreen(id) {
    this.closeScreens();
    this.toggleScreen(id, true);
  }

  //Resource methods

  launchIfReady() {
    this.resourcesToLoad--;
    if (this.resourcesToLoad == 0) {
      this.prepareCanvas();
      this.showScreen("screen-start");
    }
  }

  //Asset loading triggers launch method

  beginImgLoad(img, file) {
    img.onload = () => this.launchIfReady();
    img.src = file;
  }

  beginAudioLoad(audio, file) {
    audio.src = file;
    audio.addEventListener("canplay", () => this.launchIfReady());
  }

  beginLoad(resources) {
    if (!resources || resources.length == 0) {
      console.log("here");
      this.prepareCanvas();
      this.showScreen("screen-start");
      return;
    } else if (resources) {
      this.resources = resources;
      this.resourcesToLoad = this.resources.length;
      for (let i = 0; i < this.resources.length; i++) {
        let r = this.resources[i];
        if (r.var != undefined) {
          if (this.resources[i].var instanceof Image) {
            this.beginImgLoad(this.resources[i].var, this.resources[i].file);
          }
          if (this.resources[i].var instanceof Audio) {
            this.beginAudioLoad(this.resources[i].var, this.resources[i].file);
          }
        }
      }
    }
  }

  getResource(id) {
    return this.resources.filter((r) => r.id === id)[0].var;
  }

  getResources() {
    return this.resources;
  }

  startGame() {
    this.prepareCanvas();
    this.showScreen("canvas");
    this.gameLoop.start();
  }

  stopGame() {
    this.showScreen("screen-end");
    this.gameLoop.stop();
  }

  // draw() {
  //   this.ctx.fillStyle = "#000000";
  //   this.ctx.fillRect(0, 0, this.cnv.width, this.cnv.height);
  //   this.ctx.fillStyle = "#FFFFFF";
  //   this.ctx.font = "20px Arial";
  //   this.ctx.fillText("Loading...", 10, 30);
  // }

  // launch() {
  //   this.launchIfReady();
  // }
}
