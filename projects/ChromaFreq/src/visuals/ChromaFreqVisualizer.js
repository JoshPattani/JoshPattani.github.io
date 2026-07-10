import { rgbToCss } from "../color/wavelengthToRgb.js";
import { SpectrumRenderer } from "./SpectrumRenderer.js";

export const VISUAL_MODES = {
  signalObservatory: {
    id: "signal-observatory",
    label: "Signal Observatory",
  },
  legacySpectrumSweep: {
    id: "legacy-spectrum-sweep",
    label: "Legacy Spectrum Sweep",
  },
  hybridSpectrumField: {
    id: "hybrid-spectrum-field",
    label: "Hybrid Spectrum Field",
  },
};

export const DEFAULT_VISUAL_MODE = VISUAL_MODES.signalObservatory.id;

const SILENT_RGB = [147, 216, 182];

export class ChromaFreqVisualizer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d", { alpha: false });
    this.renderer = new SpectrumRenderer();
    this.pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    this.width = 0;
    this.height = 0;
    this.phase = 0;
    this.smoothedEnergy = 0;
    this.smoothedRgb = [120, 180, 170];
    this.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.canvas);
    this.resize();
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.width = Math.max(320, rect.width);
    this.height = Math.max(300, rect.height);
    this.pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.floor(this.width * this.pixelRatio);
    this.canvas.height = Math.floor(this.height * this.pixelRatio);
    this.ctx.setTransform(this.pixelRatio, 0, 0, this.pixelRatio, 0, 0);
  }

  render(frame, mode = DEFAULT_VISUAL_MODE) {
    const analysis = frame.analysis;
    const targetRgb = frame.color.isSilent ? SILENT_RGB : frame.color.rgb;
    const energy = Math.max(analysis.energy, analysis.rms * 1.7);
    const motionStep = this.reducedMotion ? 0.002 : 0.012 + energy * 0.026;

    this.phase += motionStep;
    this.smoothedEnergy += (energy - this.smoothedEnergy) * 0.1;
    this.smoothedRgb = this.smoothedRgb.map((channel, index) =>
      channel + (targetRgb[index] - channel) * 0.08
    );

    if (mode === VISUAL_MODES.legacySpectrumSweep.id) {
      this.renderLegacySpectrumSweep(frame);
      return;
    }

    if (mode === VISUAL_MODES.hybridSpectrumField.id) {
      this.renderHybridSpectrumField(frame);
      return;
    }

    this.renderSignalObservatory(frame);
  }

  renderSignalObservatory(frame) {
    const ctx = this.ctx;
    const { width, height } = this;

    ctx.clearRect(0, 0, width, height);
    this.drawField(ctx, width, height, this.smoothedRgb, this.smoothedEnergy);
    this.drawAperture(ctx, width, height, this.smoothedRgb, this.smoothedEnergy, frame);

    const spectrumBounds = {
      x: width * 0.07,
      y: height * 0.62,
      width: width * 0.86,
      height: height * 0.25,
    };
    this.renderer.drawReferenceGrid(ctx, spectrumBounds);
    this.renderer.drawSpectrum(ctx, frame.frequencyData, spectrumBounds, {
      color: this.smoothedRgb,
      energy: this.smoothedEnergy,
    });

    const waveformBounds = {
      x: width * 0.09,
      y: height * 0.17,
      width: width * 0.82,
      height: height * 0.22,
    };
    this.renderer.drawWaveform(ctx, frame.timeDomainData, waveformBounds, {
      color: this.smoothedRgb,
      alpha: 0.74,
      lineWidth: 2,
    });
  }

  renderLegacySpectrumSweep(frame) {
    const ctx = this.ctx;
    const { width, height } = this;
    const spectrumBounds = {
      x: width * 0.055,
      y: height * 0.16,
      width: width * 0.89,
      height: height * 0.64,
    };
    const waveformBounds = {
      x: width * 0.075,
      y: height * 0.82,
      width: width * 0.85,
      height: height * 0.09,
    };

    ctx.clearRect(0, 0, width, height);
    this.drawSpectrumBackdrop(ctx, width, height);
    this.renderer.drawVisibleSpectrumField(ctx, spectrumBounds, { alpha: 0.86 });
    this.renderer.drawReferenceGrid(ctx, spectrumBounds);
    this.renderer.drawMappedSpectrumBars(ctx, frame.frequencyData, spectrumBounds, {
      sampleRate: frame.sampleRate,
      fftSize: frame.fftSize,
      mappingMode: frame.color.mode,
      alpha: 0.88,
      bins: 220,
    });
    this.drawFrequencyRail(ctx, spectrumBounds, frame);
    this.renderer.drawSpectrumCursor(
      ctx,
      spectrumBounds,
      frame.color.wavelengthNm,
      {
        color: this.smoothedRgb,
        energy: this.smoothedEnergy,
        label: `${formatWavelength(frame.color.wavelengthNm)} / ${formatCompactFrequency(
          frame.analysis.colorFrequencyHz
        )}`,
      }
    );
    this.renderer.drawWaveform(ctx, frame.timeDomainData, waveformBounds, {
      color: [248, 244, 226],
      alpha: 0.66,
      lineWidth: 1.5,
    });
  }

  renderHybridSpectrumField(frame) {
    const ctx = this.ctx;
    const { width, height } = this;
    const spectrumBounds = {
      x: width * 0.065,
      y: height * 0.55,
      width: width * 0.87,
      height: height * 0.29,
    };
    const waveformBounds = {
      x: width * 0.1,
      y: height * 0.16,
      width: width * 0.8,
      height: height * 0.15,
    };

    ctx.clearRect(0, 0, width, height);
    this.drawField(ctx, width, height, this.smoothedRgb, this.smoothedEnergy * 0.8);
    this.renderer.drawWaveform(ctx, frame.timeDomainData, waveformBounds, {
      color: [248, 244, 226],
      alpha: 0.45,
      lineWidth: 1.5,
    });
    this.drawAperture(ctx, width, height, this.smoothedRgb, this.smoothedEnergy, frame);
    this.renderer.drawVisibleSpectrumField(ctx, spectrumBounds, { alpha: 0.62 });
    this.renderer.drawMappedSpectrumBars(ctx, frame.frequencyData, spectrumBounds, {
      sampleRate: frame.sampleRate,
      fftSize: frame.fftSize,
      mappingMode: frame.color.mode,
      alpha: 0.7,
      bins: 180,
    });
    this.renderer.drawSpectrumCursor(
      ctx,
      spectrumBounds,
      frame.color.wavelengthNm,
      {
        color: this.smoothedRgb,
        energy: this.smoothedEnergy,
        label: formatWavelength(frame.color.wavelengthNm),
      }
    );
  }

  drawField(ctx, width, height, rgb, energy) {
    ctx.save();
    ctx.fillStyle = "#060706";
    ctx.fillRect(0, 0, width, height);

    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "rgba(236, 225, 195, 0.035)");
    gradient.addColorStop(0.45, rgbToCss(rgb, 0.06 + energy * 0.1));
    gradient.addColorStop(1, "rgba(245, 126, 87, 0.035)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = "rgba(242, 239, 230, 0.045)";
    ctx.lineWidth = 1;
    const spacing = 42;
    const offset = (this.phase * 24) % spacing;

    for (let x = -spacing + offset; x < width + spacing; x += spacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + height * 0.24, height);
      ctx.stroke();
    }

    ctx.restore();
  }

  drawSpectrumBackdrop(ctx, width, height) {
    ctx.save();
    ctx.fillStyle = "#050605";
    ctx.fillRect(0, 0, width, height);

    const gradient = ctx.createRadialGradient(
      width * 0.5,
      height * 0.46,
      0,
      width * 0.5,
      height * 0.46,
      Math.max(width, height) * 0.72
    );
    gradient.addColorStop(0, "rgba(248, 244, 226, 0.05)");
    gradient.addColorStop(0.6, "rgba(0, 0, 0, 0.12)");
    gradient.addColorStop(1, "rgba(0, 0, 0, 0.66)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = "rgba(248, 244, 226, 0.05)";
    ctx.lineWidth = 1;
    const rowGap = 34;
    for (let y = height * 0.12; y < height * 0.93; y += rowGap) {
      ctx.beginPath();
      ctx.moveTo(width * 0.04, y);
      ctx.lineTo(width * 0.96, y);
      ctx.stroke();
    }

    ctx.restore();
  }

  drawFrequencyRail(ctx, bounds, frame) {
    const { x, y, width, height } = bounds;
    const progress = frame.sourceHints?.sweepProgress ?? null;

    if (!Number.isFinite(progress)) return;

    ctx.save();
    ctx.fillStyle = "rgba(248, 244, 226, 0.42)";
    ctx.fillRect(x, y + height + 16, width, 1);
    ctx.fillStyle = rgbToCss(this.smoothedRgb, 0.95);
    ctx.beginPath();
    ctx.arc(x + progress * width, y + height + 16, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawAperture(ctx, width, height, rgb, energy, frame) {
    const centerX = width / 2;
    const centerY = height * 0.42;
    const baseRadius = Math.min(width, height) * 0.16;
    const pulse = baseRadius * (0.2 + energy * 0.85);
    const radius = baseRadius + pulse;
    const wavelength = frame.color.wavelengthNm || 0;
    const ringCount = 5;

    ctx.save();
    ctx.globalCompositeOperation = "lighter";

    const glow = ctx.createRadialGradient(
      centerX,
      centerY,
      0,
      centerX,
      centerY,
      radius * 2.2
    );
    glow.addColorStop(0, rgbToCss(rgb, 0.34 + energy * 0.2));
    glow.addColorStop(0.45, rgbToCss(rgb, 0.12));
    glow.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 2.2, 0, Math.PI * 2);
    ctx.fill();

    for (let index = 0; index < ringCount; index += 1) {
      const ringRadius =
        baseRadius * (0.58 + index * 0.33) +
        Math.sin(this.phase * 4 + index) * (6 + energy * 12);
      const alpha = 0.18 + energy * 0.18 - index * 0.018;

      ctx.strokeStyle = rgbToCss(rgb, Math.max(0.04, alpha));
      ctx.lineWidth = Math.max(1, 3 - index * 0.35);
      ctx.beginPath();
      ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
      ctx.stroke();
    }

    const sweepAngle = ((wavelength % 780) / 780) * Math.PI * 2 + this.phase;
    ctx.strokeStyle = "rgba(246, 238, 210, 0.72)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.72, sweepAngle, sweepAngle + Math.PI * 0.8);
    ctx.stroke();

    ctx.restore();
  }

  downloadSnapshot(filename = "chromafreq-snapshot.png") {
    const link = document.createElement("a");
    link.href = this.canvas.toDataURL("image/png");
    link.download = filename;
    link.click();
  }

  destroy() {
    this.resizeObserver.disconnect();
  }
}

function formatWavelength(wavelengthNm) {
  if (!Number.isFinite(wavelengthNm) || wavelengthNm <= 0) return "0 nm";
  return `${wavelengthNm.toFixed(1)} nm`;
}

function formatCompactFrequency(frequencyHz) {
  if (!Number.isFinite(frequencyHz) || frequencyHz <= 0) return "0 Hz";
  if (frequencyHz >= 1000) return `${(frequencyHz / 1000).toFixed(1)} kHz`;
  return `${Math.round(frequencyHz)} Hz`;
}
