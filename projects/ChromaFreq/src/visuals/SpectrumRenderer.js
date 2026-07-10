import { DEFAULT_MAPPING_MODE, mapFrequencyToColor } from "../color/colorMapping.js";
import {
  clamp,
  rgbToCss,
  VISIBLE_WAVELENGTH_RANGE,
  wavelengthToRgb,
} from "../color/wavelengthToRgb.js";

export class SpectrumRenderer {
  drawSpectrum(ctx, frequencyData, bounds, options = {}) {
    if (!frequencyData?.length) return;

    const { x, y, width, height } = bounds;
    const bins = Math.min(144, frequencyData.length);
    const binStep = Math.max(1, Math.floor(frequencyData.length / bins));
    const gap = 2;
    const barWidth = Math.max(1, width / bins - gap);
    const color = options.color ?? [255, 255, 255];
    const energy = options.energy ?? 0;

    ctx.save();
    ctx.globalCompositeOperation = "lighter";

    for (let index = 0; index < bins; index += 1) {
      const start = index * binStep;
      let sum = 0;

      for (let offset = 0; offset < binStep; offset += 1) {
        sum += frequencyData[start + offset] ?? 0;
      }

      const value = sum / binStep / 255;
      const eased = Math.pow(value, 1.2);
      const barHeight = Math.max(1, eased * height);
      const barX = x + index * (barWidth + gap);
      const barY = y + height - barHeight;

      ctx.fillStyle = rgbToCss(color, 0.22 + 0.58 * eased);
      ctx.fillRect(barX, barY, barWidth, barHeight);

      if (energy > 0.08 && index % 4 === 0) {
        ctx.fillStyle = rgbToCss(color, 0.08 * energy);
        ctx.fillRect(barX, y, barWidth, height);
      }
    }

    ctx.restore();
  }

  drawMappedSpectrumBars(ctx, frequencyData, bounds, options = {}) {
    if (!frequencyData?.length) return;

    const { x, y, width, height } = bounds;
    const sampleRate = options.sampleRate || 44_100;
    const fftSize = options.fftSize || frequencyData.length * 2;
    const binWidth = sampleRate / fftSize;
    const minFrequency = options.minFrequency ?? 24;
    const maxFrequency = options.maxFrequency ?? 16_000;
    const minBin = Math.max(1, Math.floor(minFrequency / binWidth));
    const maxBin = Math.min(
      frequencyData.length - 1,
      Math.ceil(maxFrequency / binWidth)
    );
    const bins = Math.min(options.bins ?? 180, Math.max(1, maxBin - minBin + 1));
    const binStep = Math.max(1, Math.floor((maxBin - minBin + 1) / bins));
    const barWidth = Math.max(1.5, (width / bins) * 0.78);
    const mappingMode = options.mappingMode ?? DEFAULT_MAPPING_MODE;
    const alpha = options.alpha ?? 0.82;

    ctx.save();
    ctx.globalCompositeOperation = "lighter";

    for (let index = 0; index < bins; index += 1) {
      const start = minBin + index * binStep;
      let sum = 0;

      for (let offset = 0; offset < binStep; offset += 1) {
        sum += frequencyData[start + offset] ?? 0;
      }

      const value = sum / binStep / 255;
      const eased = Math.pow(value, 1.35);
      const frequencyHz = (start + binStep / 2) * binWidth;
      const mapped = mapFrequencyToColor(frequencyHz, mappingMode);
      const progress = this.progressForWavelength(mapped.wavelengthNm);
      const barHeight = Math.max(1, eased * height * 0.94);
      const barX = x + progress * width - barWidth / 2;
      const barY = y + height - barHeight;

      ctx.fillStyle = rgbToCss(mapped.rgb, Math.max(0.08, alpha * eased));
      ctx.fillRect(barX, barY, barWidth, barHeight);

      if (eased > 0.22) {
        ctx.fillStyle = rgbToCss(mapped.rgb, 0.08 * eased);
        ctx.fillRect(barX - barWidth, y, barWidth * 3, height);
      }
    }

    ctx.restore();
  }

  drawVisibleSpectrumField(ctx, bounds, options = {}) {
    const { x, y, width, height } = bounds;
    const alpha = options.alpha ?? 0.8;
    const stripCount = Math.max(128, Math.ceil(width / 3));

    ctx.save();

    for (let index = 0; index < stripCount; index += 1) {
      const progress = index / Math.max(1, stripCount - 1);
      const nextProgress = (index + 1) / Math.max(1, stripCount - 1);
      const wavelengthNm = this.wavelengthForProgress(progress);
      const color = wavelengthToRgb(wavelengthNm);
      const stripX = x + progress * width;
      const nextX = x + nextProgress * width;

      ctx.fillStyle = rgbToCss(color.rgb, alpha);
      ctx.fillRect(stripX, y, Math.max(1, nextX - stripX + 1), height);
    }

    const verticalShade = ctx.createLinearGradient(0, y, 0, y + height);
    verticalShade.addColorStop(0, "rgba(0, 0, 0, 0.46)");
    verticalShade.addColorStop(0.42, "rgba(0, 0, 0, 0.08)");
    verticalShade.addColorStop(1, "rgba(0, 0, 0, 0.58)");
    ctx.fillStyle = verticalShade;
    ctx.fillRect(x, y, width, height);

    const sideShade = ctx.createLinearGradient(x, 0, x + width, 0);
    sideShade.addColorStop(0, "rgba(0, 0, 0, 0.42)");
    sideShade.addColorStop(0.12, "rgba(0, 0, 0, 0.02)");
    sideShade.addColorStop(0.88, "rgba(0, 0, 0, 0.02)");
    sideShade.addColorStop(1, "rgba(0, 0, 0, 0.44)");
    ctx.fillStyle = sideShade;
    ctx.fillRect(x, y, width, height);

    this.drawWavelengthScale(ctx, bounds, options);
    ctx.restore();
  }

