import { DEFAULT_MAPPING_MODE, mapFrequencyToColor } from "../color/colorMapping.js";

export const COLOR_DRIVERS = {
  dominantPeak: {
    id: "dominant-peak",
    label: "Dominant Peak",
  },
  spectralCentroid: {
    id: "spectral-centroid",
    label: "Spectral Centroid",
  },
  weightedBandBlend: {
    id: "weighted-band-blend",
    label: "Weighted Band Blend",
  },
};

export const DEFAULT_COLOR_DRIVER = COLOR_DRIVERS.dominantPeak.id;

const BAND_DEFINITIONS = [
  { id: "bass", min: 24, max: 250, center: 96 },
  { id: "lowMid", min: 250, max: 800, center: 450 },
  { id: "mid", min: 800, max: 2500, center: 1350 },
  { id: "presence", min: 2500, max: 6000, center: 3800 },
  { id: "air", min: 6000, max: 16_000, center: 9800 },
];

const SILENCE_THRESHOLDS = {
  peakValue: 8,
  rms: 0.008,
};

export class AudioEngine extends EventTarget {
  constructor(options = {}) {
    super();
    this.fftSize = options.fftSize ?? 2048;
    this.smoothingTimeConstant = options.smoothingTimeConstant ?? 0.84;
    this.volume = options.volume ?? 0.82;
    this.sensitivity = options.sensitivity ?? 1;
    this.colorSmoothing = options.colorSmoothing ?? 0.18;
    this.smoothedColorFrequencyHz = 0;
    this.previousColorDriver = DEFAULT_COLOR_DRIVER;

    this.audioContext = null;
    this.analyser = null;
    this.gainNode = null;
    this.sourceNode = null;
    this.currentSource = null;
    this.frequencyData = null;
    this.timeDomainData = null;
    this.monitorEnabled = true;
  }

  async ensureContext(options = {}) {
    if (!this.audioContext) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) {
        throw new Error("Web Audio API is not supported in this browser.");
      }

