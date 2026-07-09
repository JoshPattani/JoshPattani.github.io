import { rgbToCss } from "../color/wavelengthToRgb.js";

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
}
