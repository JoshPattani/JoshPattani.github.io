function check() {
  console.log('test');
}

var slider = document.getElementById("myRange");

const box = document.getElementById('knob-container-js');
const boundingRect = box.getBoundingClientRect();

const tickContainer = document.getElementById('tickContainer-js');
var startingTickAngle = -137;

const knob = document.getElementById('knob-js');
const knobOutput = document.getElementById('knob-output-js');

var finalAngle, tickHilight;

function main() {
  slider.value = 0;
  knobOutput.textContent = 0;
  box.addEventListener('mousedown', function() {
    
    document.addEventListener('mousemove', rotateKnob);
  });

  box.addEventListener('mouseup', function() {
    
    document.removeEventListener('mousemove', rotateKnob);
    timeOut();    
  });

  createTicks(28, 0); // create ticks dynamically
}

function update(vol) {
  slider.value = vol
}

function findDegree(e) {
  knobPos_X = boundingRect.left;
  knobPos_Y = boundingRect.top;

  knobCenter_X = boundingRect.width / 2 + knobPos_X;
  knobCenter_Y = boundingRect.height / 2 + knobPos_Y;

  adjSide = knobCenter_X - e.clientX;
  oppSide = knobCenter_Y - e.clientY;
 
  x = adjSide;
  y = oppSide;
  
  radian = Math.atan2(x, y);
  degree = radian * (180 / Math.PI);
  finalAngle = -(degree - 135);

  return finalAngle;
}

function rotateKnob(e) {
  finalAngle = findDegree(e);
  
  if(finalAngle >= 0 && finalAngle < 280) {
    knob.style.transform = 'rotate('+finalAngle+'deg)'; // dynamic CSS transform to rotate knob
    
    setting = Math.floor(finalAngle/2.7);
    tickHilight = Math.round((setting * 2.7) / 10); // ticks to be highlighted
    createTicks(28, tickHilight); // create ticks dynamically

    knobOutput.textContent = setting; // update volume setting
    update(setting);
  } else if (finalAngle > 280) {
    // max bound
    finalAngle = 280;
    knob.style.transform = 'rotate('+finalAngle+'deg)';
    setting = Math.floor(finalAngle/2.8);
    tickHilight = Math.round((setting * 2.8) / 10); // ticks to be highlighted
    createTicks(28, tickHilight); // create ticks dynamically

    knobOutput.textContent = setting; // update volume setting
    update(setting);
  }
}

function timeOut() {
  curr_degree = finalAngle;
  
  hiLight = tickContainer.getElementsByClassName("tick activetick");
  // console.log(hiLight);
  count = hiLight.length;

  box.addEventListener('mousedown', function() {
    clearInterval(timer);
  });
   
  timer = setInterval(tick,1667);
  function tick() {
    deselect = document.getElementsByClassName("activetick");
    
    // console.log('curr_count: '+count);
    // console.log('curr_degree: '+curr_degree);

    // min/max bound
    if(curr_degree <= 0 || curr_degree > 280) {
      curr_degree = 280;
      knob.style.transform = 'rotate('+curr_degree+'deg)';
    }
    // Remove highlighted ticks
    if(count>1) {
      deselect[count-1].className = "tick";
      curr_degree = curr_degree - 10;
      knob.style.transform = 'rotate('+curr_degree+'deg)';
      setting = Math.floor(curr_degree/2.8);
      knobOutput.textContent = setting; // update volume setting
      update(setting);
    } else if (count == 1) {
      deselect[0].className = "tick";
      clearInterval(timer);
      box.removeEventListener('mouseup', timeOut);
    } else {
      clearInterval(timer);
      box.removeEventListener('mouseup', timeOut);      
    }
    
    count  --;

    // catch for previous conditionals being skipped when count reaches zero
    if (count <= 0){
      curr_degree = 0;
      knob.style.transform = 'rotate('+curr_degree+'deg)';
      knobOutput.textContent = 0;
      update(0);
      clearInterval(timer);
      box.removeEventListener('mouseup', timeOut);
    }
    // console.log(count);
  }
}

//dynamically create volume knob "ticks"
function createTicks(numTicks, highlightNumTicks) {
  //reset first by deleting all existing ticks
  while(tickContainer.firstChild) {
      tickContainer.removeChild(tickContainer.firstChild);
  }

  //create ticks
  for(var i=0;i<numTicks;i++) {
      var tick = document.createElement("div");

      //highlight only the appropriate ticks using dynamic CSS
      if(i < highlightNumTicks) {
          tick.className = "tick activetick";
      } else {
          tick.className = "tick";
      }

      tickContainer.appendChild(tick);
      tick.style.transform = "rotate(" + startingTickAngle + "deg)";
      startingTickAngle += 10;
  }
  startingTickAngle = -137; //reset
}

main();
/*

function submit() {
  alert('Your volume is now: ' + output.textContent);
}

function reset() {
  outputInt = 0;
  output.textContent = outputInt;
}

function minus() {
  if (outputInt > 0) {
  outputInt -=1;
  output.textContent = outputInt; }
  
}

function plus() {
  if (outputInt < 100) {
  outputInt +=1;
  output.textContent = outputInt;
  }
}

function random() {
  outputInt = randomNumber(0, 100);
  output.textContent = outputInt;
}

function randomNumber(min, max) {
  const num = Math.floor(Math.random() * (max - min + 1)) + min;
  return num;
}
// const output = document.querySelector('.output');
// let outputInt = parseInt(output.textContent);
// console.log(outputInt);

// const minusButton = document.querySelector('.minus-button').addEventListener('click', minus);
// const plusButton = document.querySelector('.plus-button').addEventListener('click', plus);
// const resetButton = document.querySelector('.reset-button').addEventListener('click', reset);
// const randomButton = document.querySelector('.random-button').addEventListener('click', random);
// const submitButton = document.querySelector('.submit-button').addEventListener('click', submit);

const button = document.querySelector('.button');
const output = document.querySelector('.output');
let phone_content = document.querySelector('.phone');

button.addEventListener('click', updateOutput);

function updateOutput() {
  output.textContent = phone_content.value;
  alert(phone_content.value);
}

// var sliderSubmit = slider.addEventListener('click', rotateKnob);
// var sliderOutput = document.querySelector(".slider-output")
*/