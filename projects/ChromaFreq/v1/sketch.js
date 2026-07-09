let song;
let fft;
let amp;
let slider;
let spectrum;
let speedOfSound = 343; // Speed of sound in m/s (adjust to the actual value specific to your geographic location)
let speedOfLightVacuum = 299792458; // m/sec
let lightFreqRedLower = 400000000000000;
var lightFreqVioletUpper = 800000000000000;
let lightRGB;

// p5.js setup for canvas
function setup(file) {
  soundFormats("wav");
  // make sure there is not already a canvas generated when a new track is selected so that a new can be created
  const canvas = document.getElementById("defaultCanvas0");
  if (canvas) {
    canvas.remove();
    // reset canvas container size
    const container = document.getElementById("canvas-container");
    container.style.width = "100%";
    container.style.height = "100%";

    // reset album cover container
    const cover = document.getElementById("album-cover");
    cover.style.display = "block";
  }

  if (file != undefined && file != null) {
    song = loadSound(file, console.log("song loaded: " + String(file)));

    const cover = document.getElementById("album-cover");

    // Assuming the container's dimensions dictate the size of the canvas
    const canvasSize = cover.getBoundingClientRect();
    const width = canvasSize.width * 3;
    const height = canvasSize.height * 1.3;

    // enlarge container to fit canvas
    const container = document.getElementById("canvas-container");
    container.style.width = String(width) + "px";
    container.style.height = String(height) + "px";

    // Hide the album cover container (meant to hide an image container)
    cover.style.display = "none";

    console.log("canvas found");

    // Create the p5.js canvas inside the "canvas-container" div
    let cnv = createCanvas(width, height);
    if (cnv) {
      cnv.parent("canvas-container"); // This attaches the canvas to the "canvas-container"

      // change visibility
      cnv.style("visibility", "visible");

      // set hidden data to false
      cnv.attribute("data-hidden", "false");

      // display text
      background(110);
      textAlign(CENTER);
      fill(255);
      text(
        "FLASH WARNING! \n Wait a moment, then tap here to visualize",
        width / 2,
        height / 2
      );
    } else {
      console.log("no canvas created");
    }

    // p5 canvas event listener
    cnv.mousePressed(canvasPressed);

    // p5 volume slider
    // check that there is not already a slider
    const sliderContainer = document.getElementById("slider-container");
    if (sliderContainer) {
      const slider = document.getElementById("volume-slider");
      if (slider) slider.remove();
    }
    slider = createSlider(0, 1, 1, 0.01);
    slider.parent("slider-container");
    slider.id("volume-slider");
    slider.class("controls");

    // Add text label to slider
    const sliderLabel = createP("Volume");
    sliderLabel.parent("slider-container");

    // Volume slider event listener
    slider.changed(sliderMoved);

    // Get the duration of the song in seconds
    songLength = song.duration();

    // Create an FFT analyzer
    amp = new p5.Amplitude();
    fft = new p5.FFT();
    // fft.setInput(song);
    song.connect(fft);
  }
}

function draw() {
  if (song != undefined && song != null && song.isPlaying()) {
    // set volume to slider value
    if (slider != undefined && slider != null) {
      song.setVolume(slider.value());
    }

    console.log("drawing");

    // Get the spectrum of the song
    if (fft != undefined && fft != null) {
      const spectrum = fft.analyze();
      analyzeAudio(spectrum);
    }
  }
}

// Initial play button
function canvasPressed() {
  // playing a sound file on a user gesture
  // is equivalent to `userStartAudio()`
  if (song.isPlaying()) {
    // Stop the currently playing song

    // Clear the canvas
    background(110);
    textAlign(CENTER);
    text("Press to Continue Visualization", width / 2, height / 2);

    pauseSong();
  } else {
    // Clear the canvas for drawing without text
    background(110);
    // Play the song
    playSong();

    // Add a pause button
    const controls = document.getElementById("interactive_gui"); // Ensure this is the correct parent element ID
    if (controls) {
      // check that there is not already a pause button
      const pauseButton = document.getElementById("pause-button");
      if (pauseButton) pauseButton.remove();
      const pauseButtonDiv = document.createElement("div");
      pauseButtonDiv.id = "pause-button";
      controls.appendChild(pauseButtonDiv);

      let btn = createButton("Pause");
      btn.parent(pauseButtonDiv);
      btn.id("pause");
      btn.mousePressed(pauseSong);
    } else {
      console.log("no controls");
    }
  }
}

