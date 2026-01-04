let container = document.getElementById("container");

let count = 200;
for (let i = 0; i < count; i++) {
  let gooeyBox = document.createElement("div");
  gooeyBox.className = "c";
  container.appendChild(gooeyBox);
}

let slime = new Slime();
slime.init();

// setInterval(function () {
//   let gooey = document.getElementsByClassName("c");
//   for (let i = 0; i < gooey.length; i++) {
//     gooey[i].style.left = Math.floor(Math.random() * 90) + "vw";
//     gooey[i].style.top = Math.floor(Math.random() * 80) + "vh";
//   }
// }, 1000 / 60);
