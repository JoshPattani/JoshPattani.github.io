import assert from "node:assert/strict";
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

console.log("color mapping tests passed");