  drawSpectrumCursor(ctx, bounds, wavelengthNm, options = {}) {
    if (!Number.isFinite(wavelengthNm) || wavelengthNm <= 0) return;

    const { x, y, width, height } = bounds;
    const progress = this.progressForWavelength(wavelengthNm);
    const cursorX = x + progress * width;
    const color = options.color ?? wavelengthToRgb(wavelengthNm).rgb;
    const energy = options.energy ?? 0;
    const label = options.label ?? `${wavelengthNm.toFixed(1)} nm`;

    ctx.save();
    ctx.globalCompositeOperation = "lighter";

    const glow = ctx.createLinearGradient(cursorX - 42, 0, cursorX + 42, 0);
    glow.addColorStop(0, "rgba(0, 0, 0, 0)");
    glow.addColorStop(0.5, rgbToCss(color, 0.16 + energy * 0.24));
    glow.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = glow;
    ctx.fillRect(cursorX - 42, y, 84, height);

    ctx.strokeStyle = "rgba(248, 244, 226, 0.86)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(cursorX, y - 6);
    ctx.lineTo(cursorX, y + height + 6);
    ctx.stroke();

    ctx.fillStyle = rgbToCss(color, 0.88);
    ctx.beginPath();
    ctx.arc(cursorX, y + height * 0.5, 5 + energy * 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalCompositeOperation = "source-over";
    ctx.font = "700 11px Inter, Segoe UI, sans-serif";
    ctx.textAlign = progress > 0.78 ? "right" : "left";
    ctx.textBaseline = "bottom";
    ctx.fillStyle = "rgba(248, 244, 226, 0.86)";
    ctx.fillText(label, cursorX + (progress > 0.78 ? -8 : 8), y - 8);

    ctx.restore();
  }

  drawWaveform(ctx, timeDomainData, bounds, options = {}) {
    if (!timeDomainData?.length) return;

    const { x, y, width, height } = bounds;
    const color = options.color ?? [255, 255, 255];
    const alpha = options.alpha ?? 0.8;

    ctx.save();
    ctx.lineWidth = options.lineWidth ?? 2;
    ctx.strokeStyle = rgbToCss(color, alpha);
    ctx.beginPath();

    for (let index = 0; index < timeDomainData.length; index += 1) {
      const progress = index / Math.max(1, timeDomainData.length - 1);
      const centered = (timeDomainData[index] - 128) / 128;
      const pointX = x + progress * width;
      const pointY = y + height / 2 + centered * (height * 0.42);

      if (index === 0) {
        ctx.moveTo(pointX, pointY);
      } else {
        ctx.lineTo(pointX, pointY);
      }
    }

    ctx.stroke();
    ctx.restore();
  }

  drawReferenceGrid(ctx, bounds) {
    const { x, y, width, height } = bounds;

    ctx.save();
    ctx.strokeStyle = "rgba(239, 234, 220, 0.065)";
    ctx.lineWidth = 1;

    for (let index = 1; index < 6; index += 1) {
      const pointY = y + (height / 6) * index;
      ctx.beginPath();
      ctx.moveTo(x, pointY);
      ctx.lineTo(x + width, pointY);
      ctx.stroke();
    }

    for (let index = 1; index < 8; index += 1) {
      const pointX = x + (width / 8) * index;
      ctx.beginPath();
      ctx.moveTo(pointX, y);
      ctx.lineTo(pointX, y + height);
      ctx.stroke();
    }

    ctx.restore();
  }

  drawWavelengthScale(ctx, bounds) {
    const { x, y, width, height } = bounds;
    const ticks = [780, 645, 580, 510, 440, 380, 350];

    ctx.save();
    ctx.font = "700 10px Inter, Segoe UI, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";

    for (const wavelengthNm of ticks) {
      const progress = this.progressForWavelength(wavelengthNm);
      const pointX = x + progress * width;

      ctx.strokeStyle = "rgba(248, 244, 226, 0.18)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(pointX, y);
      ctx.lineTo(pointX, y + height);
      ctx.stroke();

      ctx.fillStyle = "rgba(248, 244, 226, 0.58)";
      ctx.fillText(`${wavelengthNm} nm`, pointX, y + 8);
    }

    ctx.restore();
  }

  wavelengthForProgress(progress) {
    const normalized = clamp(progress, 0, 1);
    return (
      VISIBLE_WAVELENGTH_RANGE.max -
      normalized * (VISIBLE_WAVELENGTH_RANGE.max - VISIBLE_WAVELENGTH_RANGE.min)
    );
  }

  progressForWavelength(wavelengthNm) {
    const wavelength = clamp(
      wavelengthNm,
      VISIBLE_WAVELENGTH_RANGE.min,
      VISIBLE_WAVELENGTH_RANGE.max
    );
    return (
      (VISIBLE_WAVELENGTH_RANGE.max - wavelength) /
      (VISIBLE_WAVELENGTH_RANGE.max - VISIBLE_WAVELENGTH_RANGE.min)
    );
  }
}