// volume slider
function sliderMoved() {
  // use the value to set the volume
  song.setVolume(slider.value());
  // console.log("songVolume: " + String(slider.value()));
}

// #
// ##
// ###
// ####
// #####
// ######
// #####
// ####
// ###
// ##
// #

// Frequency analysis
function analyzeAudio(spectrum) {
  // Get the dominant frequency from the spectrum
  if (song.isPlaying()) {
    // use p5.FFT to get frequencies from analyzed spectrum
    spectralCentroid = fft.getCentroid();

    if (spectralCentroid) {
      // Calculate dominant frequency
      let dominantFrequency = spectralCentroid;

      console.log(dominantFrequency);

      // Logarithmic mapping of sound freq to color wavelength
      lightRGB = soundFreqToLightWavelength(dominantFrequency);

      // #######

      // Calculate the wavelength and convert it to RGB color
      // via resonantRGB to map frequencies linearly

      // Linear mapping of sound freq to color wavelength
      // lightRGB = resonantRGB(dominantFrequency);

      // console.log(lightRGB);

      // ########

      // Display the color on the canvas
      // Drawing functions - activate as desired

      // Spectrum
      // drawSpectrum(spectrum, lightRGB);

      // Waveform
      // drawWaveform();

      // Color Matrix
      // drawColorMatrix(spectrum, lightRGB);

      // Gradient Flow
      // drawGradientFlow(spectrum, lightRGB);

      // Color Waves
      drawColorWaves(spectrum, lightRGB);
    }
  }
}

function soundFreqToLightWavelength(soundFreq) {
  // This function uses a logarithmic approach for mapping sound freq into the visible light spectrum. This calculation is designed to align more closely with the logarithmic nature of human perception of sound.

  // these are shifted a bit since we are using spectralCentroid to render the dominant frequency, which is the center of mass of the spectrum
  const minFreq = 64; // Minimum sound frequency (Hz)
  const maxFreq = 16000; // Maximum sound frequency (Hz)

  const minWavelength = 400; // Minimum light wavelength (nm) - violet light
  const maxWavelength = 675; // Maximum light wavelength (nm) - red light

  // Map sound frequency logarithmically to the range of visible light wavelengths
  const logFreq =
    (Math.log(soundFreq / minFreq) / Math.log(maxFreq / minFreq)) **
    2.718281828459045;
  const wavelength = minWavelength + (maxWavelength - minWavelength) * logFreq;

  // console.log("wl: " + wavelength);

  return getColorFromWavelength(wavelength);
}

// find corresponding light wavelength of sound freq
function resonantRGB(soundFrequency) {
  // This function scales the sound frequency to the light frequency range and then converts it to a wavelength. A direct approach for mapping sound to color.

  // This is a simple linear mapping, which may not be the most accurate but is easy to understand and implement.

  // Scale frequency until it reaches the range of visible light
  let lightFrequency = soundFrequency;
  while (lightFrequency < lightFreqRedLower) {
    lightFrequency *= 2;
  }

  // Calculate light wavelength in nanometers
  let lightWavelengthNM = (speedOfLightVacuum / lightFrequency) * 1e9;

  // Convert wavelength to RGB
  return getColorFromWavelength(lightWavelengthNM);
}