      this.audioContext = new AudioContextClass();
      this.analyser = this.audioContext.createAnalyser();
      this.gainNode = this.audioContext.createGain();
      this.gainNode.gain.value = this.volume;
      this.analyser.fftSize = this.fftSize;
      this.analyser.smoothingTimeConstant = this.smoothingTimeConstant;
      this.gainNode.connect(this.audioContext.destination);
      this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
      this.timeDomainData = new Uint8Array(this.analyser.fftSize);
      this.setMonitorOutput(true);
    }

    if (options.resume && this.audioContext.state === "suspended") {
      await this.audioContext.resume();
    }

    return this.audioContext;
  }

  async setSource(source) {
    await this.stop();
    await this.ensureContext({ resume: false });

    if (this.currentSource?.destroy) {
      await this.currentSource.destroy();
    }

    this.currentSource = source;
    await source.load(this);
    this.dispatchState();
  }

  async clearSource() {
    await this.stop();

    if (this.currentSource?.destroy) {
      await this.currentSource.destroy();
    }

    this.disconnectSourceNode();
    this.currentSource = null;
    this.dispatchState();
  }

  connectSourceNode(node, options = {}) {
    this.disconnectSourceNode();
    this.sourceNode = node;
    this.sourceNode.connect(this.analyser);
    this.setMonitorOutput(options.monitor ?? true);
  }

  disconnectSourceNode() {
    if (!this.sourceNode) return;

    try {
      this.sourceNode.disconnect();
    } catch {
      // Some Web Audio nodes throw if already disconnected.
    }

    this.sourceNode = null;
  }

  setMonitorOutput(enabled) {
    if (!this.analyser || !this.gainNode) return;

    try {
      this.analyser.disconnect();
    } catch {
      // Disconnect is safe to ignore when no output is currently connected.
    }

    if (enabled) {
      this.analyser.connect(this.gainNode);
    }

    this.monitorEnabled = enabled;
  }

  async play() {
    if (!this.currentSource) return;
    await this.ensureContext({ resume: true });
    await this.currentSource.play();
    this.dispatchState();
  }

  async pause() {
    if (!this.currentSource?.pause) return;
    await this.currentSource.pause();
    this.dispatchState();
  }

  async stop() {
    if (!this.currentSource?.stop) return;
    await this.currentSource.stop();
    this.dispatchState();
  }

  setVolume(value) {
    this.volume = clamp01(Number(value));
    if (this.gainNode) {
      this.gainNode.gain.setTargetAtTime(this.volume, this.audioContext.currentTime, 0.015);
    }
  }

  setSmoothing(value) {
    this.smoothingTimeConstant = clamp01(Number(value));
    if (this.analyser) {
      this.analyser.smoothingTimeConstant = this.smoothingTimeConstant;
    }
  }

  setSensitivity(value) {
    this.sensitivity = Math.min(Math.max(Number(value) || 1, 0.35), 2.5);
  }

  setFftSize(value) {
    const nextSize = Number(value);
    if (![1024, 2048, 4096, 8192].includes(nextSize)) return;

    this.fftSize = nextSize;
    if (this.analyser) {
      this.analyser.fftSize = nextSize;
      this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
      this.timeDomainData = new Uint8Array(this.analyser.fftSize);
    }
  }

  getAnalysisFrame(
    mappingMode = DEFAULT_MAPPING_MODE,
    colorDriver = DEFAULT_COLOR_DRIVER
  ) {
    if (!this.analyser || !this.frequencyData || !this.timeDomainData) {
      return createEmptyFrame(mappingMode, colorDriver);
    }

    this.analyser.getByteFrequencyData(this.frequencyData);
    this.analyser.getByteTimeDomainData(this.timeDomainData);

    const frequencyAnalysis = analyzeFrequencyData(
      this.frequencyData,
      this.audioContext.sampleRate,
      this.analyser.fftSize,
      this.sensitivity
    );
    const waveformAnalysis = analyzeWaveform(this.timeDomainData);
    const normalizedDriver = getColorDriver(colorDriver);
    const hasSignal =
      frequencyAnalysis.peakValue >= SILENCE_THRESHOLDS.peakValue ||
      waveformAnalysis.rms >= SILENCE_THRESHOLDS.rms;
    const rawColorFrequencyHz = hasSignal
      ? selectColorDriverFrequency(frequencyAnalysis, normalizedDriver.id)
      : 0;

    if (this.previousColorDriver !== normalizedDriver.id) {
      this.smoothedColorFrequencyHz = rawColorFrequencyHz;
      this.previousColorDriver = normalizedDriver.id;
    }

    const colorFrequencyHz = this.smoothColorFrequency(
      rawColorFrequencyHz,
      hasSignal
    );
    const mappedColor = mapFrequencyToColor(colorFrequencyHz, mappingMode);

    return {
      frequencyData: this.frequencyData,
      timeDomainData: this.timeDomainData,
      sampleRate: this.audioContext.sampleRate,
      fftSize: this.analyser.fftSize,
      source: this.currentSource?.metadata ?? null,
      sourceHints: this.currentSource?.getAnalysisHints?.() ?? null,
      state: this.getState(),
      analysis: {
        ...frequencyAnalysis,
        rms: waveformAnalysis.rms,
        hasSignal,
        colorDriver: normalizedDriver.id,
        colorDriverLabel: normalizedDriver.label,
        rawColorFrequencyHz,
        colorFrequencyHz,
      },
      color: mappedColor,
    };
  }

  smoothColorFrequency(frequencyHz, hasSignal) {
    if (!hasSignal || !frequencyHz) {
      this.smoothedColorFrequencyHz *= 0.72;
      if (this.smoothedColorFrequencyHz < 1) {
        this.smoothedColorFrequencyHz = 0;
      }
      return this.smoothedColorFrequencyHz;
    }

    if (!this.smoothedColorFrequencyHz) {
      this.smoothedColorFrequencyHz = frequencyHz;
      return this.smoothedColorFrequencyHz;
    }

    const currentLog = Math.log(Math.max(1, this.smoothedColorFrequencyHz));
    const targetLog = Math.log(Math.max(1, frequencyHz));
    this.smoothedColorFrequencyHz = Math.exp(
      currentLog + (targetLog - currentLog) * this.colorSmoothing
    );
    return this.smoothedColorFrequencyHz;
  }

  getState() {
    return {
      hasContext: Boolean(this.audioContext),
      sourceMode: this.currentSource?.mode ?? "none",
      sourceLabel: this.currentSource?.metadata?.title ?? "No source",
      isPlaying: Boolean(this.currentSource?.isPlaying),
      monitorEnabled: this.monitorEnabled,
      volume: this.volume,
      smoothing: this.smoothingTimeConstant,
      sensitivity: this.sensitivity,
      fftSize: this.fftSize,
    };
  }

  dispatchState() {
    this.dispatchEvent(new CustomEvent("statechange", { detail: this.getState() }));
  }
}

