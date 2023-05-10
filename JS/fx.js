class Fx {
  constructor() {
    this.cnv = null;
    this.ctx = null;
  }

  init() {
    this.cnv = document.getElementById("canvas");
    this.ctx = this.cnv.getContext("2d");
  }

  fillCanvas(color) {
    // if (this.cnv) {
    //   console.log("fill Here");
    //   this.cnv.width = window.innerWidth;
    //   this.cnv.height = window.innerHeight;
    //   this.drawRect(0, 0, this.cnv.width, this.cnv.height, color);
    // }
    this.drawRect(0, 0, this.cnv.width, this.cnv.height, color);
  }

  drawRect(x, y, w, h, color) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, w, h);
    this.ctx.fill();
    console.log("drawing..");
  }

  drawCircle(x, y, r, color) {
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.arc(x, y, r, 0, 2 * Math.PI);
    this.ctx.fill();
  }

  rotateAndDraw(img, atx, aty, angle) {
    if (img && this.ctx) {
      this.ctx.save();
      this.ctx.translate(atx + img.width / 2, aty + img.height / 2);
      this.ctx.rotate(angle);
      this.ctx.drawImage(img, -img.width / 2, -img.height / 2);
      this.ctx.restore();
    }
  }
}
