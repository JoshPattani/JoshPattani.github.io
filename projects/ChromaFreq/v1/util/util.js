// Utilities

// Color frequency constants, in Hertz

var lightFreqRedLower = 400000000000000;
var lightFreqOrangeLower = 484000000000000;
var lightFreqYellowLower = 508000000000000;
var lightFreqGreenLower = 526000000000000;
var lightFreqCyanLower = 606000000000000;
var lightFreqBlueLower = 631000000000000;
var lightFreqVioletLower = 668000000000000;
var lightFreqVioletUpper = 800000000000000; // really 789 THz, but we fudge to guarantee success in finding a consonant color

var speedOfLightVacuum = 299792458; // m/sec

// Given a sound Frequency, return an array
// that contains:
//    [r, g, b]

// 0: lightFrequency (Hertz)
// 1: lightFrequencyTHz
// 2: lightWavelength (meters)
// 3: lightWavelengthNM
// 4: lightOctave (number of octaves above the supplied sound).
// 5: lightRGB (#hhhhhh format)

function getColorFromSound(soundFreqHz) {
  var freq = Math.abs(soundFreqHz);
  var answer = new Array(6);

  var lightOctave = 0;

  // Scales the soundfreqHZ if we are not within the visible light frequency, in Hz, domain
  while (freq < lightFreqRedLower) {
    freq *= 2;
    ++lightOctave;
  }

  // Scale to THz and Nanometers
  var freqTHz = soundFreqHz / 1e12;
  var lightWavelength = wavelength(freq, speedOfLightVacuum);
  var lightWavelengthNM = lightWavelength * 1e9;

  // This is the important one, everything else in answer array is just data
  //  lightRGB = [r, g, b], value range is 0-255.
  var lightRGB = getColor(lightWavelengthNM);

  answer[0] = freq;
  answer[1] = freqTHz;
  answer[2] = lightWavelength;
  answer[3] = lightWavelengthNM;
  answer[4] = lightOctave;
  answer[5] = lightRGB;

  // NOTE: changed to return only the light rgb values
  // expected to return an array containing [R, G, B]
  return lightRGB;
}

// Calculate the wavelength (lambda) for a sound of given frequency (f)
// // at a given speed of sound (c).
// // Frequency must be in Hertz.
// // The result is in meters if the speedOfSound is in m/sec.
// // The result is in feet if speedOfSound is in ft/sec
// // The result is in cm if speedOfSound is in cm/sec
// // The general formula is:
// // lambda = c / f
function wavelength(frequency, speedOfLight) {
  return speedOfLight / frequency;
}

// Take a wavelength in Nanometers in the range 350-780  nm and return the
// equivalent RGB color in the format of [ R, G, B ]
function getColor(wl) {
  let r, g, b;
  let gamma = 1.0;

  // Determine the color from the light's wavelength
  if (wl >= 420 && wl <= 469) {
    r = (wl - 420) / (470 - 420);
    g = 0.0;
    b = 1.0;
  } else if (wl >= 470 && wl <= 490) {
    r = 0.0;
    g = (wl - 470) / (490 - 470);
    b = 1.0;
  } else if (wl >= 490 && wl <= 509) {
    r = 0.0;
    g = 1.0;
    b = (wl - 510) / (510 - 490);
  } else if (wl >= 510 && wl <= 579) {
    r = (wl - 510) / (580 - 510);
    g = 1.0;
    b = 0.0;
  } else if (wl >= 580 && wl <= 644) {
    r = 1.0;
    g = (wl - 645) / (645 - 580);
    b = 0.0;
  } else if (wl >= 645 && wl <= 780) {
    r = 1.0;
    g = 0.0;
    b = 0.0;
  } else {
    r = 0.0;
    g = 0.0;
    b = 0.0;
  }

  // Let the intensity fall off near the vision limits
  let factor;
  if (wl >= 350 && wl <= 419) {
    factor = 0.1 + (0.9 * (wl - 350)) / (420 - 350);
  } else if (wl >= 420 && wl <= 644) {
    factor = 1.0;
  } else if (wl >= 645 && wl <= 780) {
    factor = 0.2 + (0.8 * (780 - wl)) / (780 - 645);
  } else {
    factor = 0.0;
  }

  // Set values according to intensity factor
  let rgb = [0, 0, 0];
  if (r !== 0) {
    rgb[0] = Math.round(255 * Math.pow(r * factor, gamma));
  }
  if (g !== 0) {
    rgb[1] = Math.round(255 * Math.pow(g * factor, gamma));
  }
  if (b !== 0) {
    rgb[2] = Math.round(255 * Math.pow(b * factor, gamma));
  }
  return rgb;
}

