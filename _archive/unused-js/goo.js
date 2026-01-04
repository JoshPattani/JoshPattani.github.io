class Slime {
  /* Slime Blobs - currently displays properly but the blob animation is undesirable after mouse interactions. Needs some work; solution integrated from a jQuery example. Also, running inefficiently, pretty abusive on cpu.*/

  constructor() {
    this.circles = Array.from(document.querySelectorAll(".c"));
    this.scale = 0.3;
    this.w = window.innerWidth;
    this.h = window.innerHeight;
    this.size = this.w / 12 < 60 ? 60 : this.w / 12;
    this.isPreview = true;
    this.currentPoint = 0;
    this.previewInterval = null;
    this.previewPoints = JSON.parse(
      '[{"x":490,"y":51},{"x":473,"y":82},{"x":448,"y":98},{"x":434,"y":103},{"x":410,"y":107},{"x":400,"y":107},{"x":375,"y":106},{"x":334,"y":100},{"x":310,"y":95},{"x":298,"y":92},{"x":274,"y":84},{"x":244,"y":73},{"x":224,"y":65},{"x":209,"y":58},{"x":192,"y":50},{"x":172,"y":44},{"x":149,"y":40},{"x":134,"y":40},{"x":120,"y":48},{"x":109,"y":61},{"x":100,"y":71},{"x":95,"y":82},{"x":87,"y":104},{"x":85,"y":121},{"x":83,"y":131},{"x":81,"y":144},{"x":77,"y":173},{"x":76,"y":184},{"x":75,"y":189},{"x":75,"y":207},{"x":76,"y":223},{"x":79,"y":232},{"x":90,"y":271},{"x":99,"y":286},{"x":113,"y":304},{"x":116,"y":306},{"x":127,"y":319},{"x":165,"y":344},{"x":168,"y":346},{"x":176,"y":348},{"x":186,"y":350},{"x":194,"y":350},{"x":218,"y":345},{"x":236,"y":345},{"x":237,"y":345},{"x":248,"y":345},{"x":264,"y":345},{"x":280,"y":345},{"x":290,"y":341},{"x":309,"y":333},{"x":327,"y":323},{"x":345,"y":313},{"x":368,"y":301},{"x":383,"y":291},{"x":415,"y":271},{"x":426,"y":265},{"x":439,"y":257},{"x":449,"y":249},{"x":452,"y":247},{"x":483,"y":223},{"x":485,"y":222},{"x":499,"y":212},{"x":523,"y":190},{"x":536,"y":174},{"x":538,"y":172},{"x":549,"y":161},{"x":566,"y":150},{"x":591,"y":136},{"x":620,"y":128},{"x":621,"y":128},{"x":630,"y":130},{"x":631,"y":131},{"x":644,"y":140},{"x":648,"y":143},{"x":649,"y":145},{"x":652,"y":151},{"x":659,"y":160},{"x":664,"y":172},{"x":669,"y":182},{"x":677,"y":197},{"x":682,"y":209},{"x":690,"y":226},{"x":697,"y":239},{"x":701,"y":254},{"x":701,"y":259},{"x":701,"y":260},{"x":701,"y":260},{"x":703,"y":273},{"x":704,"y":286},{"x":707,"y":310}]'
    );

    this.setup();
    this.addEventListeners();
    this.startPreview();
  }

  init() {
    this.setup();
    this.addEventListeners();
    this.start();
  }

  random(min, max) {
    return Math.random() * (max - min) + min;
  }

  getDistance(x1, y1, x2, y2) {
    return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
  }

  setup() {
    this.circles.forEach((circle) => {
      circle.style.position = "absolute";
      circle.style.transform = `scale(${this.scale})`;
      circle.style.opacity = "1";
      circle.style.height = `${this.size}px`;
      circle.style.width = `${this.size}px`;
      circle.style.background = "#14f01b";
      circle.style.borderRadius = "50%";

      circle.style.top = `${this.random(0, this.h - this.size)}px`;
      circle.style.left = `${this.random(0, this.w - this.size)}px`;
    });
  }

  moveMouse(e) {
    // Something in here is not animating properly,
    // all slime blobs return to top left of screen

    if (!e.previewEvent) {
      this.isPreview = false;
    }

    let x = e.touches ? e.touches[0].clientX : e.clientX;
    let y = e.touches ? e.touches[0].clientY : e.clientY;

    this.circles.forEach((circle) => {
      let offset = circle.getBoundingClientRect();

      if (this.getDistance(offset.left, offset.top, x, y) < 100) {
        circle.style.transform = "scale(1)";
        circle.style.left = `${x - offset.left}px`;
        circle.style.top = `${y - offset.top}px`;
      } else {
        // SUSPECT - need vanilla js equivalent  of jQuery's TwwenMax
        // Check this out as possible solution:
        // <script src="http://cdnjs.cloudflare.com/ajax/libs/gsap/1.18.0/TweenMax.min.js"></script>
        circle.style.transform = `scale(${this.scale})`;
      }
    });
  }

  addEventListeners() {
    window.addEventListener("mousemove", this.moveMouse.bind(this));
    window.addEventListener("touchstart", this.moveMouse.bind(this));
    window.addEventListener("touchmove", this.moveMouse.bind(this));
    window.addEventListener("resize", this.setup.bind(this));
  }

  preview() {
    if (this.isPreview) {
      if (this.currentPoint >= this.previewPoints.length) {
        this.currentPoint = 0;
      }

      let point = this.previewPoints[this.currentPoint];
      this.moveMouse({
        previewEvent: true,
        clientX: point.x,
        clientY: point.y,
      });
      this.currentPoint++;
    }
  }

  startPreview() {
    this.previewInterval = setInterval(this.preview.bind(this), 1000 / 60);
  }

  stopPreview() {
    clearInterval(this.previewInterval);
  }

  start() {
    this.startPreview();
  }

  stop() {
    this.stopPreview();
  }

  render() {}

  update() {}
}