export function analyzeFrequencyData(
  frequencyData,
  sampleRate,
  fftSize,
  sensitivity = 1
) {
  const binWidth = sampleRate / fftSize;
  const minFrequency = 24;
  const maxFrequency = 16_000;
  const minBin = Math.max(1, Math.floor(minFrequency / binWidth));
  const maxBin = Math.min(
    frequencyData.length - 1,
    Math.ceil(maxFrequency / binWidth)
  );

  let peakBin = minBin;
  let peakValue = 0;
  let weightedFrequency = 0;
  let totalWeight = 0;
  let energy = 0;
  const bands = BAND_DEFINITIONS.map((band) => ({
    ...band,
    energy: 0,
    weight: 0,
    bins: 0,
  }));

  for (let bin = minBin; bin <= maxBin; bin += 1) {
    const value = frequencyData[bin];
    const frequencyHz = bin * binWidth;
    const normalized = value / 255;
    const weighted = Math.pow(Math.max(0, normalized - 0.025), 1.15);

    energy += normalized;
    weightedFrequency += frequencyHz * weighted;
    totalWeight += weighted;

    const band = bands.find(
      (candidate) =>
        frequencyHz >= candidate.min && frequencyHz < candidate.max
    );

    if (band) {
      band.energy += normalized;
      band.weight += weighted;
      band.bins += 1;
    }

    if (value > peakValue) {
      peakValue = value;
      peakBin = bin;
    }
  }

  const binCount = Math.max(1, maxBin - minBin + 1);
  const normalizedEnergy = clamp01((energy / binCount) * sensitivity);
  const amplitude = clamp01((peakValue / 255) * sensitivity);
  const dominantFrequencyHz = peakValue < 6 ? 0 : peakBin * binWidth;
  const spectralCentroidHz =
    totalWeight > 0 ? weightedFrequency / totalWeight : dominantFrequencyHz;
  const bandWeightTotal = bands.reduce((sum, band) => sum + band.weight, 0);
  const bandBlendFrequencyHz =
    bandWeightTotal > 0
      ? Math.exp(
          bands.reduce(
            (sum, band) => sum + Math.log(band.center) * band.weight,
            0
          ) / bandWeightTotal
        )
      : spectralCentroidHz;
  const bandLevels = Object.fromEntries(
    bands.map((band) => [
      band.id,
      clamp01((band.energy / Math.max(1, band.bins)) * sensitivity),
    ])
  );

  return {
    dominantFrequencyHz,
    spectralCentroidHz,
    bandBlendFrequencyHz,
    bandLevels,
    peakValue,
    amplitude,
    energy: normalizedEnergy,
    binWidth,
  };
}

export function analyzeWaveform(timeDomainData) {
  let sumSquares = 0;

  for (let index = 0; index < timeDomainData.length; index += 1) {
    const centered = (timeDomainData[index] - 128) / 128;
    sumSquares += centered * centered;
  }

  return {
    rms: Math.sqrt(sumSquares / Math.max(1, timeDomainData.length)),
  };
}

export function getColorDriver(driver) {
  return (
    Object.values(COLOR_DRIVERS).find((candidate) => candidate.id === driver) ??
    COLOR_DRIVERS.dominantPeak
  );
}

export function selectColorDriverFrequency(analysis, driver) {
  if (driver === COLOR_DRIVERS.spectralCentroid.id) {
    return analysis.spectralCentroidHz || 0;
  }

  if (driver === COLOR_DRIVERS.weightedBandBlend.id) {
    return analysis.bandBlendFrequencyHz || 0;
  }

  return analysis.dominantFrequencyHz || 0;
}

function createEmptyFrame(mappingMode, colorDriver = DEFAULT_COLOR_DRIVER) {
  const normalizedDriver = getColorDriver(colorDriver);

  return {
    frequencyData: new Uint8Array(0),
    timeDomainData: new Uint8Array(0),
    sampleRate: 0,
    fftSize: 0,
    source: null,
    sourceHints: null,
    state: {
      hasContext: false,
      sourceMode: "none",
      sourceLabel: "No source",
      isPlaying: false,
      monitorEnabled: false,
      volume: 0,
      smoothing: 0,
      sensitivity: 1,
      fftSize: 0,
    },
    analysis: {
      dominantFrequencyHz: 0,
      spectralCentroidHz: 0,
      bandBlendFrequencyHz: 0,
      bandLevels: {},
      peakValue: 0,
      amplitude: 0,
      energy: 0,
      binWidth: 0,
      rms: 0,
      hasSignal: false,
      colorDriver: normalizedDriver.id,
      colorDriverLabel: normalizedDriver.label,
      rawColorFrequencyHz: 0,
      colorFrequencyHz: 0,
    },
    color: mapFrequencyToColor(0, mappingMode),
  };
}

function clamp01(value) {
  return Math.min(Math.max(Number(value) || 0, 0), 1);
}
