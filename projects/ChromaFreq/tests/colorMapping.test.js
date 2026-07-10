import assert from "node:assert/strict";
import {
  COLOR_DRIVERS,
  analyzeFrequencyData,
  getColorDriver,
  selectColorDriverFrequency,
} from "../src/audio/AudioEngine.js";
import {
  DEFAULT_MAPPING_MODE,
  MAPPING_MODES,
  mapFrequencyToColor,
} from "../src/color/colorMapping.js";
import { wavelengthToRgb } from "../src/color/wavelengthToRgb.js";

const red = wavelengthToRgb(650);
assert.equal(red.rgb[0] > red.rgb[1], true, "650 nm should be red dominant");
assert.equal(red.rgb[0] > red.rgb[2], true, "650 nm should be red dominant");

const green = wavelengthToRgb(532);
assert.equal(green.rgb[1] >= green.rgb[0], true, "532 nm should be green dominant");
assert.equal(green.rgb[1] >= green.rgb[2], true, "532 nm should be green dominant");

const defaultMapping = mapFrequencyToColor(440, DEFAULT_MAPPING_MODE);
assert.equal(defaultMapping.mode, MAPPING_MODES.perceptualLog.id);
assert.equal(Number.isFinite(defaultMapping.wavelengthNm), true);
assert.equal(defaultMapping.rgb.length, 3);

const bass = mapFrequencyToColor(80, MAPPING_MODES.perceptualLog.id);
const treble = mapFrequencyToColor(8000, MAPPING_MODES.perceptualLog.id);
assert.equal(
  bass.wavelengthNm > treble.wavelengthNm,
  true,
  "Perceptual mapping should send higher audio to shorter light wavelength"
);

const legacy = mapFrequencyToColor(440, MAPPING_MODES.legacyLinear.id);
assert.equal(legacy.octavesShifted > 0, true);
assert.equal(legacy.inVisibleRange, true);

const silent = mapFrequencyToColor(0);
assert.equal(silent.hex, "#000000");
assert.equal(silent.isSilent, true);

const sampleRate = 44_100;
const fftSize = 2048;
const binWidth = sampleRate / fftSize;
const frequencyData = new Uint8Array(fftSize / 2);
frequencyData[Math.round(440 / binWidth)] = 230;
frequencyData[Math.round(2000 / binWidth)] = 96;

const analysis = analyzeFrequencyData(frequencyData, sampleRate, fftSize);
assert.equal(
  Math.abs(analysis.dominantFrequencyHz - 440) < binWidth,
  true,
  "Dominant analysis should report the strongest peak"
);
assert.equal(
  analysis.spectralCentroidHz > analysis.dominantFrequencyHz,
  true,
  "Spectral centroid should account for higher-frequency energy"
);
assert.equal(Number.isFinite(analysis.bandBlendFrequencyHz), true);
assert.equal(
  selectColorDriverFrequency(analysis, COLOR_DRIVERS.dominantPeak.id),
  analysis.dominantFrequencyHz
);
assert.equal(
  selectColorDriverFrequency(analysis, COLOR_DRIVERS.spectralCentroid.id),
  analysis.spectralCentroidHz
);
assert.equal(
  selectColorDriverFrequency(analysis, COLOR_DRIVERS.weightedBandBlend.id),
  analysis.bandBlendFrequencyHz
);
assert.equal(getColorDriver("unknown").id, COLOR_DRIVERS.dominantPeak.id);

console.log("color mapping tests passed");