// var c = document.querySelectorAll(".c");
// var scale = 0.3;
// var w, h, size;

// function setup() {
//   w = window.innerWidth;
//   h = window.innerHeight;
//   size = w / 12 < 60 ? 60 : w / 12;

//   c.forEach(function (element) {
//     var c = element;
//     c.style.position = "absolute";
//     c.style.transform = "scale(" + scale + ")";
//     c.style.opacity = "1";
//     c.style.height = size + "px";
//     c.style.width = size + "px";
//     c.style.background = "#14f01b";
//     c.style.borderRadius = "50%";

//     c.style.top = random(0, h - size) + "px";
//     c.style.left = random(0, w - size) + "px";
//   });
// }

// function moveMouse(e) {
//   if (!e.previewEvent) {
//     isPreview = false;
//   }

//   var x = e.touches ? e.touches[0].clientX : e.clientX;
//   var y = e.touches ? e.touches[0].clientY : e.clientY;

//   c.forEach(function (element) {
//     var c = element;
//     var offset = c.getBoundingClientRect();

//     if (getDistance(offset.left, offset.top, x, y) < 100) {
//       c.style.transform = "scale(1)";
//       c.style.left = x - offset.left + "px";
//       c.style.top = y - offset.top + "px";
//     } else {
//       c.style.transform = "scale(" + scale + ")";
//     }
//   });
// }

// window.addEventListener("mousemove", moveMouse);
// window.addEventListener("touchstart", moveMouse);
// window.addEventListener("touchmove", moveMouse);
// window.addEventListener("resize", setup);

// setup();

// var currentPoint = 0;
// var isPreview = true;
// var previewInterval;

// var previewPoints = JSON.parse(
//   '[{"x":490,"y":51},{"x":473,"y":82},{"x":448,"y":98},{"x":434,"y":103},{"x":410,"y":107},{"x":400,"y":107},{"x":375,"y":106},{"x":334,"y":100},{"x":310,"y":95},{"x":298,"y":92},{"x":274,"y":84},{"x":244,"y":73},{"x":224,"y":65},{"x":209,"y":58},{"x":192,"y":50},{"x":172,"y":44},{"x":149,"y":40},{"x":134,"y":40},{"x":120,"y":48},{"x":109,"y":61},{"x":100,"y":71},{"x":95,"y":82},{"x":87,"y":104},{"x":85,"y":121},{"x":83,"y":131},{"x":81,"y":144},{"x":77,"y":173},{"x":76,"y":184},{"x":75,"y":189},{"x":75,"y":207},{"x":76,"y":223},{"x":79,"y":232},{"x":90,"y":271},{"x":99,"y":286},{"x":113,"y":304},{"x":116,"y":306},{"x":127,"y":319},{"x":165,"y":344},{"x":168,"y":346},{"x":176,"y":348},{"x":186,"y":350},{"x":194,"y":350},{"x":218,"y":345},{"x":236,"y":345},{"x":237,"y":345},{"x":248,"y":345},{"x":264,"y":345},{"x":280,"y":345},{"x":290,"y":341},{"x":309,"y":333},{"x":327,"y":323},{"x":345,"y":313},{"x":368,"y":301},{"x":383,"y":291},{"x":415,"y":271},{"x":426,"y":265},{"x":439,"y":257},{"x":449,"y":249},{"x":452,"y":247},{"x":483,"y":223},{"x":485,"y":222},{"x":499,"y":212},{"x":523,"y":190},{"x":536,"y":174},{"x":538,"y":172},{"x":549,"y":161},{"x":566,"y":150},{"x":591,"y":136},{"x":620,"y":128},{"x":621,"y":128},{"x":630,"y":130},{"x":631,"y":131},{"x":644,"y":140},{"x":648,"y":143},{"x":649,"y":145},{"x":652,"y":151},{"x":659,"y":160},{"x":664,"y":172},{"x":669,"y":182},{"x":677,"y":197},{"x":682,"y":209},{"x":690,"y":226},{"x":697,"y":239},{"x":701,"y":254},{"x":701,"y":259},{"x":701,"y":260},{"x":701,"y":260},{"x":703,"y":273},{"x":704,"y":286},{"x":707,"y":310}]'
// );

// function preview() {
//   if (isPreview) {
//     if (currentPoint >= previewPoints.length) {
//       currentPoint = 0;
//     }

//     var point = previewPoints[currentPoint];
//     moveMouse({
//       previewEvent: true,
//       clientX: point.x,
//       clientY: point.y,
//     });
//     currentPoint++;
//   }
// }

// previewInterval = setInterval(preview, 1000 / 60);
// function previewStop() {
//   clearInterval(previewInterval);
// }
