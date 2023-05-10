let game = new Game();
window.gui = new Gui(game);

window.onload = function () {
  // console.log("loading...");
  // gui.prepare();
  // gui.loadResources();
  stopTimer();
  window.gui.beginLoad([
    {
      id: "player-img",
      var: (playerImg = document.createElement("img")),
      file: "../assets/img/js/ship.png",
    },
    {
      id: "asteroid-img",
      var: (playerImg = document.createElement("img")),
      file: "../assets/img/js/asteroid1.png",
    },
    {
      id: "laser-audio",
      var: (laserAudio = document.createElement("audio")),
      file: "../assets/audio/laser-shoot.wav",
    },
    {
      id: "explosion-audio",
      var: (explosionAudio = document.createElement("audio")),
      file: "../assets/audio/explosion.wav",
    },
    {
      id: "asteroid-large",
      var: (asteroidLarge = document.createElement("img")),
      file: "../assets/img/js/asteroid2.png",
    },
    {
      id: "asteroid-medium",
      var: (asteroidMedium = document.createElement("img")),
      file: "../assets/img/js/asteroid3.png",
    },
    {
      id: "asteroid-small",
      var: (asteroidSmall = document.createElement("img")),
      file: "../assets/img/js/asteroid4.png",
    },
    {
      id: "item-img",
      var: (itemImg = document.createElement("img")),
      file: "../assets/img/js/item.png",
    },
    {
      id: "baddie-img",
      var: (baddieImg = document.createElement("img")),
      file: "../assets/img/js/baddie.png",
    },
    {
      id: "splat-img",
      var: (splatImg = document.createElement("img")),
      file: "../assets/img/js/splat.png",
    },
  ]);
  startTimer();
};

window.onresize = function () {
  console.log("resizing...");
  window.gui.resize();
};

window.addEventListener("DOMContentLoaded", (event) => {
  // console.log("DOM fully loaded and parsed");
  const startButton = document.getElementById("start-js");
  if (startButton) {
    startButton.addEventListener("onClick", function () {
      console.log("starting...");
      window.gui.startGame();
    });

    startButton.addEventListener("click", function () {
      console.log("starting...");
      window.gui.startGame();
    });

    startButton.addEventListener("touchstart", function () {
      console.log("starting...");
      window.gui.startGame();
    });
  }

  const pauseButton = document.getElementById("pause-js");
  if (pauseButton) {
    pauseButton.addEventListener("click", function () {
      console.log("pausing...");
      window.gui.pauseGame();
    });
  }

  const resumeButton = document.getElementById("resume-js");
  if (resumeButton) {
    resumeButton.addEventListener("click", function () {
      console.log("resuming...");
      window.gui.resumeGame();
    });
  }
});

// function displayNextImage() {
//   x = x === images.length - 1 ? 0 : x + 1;
//   document.getElementById("img").src = images[x];
// }

// function displayPreviousImage() {
//   x = x <= 0 ? images.length - 1 : x - 1;
//   document.getElementById("img").src = images[x];
// }

// Change start screen image periodically
var loop;
function startTimer() {
  loop = setInterval(change, 10000);
}

function stopTimer() {
  clearInterval(loop);
}

var images = [
  "../assets/img/js/screen02.png",
  "../assets/img/js/screen03.png",
  "../assets/img/js/screen04.jpg",
  "../assets/img/js/screen05.png",
];

let idx = 0;
function change() {
  if (idx < images.length) {
    let startImg = document.getElementById("img-start");

    startImg.classList.remove("start-img");
    void startImg.offsetWidth;
    startImg.classList.add("start-img");
    startImg.src = images[idx];
    idx++;
  } else {
    idx = 0;
  }
}

// window.onkeydown = function (e) {
//   console.log("keydown...");
//   if (e.keyCode == 32) {
//     game.player.shoot();
//   }
// };

window.onkeyup = function (e) {
  console.log("keyup...");
};
