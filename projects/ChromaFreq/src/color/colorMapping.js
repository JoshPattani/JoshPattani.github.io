import { clamp, wavelengthToRgb } from "./wavelengthToRgb.js";

const SPEED_OF_LIGHT_M_PER_SEC = 299_792_458;
const VISIBLE_LIGHT_HZ = {
  redLower: 400_000_000_000_000,
  violetUpper: 800_000_000_000_000,
};

const AUDIO_RANGE_HZ = {
  min: 64,
  max: 16_000,
};

const LOG_WAVELENGTH_RANGE_NM = {
  violet: 400,
  red: 675,
};

export const MAPPING_MODES = {
  perceptualLog: {
    id: "perceptual-log",
    label: "Perceptual Log Mapping",
    description: "Log-spaced audio mapped from bass/red to treble/violet.",
  },
  legacyLinear: {
    id: "legacy-linear-40-octave",
    label: "Legacy Linear / 40-Octave Mapping",
    description: "Original octave scaling from audio frequency into visible light.",
  },
  v1LogRamp: {
    id: "v1-log-ramp",
    label: "V1 Log Ramp",
    description: "Archive log ramp direction preserved from the p5 prototype.",
  },
};

export const DEFAULT_MAPPING_MODE = MAPPING_MODES.perceptualLog.id;

export function mapFrequencyToColor(frequencyHz, mode = DEFAULT_MAPPING_MODE) {
  const normalizedMode = getMappingMode(mode);

  if (!Number.isFinite(frequencyHz) || frequencyHz <= 0) {
    return createMappingResult({
      mode: normalizedMode,
      frequencyHz: 0,
      clampedFrequencyHz: 0,
      wavelengthNm: 0,
      scaledLightFrequencyHz: 0,
      octavesShifted: 0,
      color: { rgb: [0, 0, 0], hex: "#000000", intensityFactor: 0, inRange: false },
      isSilent: true,
    });
  }

  if (normalizedMode.id === MAPPING_MODES.legacyLinear.id) {
    return mapLegacyLinearFrequency(frequencyHz, normalizedMode);
  }

  if (normalizedMode.id === MAPPING_MODES.v1LogRamp.id) {
    return mapV1LogRampFrequency(frequencyHz, normalizedMode);
  }

  return mapPerceptualLogFrequency(frequencyHz, normalizedMode);
}

export function getMappingMode(mode) {
  return (
    Object.values(MAPPING_MODES).find((candidate) => candidate.id === mode) ??
    MAPPING_MODES.perceptualLog
  );
}

function mapPerceptualLogFrequency(frequencyHz, mode) {
  const clampedFrequencyHz = clamp(
    frequencyHz,
    AUDIO_RANGE_HZ.min,
    AUDIO_RANGE_HZ.max
  );
  const normalized =
    Math.log(clampedFrequencyHz / AUDIO_RANGE_HZ.min) /
    Math.log(AUDIO_RANGE_HZ.max / AUDIO_RANGE_HZ.min);
  const eased = Math.pow(clamp(normalized, 0, 1), 0.92);

  // Audio frequency rises as pitch rises. Light frequency also rises, but light
  // wavelength gets shorter as frequency rises, so bass maps toward red and
  // treble maps toward violet in this default V2 mode.
  const wavelengthNm =
    LOG_WAVELENGTH_RANGE_NM.red -
    (LOG_WAVELENGTH_RANGE_NM.red - LOG_WAVELENGTH_RANGE_NM.violet) * eased;

  const color = wavelengthToRgb(wavelengthNm);
  return createMappingResult({
    mode,
    frequencyHz,
    clampedFrequencyHz,
    wavelengthNm,
    scaledLightFrequencyHz: wavelengthToFrequency(wavelengthNm),
    octavesShifted: null,
    color,
  });
}

function mapV1LogRampFrequency(frequencyHz, mode) {
  const clampedFrequencyHz = clamp(
    frequencyHz,
    AUDIO_RANGE_HZ.min,
    AUDIO_RANGE_HZ.max
  );
  const normalized =
    Math.log(clampedFrequencyHz / AUDIO_RANGE_HZ.min) /
    Math.log(AUDIO_RANGE_HZ.max / AUDIO_RANGE_HZ.min);
  const eased = Math.pow(clamp(normalized, 0, 1), Math.E);

  // The p5 prototype's active log path mapped low audio to violet and higher
  // audio toward red. This mode keeps that historical behavior available.
  const wavelengthNm =
    LOG_WAVELENGTH_RANGE_NM.violet +
    (LOG_WAVELENGTH_RANGE_NM.red - LOG_WAVELENGTH_RANGE_NM.violet) * eased;

  const color = wavelengthToRgb(wavelengthNm);
  return createMappingResult({
    mode,
    frequencyHz,
    clampedFrequencyHz,
    wavelengthNm,
    scaledLightFrequencyHz: wavelengthToFrequency(wavelengthNm),
    octavesShifted: null,
    color,
  });
}

function mapLegacyLinearFrequency(frequencyHz, mode) {
  let scaledLightFrequencyHz = Math.abs(frequencyHz);
  let octavesShifted = 0;

  // This preserves the original "resonant color" idea: keep doubling an audio
  // frequency by octaves until it reaches the visible-light frequency band,
  // then convert light frequency to wavelength and RGB.
  while (
    scaledLightFrequencyHz < VISIBLE_LIGHT_HZ.redLower &&
    octavesShifted < 64
  ) {
    scaledLightFrequencyHz *= 2;
    octavesShifted += 1;
  }

  while (
    scaledLightFrequencyHz > VISIBLE_LIGHT_HZ.violetUpper &&
    octavesShifted > -64
  ) {
    scaledLightFrequencyHz /= 2;
    octavesShifted -= 1;
  }

  const wavelengthNm = frequencyToWavelength(scaledLightFrequencyHz);
  const color = wavelengthToRgb(wavelengthNm);

  return createMappingResult({
    mode,
    frequencyHz,
    clampedFrequencyHz: frequencyHz,
    wavelengthNm,
    scaledLightFrequencyHz,
    octavesShifted,
    color,
  });
}

function frequencyToWavelength(frequencyHz) {
  return (SPEED_OF_LIGHT_M_PER_SEC / frequencyHz) * 1e9;
}

function wavelengthToFrequency(wavelengthNm) {
  return SPEED_OF_LIGHT_M_PER_SEC / (wavelengthNm * 1e-9);
}

function createMappingResult({
  mode,
  frequencyHz,
  clampedFrequencyHz,
  wavelengthNm,
  scaledLightFrequencyHz,
  octavesShifted,
  color,
  isSilent = false,
}) {
  return {
    mode: mode.id,
    modeLabel: mode.label,
    frequencyHz,
    clampedFrequencyHz,
    wavelengthNm,
    scaledLightFrequencyHz,
    octavesShifted,
    rgb: color.rgb,
    hex: color.hex,
    intensityFactor: color.intensityFactor,
    inVisibleRange: color.inRange,
    isSilent,
  };
}
