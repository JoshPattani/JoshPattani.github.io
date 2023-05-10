class EventHandler {
  constructor() {
    this.keys = [];
  }

  init() {
    document.addEventListener("keydown", (e) => {
      // this.keys[e.keyCode] = true;
      this.KeyDown(e);
    });

    document.addEventListener("keyup", (e) => {
      // this.keys[e.keyCode] = false;
      this.KeyUp(e);
    });
  }

  // check that most recently pressed key is not already in the keys array
  isKeyDown(key) {
    return this.keys.indexOf(key) == -1 ? true : false;
  }

  isDown(key) {
    return this.keys.indexOf(key) > -1 ? true : false;
  }

  // add key to keys array if it is not already in the array
  KeyDown(e) {
    if (
      (e.key == "ArrowUp" ||
        // e.key == "ArrowDown" ||
        e.key == "ArrowLeft" ||
        e.key == "ArrowRight" ||
        e.key == " ") &&
      this.isKeyDown(e.key)
    ) {
      this.keys.push(e.key);
    }
  }

  // remove key from keys array if it is in the array
  KeyUp(e) {
    if (
      e.key == "ArrowUp" ||
      // e.key == "ArrowDown" ||
      e.key == "ArrowLeft" ||
      e.key == "ArrowRight" ||
      e.key == " "
    ) {
      this.keys.splice(this.keys.indexOf(e.key), 1);
    }
  }
}