// Function to convert wavelength to RGB
function getColorFromWavelength(wl) {
  // This function converts a wavelength of light to an RGB color. It is based on the work of Dan Bruton at http://www.physics.sfasu.edu/astro/color/spectra.html
  let gamma = 1;
  let intensityMax = 255;
  let r, g, b;

  let factor;

  wl = Math.floor(wl);
  console.log("floored: " + wl);

  // wavelength to RGB conversion logic
  // logic based on the wavelength range of visible light

  if (wl >= 380 && wl < 440) {
    // Purple to Blue
    r = (-1 * (wl - 440)) / (440 - 380);
    g = 0;
    b = 1;
  } else if (wl >= 440 && wl < 490) {
    // Blue to Cyan
    r = 0;
    g = (wl - 440) / (490 - 440);
    b = 1;
  } else if (wl >= 490 && wl < 510) {
    // Cyan to Green
    r = 0;
    g = 1;
    b = (-1 * (wl - 510)) / (510 - 490);
  } else if (wl >= 510 && wl < 580) {
    // Green to Yellow
    r = (wl - 510) / (580 - 510);
    g = 1;
    b = 0;
  } else if (wl >= 580 && wl < 645) {
    // Yellow to Red
    r = 1;
    g = (-1 * (wl - 645)) / (645 - 580);
    b = 0;
  } else if (wl >= 645 && wl <= 780) {
    // Red w/ decreasing intensity
    r = 1;
    g = 0;
    b = 0;
  } else if (wl > 780) {
    return [intensityMax, intensityMax, intensityMax];
  } else {
    // Outside the range
    r = 0;
    g = 0;
    b = 0;
  }

  // Let the intensity fall off near the vision limits
  // Intensity factor goes through the range:
  // 0.1 (350-420 nm) 1.0 (420-645 nm) 0.2 (645-780 nm)
  if (wl >= 350 && wl < 400) {
    factor = 0.3 + (0.9 * (wl - 350)) / (420 - 350);
  } else if (wl >= 400 && wl < 645) {
    factor = 1.0;
  } else if (wl >= 645 && wl <= 780) {
    factor = 0.5 + (0.8 * (780 - wl)) / (780 - 645);
  } else {
    factor = 0.0;
  }

  // Don't want 0^x = 1 for x <> 0
  r = r === 0 ? 0 : Math.round(intensityMax * Math.pow(r * factor, gamma));
  g = g === 0 ? 0 : Math.round(intensityMax * Math.pow(g * factor, gamma));
  b = b === 0 ? 0 : Math.round(intensityMax * Math.pow(b * factor, gamma));

  // return color
  return [r, g, b];
}

// Spectrum Analysis
function drawSpectrum(spectrum, lightRGB) {
  // Display the spectrum in resonant rgb color
  beginShape();
  strokeWeight(4);

  for (let i = 0; i < spectrum.length; i++) {
    // set the color according to rgb values returned from getColorFromWavelength function
    stroke(lightRGB[0], lightRGB[1], lightRGB[2]);

    // vertex(i, height / 2 + spectrum[i] * 3);
    rect(
      i * (width / spectrum.length),
      height - spectrum[i] * 6,
      width / spectrum.length,
      spectrum[i] * 2
    );
  }
  endShape();
}

// Waveform analysis
function drawWaveform() {
  // Display the waveform
  let waveform = fft.waveform();
  noFill();
  beginShape();
  // stroke(255, 0, 0); // waveform is red
  strokeWeight(1);
  for (let i = 0; i < waveform.length; i++) {
    // Set the color along waveform to its corresponding frequency
    stroke(colors[i]);
    line(
      i * (width / waveform.length),
      height / 2 + waveform[i] * 100,
      i * (width / waveform.length),
      height / 2 - waveform[i] * 100
    );
  }
  endShape();
}

// Color Matrix
function drawColorMatrix(spectrum, lightRGB) {
  const rows = 10;
  const cols = spectrum.length / rows;
  for (let i = 0; i < spectrum.length; i++) {
    const x = (i % cols) * (width / cols);
    const y = Math.floor(i / cols) * (height / rows);
    fill(lightRGB[0], lightRGB[1], lightRGB[2]);
    rect(x, y, width / cols, height / rows);
  }
}

// Color Particles
// Future implementation requires a custom Particles class
// let particles = [];

// function setupParticles() {
//   for (let i = 0; i < 50; i++) {
//     particles.push(new Particle());
//   }
// }

// function drawColorParticles(spectrum) {
//   particles.forEach((particle) => {
//     particle.update(spectrum);
//     particle.draw();
//   });
// }

// Gradient Flow
function drawGradientFlow(spectrum, lightRGB) {
  // create flowing gradient
  let gradient = drawingContext.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(
    0,
    `rgb(${lightRGB[0]}, ${lightRGB[1]}, ${lightRGB[2]})`
  );
  gradient.addColorStop(
    1,
    `rgb(${lightRGB[2]}, ${lightRGB[1]}, ${lightRGB[0]})`
  );
  fill(gradient);
  rect(0, 0, width, height);
}

// Color Waves
function drawColorWaves(spectrum, lightRGB) {
  // Display the spectrum in resonant rgb color

  // clear canvas
  background(110);

  beginShape();
  let spreadFactor = spectrum.length / (width * 1.05); // Adjust constant to change the spread
  for (let i = 0; i < spectrum.length; i++) {
    const y = map(spectrum[i], 0, 255, height * 0.75, 0);
    stroke(lightRGB[0], lightRGB[1], lightRGB[2]);
    line(i * spreadFactor, height * 0.75, i * spreadFactor, y);
  }
  endShape();
}
// #######################