// new version of main sketch.js draw functions

function draw() {
  // set volume to slider value
  song.setVolume(slider.value());
}

// Initial play button
function canvasPressed() {
  // playing a sound file on a user gesture
  // is equivalent to `userStartAudio()`
  if (!song.isPlaying()) {
    song.play();
    draw();
  }
}

// volume slider
function sliderMoved() {
  // use the value to set the volume
  song.setVolume(slider.value());
  console.log("songVolume");
}

// Frequency analysis
function analyzeAudio() {
  spectrum = fft.analyze();

  // Get the dominant frequency from the spectrum
  let dominantFrequency = getDominantFrequency(spectrum);

  // Scale the frequency to match the speed of sound
  let scaledFrequency = scaleFrequency(dominantFrequency, speedOfSound);

  // Calculate the wavelength and convert it to RGB color
  lightRGB = resonantRGB(scaledFrequency);

  // Display the color on the canvas
  fill(lightRGB[0], lightRGB[1], lightRGB[2]);
  noStroke();
  rect(0, 0, width, height);
}

// Function to get the dominant frequency of a track
function getDominantFrequency(spectrum) {
  // Find the index of the peak frequency in the spectrum
  let peakIndex = indexOfMax(spectrum);

  // Map the index to a corresponding frequency
  let dominantFrequency = map(
    peakIndex,
    0,
    spectrum.length,
    0,
    sound.sampleRate() / 2
  );

  return dominantFrequency;
}

// Frequency scaling
function scaleFrequency(frequency, speedOfSound) {
  // Scale the frequency based on the speed of sound
  // Adjust this function as needed
  return frequency * (343 / speedOfSound);
}

// find corresponding light wavelength of sound freq
function resonantRGB(soundFrequency) {
  // Scale the sound frequency to light frequency
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
  let gamma = 1;
  let intensityMax = 255;
  let r, g, b;

  let factor;

  // Define wavelength to RGB conversion logic here
  // logic based on the wavelength range

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
  } else if (wl >= 580 && wl > 645) {
    // Yellow to Red
    r = 1;
    g = (-1 * (wl - 645)) / (645 - 580);
    b = 0;
  } else if (wl >= 645 && wl <= 780) {
    // Red w/ decreasing intensity
    r = 1;
    g = 0;
    b = 0;
  } else {
    // Outside the range
    r = 0;
    g = 0;
    b = 0;
  }

  // Let the intensity fall off near the vision limits
  if (wl > 780 || wl < 380) {
    factor = 0;
  } else if (wl > 700) {
    factor = 0.3 + (0.7 * (780 - wl)) / (780 - 700);
  } else if (wl < 420) {
    factor = 0.3 + (0.7 * (wl - 380)) / (420 - 380);
  } else {
    factor = 1;
  }

  // Don't want 0^x = 1 for x <> 0
  r = r === 0 ? 0 : Math.round(intensityMax * Math.pow(r * factor, gamma));
  g = g === 0 ? 0 : Math.round(intensityMax * Math.pow(g * factor, gamma));
  b = b === 0 ? 0 : Math.round(intensityMax * Math.pow(b * factor, gamma));

  // Convert the calculated values to RGB format
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

// Helper function to find the index of the maximum value in an array
function indexOfMax(arr) {
  if (arr.length === 0) {
    return -1;
  }

  let max = arr[0];
  let maxIndex = 0;

  for (let i = 1; i < arr.length; i++) {
    if (arr[i] > max) {
      maxIndex = i;
      max = arr[i];
    }
  }

  return maxIndex;
}

// Spectrum Analysis
function drawSpectrum() {
  // Display the spectrum
  // let spectrum = fft.analyze();
  beginShape();
  strokeWeight(4);

  for (let i = 0; i < spectrum.length; i++) {
    // set the color according to frequency
    stroke(colors[i]);
    // vertex(i, height / 2 + spectrum[i] * 3);
    rect(
      i * (width / spectrum.length),
      height - spectrum[i] * 3,
      width / spectrum.length,
      spectrum[i] * 3
    );

    // let x = map(i, 0, spectrum.length, 0, width);
    // let h = -height + map(spectrum[i], 0, 255, height, 0);
    // rect(x, height, width / spectrum.length, h);
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
    //

    // let x = map(i, 0, waveform.length, 0, width);
    // let y = map(waveform[i], -1, 1, 0, height);
    // vertex(x, y);
  }
  endShape();
}
// #######################
