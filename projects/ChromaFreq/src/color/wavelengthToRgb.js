export const VISIBLE_WAVELENGTH_RANGE = {
  min: 350,
  violet: 380,
  blue: 440,
  cyan: 490,
  green: 510,
  yellow: 580,
  red: 645,
  max: 780,
};

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function wavelengthToRgb(wavelengthNm, options = {}) {
  const gamma = options.gamma ?? 0.9;
  const intensityMax = options.intensityMax ?? 255;
  const numericWavelength = Number(wavelengthNm);

  if (!Number.isFinite(numericWavelength)) {
    return createColorResult(0, 0, 0, wavelengthNm, 0, false);
  }

  const clampedWavelength = clamp(
    numericWavelength,
    VISIBLE_WAVELENGTH_RANGE.min,
    VISIBLE_WAVELENGTH_RANGE.max
  );
  const inRange =
    numericWavelength >= VISIBLE_WAVELENGTH_RANGE.min &&
    numericWavelength <= VISIBLE_WAVELENGTH_RANGE.max;

  // Use the closest visible boundary when values fall slightly outside range.
  // The result reports `inRange: false` so callers can expose the safeguard.
  const wl = clampedWavelength;
  let r = 0;
  let g = 0;
  let b = 0;

  if (wl >= 350 && wl < 440) {
    r = -(wl - 440) / (440 - 350);
    g = 0;
    b = 1;
  } else if (wl >= 440 && wl < 490) {
    r = 0;
    g = (wl - 440) / (490 - 440);
    b = 1;
  } else if (wl >= 490 && wl < 510) {
    r = 0;
    g = 1;
    b = -(wl - 510) / (510 - 490);
  } else if (wl >= 510 && wl < 580) {
    r = (wl - 510) / (580 - 510);
    g = 1;
    b = 0;
  } else if (wl >= 580 && wl < 645) {
    r = 1;
    g = -(wl - 645) / (645 - 580);
    b = 0;
  } else if (wl >= 645 && wl <= 780) {
    r = 1;
    g = 0;
    b = 0;
  }

  const factor = getIntensityFactor(wl);
  const red = r === 0 ? 0 : Math.round(intensityMax * Math.pow(r * factor, gamma));
  const green =
    g === 0 ? 0 : Math.round(intensityMax * Math.pow(g * factor, gamma));
  const blue = b === 0 ? 0 : Math.round(intensityMax * Math.pow(b * factor, gamma));

  return createColorResult(red, green, blue, clampedWavelength, factor, inRange);
}

export function getIntensityFactor(wavelengthNm) {
  if (wavelengthNm >= 350 && wavelengthNm < 420) {
    return 0.1 + (0.9 * (wavelengthNm - 350)) / (420 - 350);
  }

  if (wavelengthNm >= 420 && wavelengthNm < 645) {
    return 1;
  }

  if (wavelengthNm >= 645 && wavelengthNm <= 780) {
    return 0.2 + (0.8 * (780 - wavelengthNm)) / (780 - 645);
  }

  return 0;
}

export function rgbToHex(rgb) {
  return `#${rgb
    .map((channel) => clamp(Math.round(channel), 0, 255).toString(16).padStart(2, "0"))
    .join("")}`;
}

export function rgbToCss(rgb, alpha = 1) {
  const [r, g, b] = rgb.map((channel) => clamp(Math.round(channel), 0, 255));
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function createColorResult(r, g, b, wavelengthNm, intensityFactor, inRange) {
  const rgb = [r, g, b].map((channel) => clamp(channel, 0, 255));
  return {
    rgb,
    hex: rgbToHex(rgb),
    wavelengthNm,
    intensityFactor,
    inRange,
  };
}
