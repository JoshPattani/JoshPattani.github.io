import { DEFAULT_MAPPING_MODE, mapFrequencyToColor } from "../color/colorMapping.js";

export class AudioEngine extends EventTarget {
  constructor(options = {}) {
    super();
    this.fftSize = options.fftSize ?? 2048;
    this.smoothingTimeConstant = options.smoothingTimeConstant ?? 0.84;
    this.volume = options.volume ?? 0.82;
    this.sensitivity = options.sensitivity ?? 1;

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

  getAnalysisFrame(mappingMode = DEFAULT_MAPPING_MODE) {
    if (!this.analyser || !this.frequencyData || !this.timeDomainData) {
      return createEmptyFrame(mappingMode);
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
    const mappedColor = mapFrequencyToColor(
      frequencyAnalysis.dominantFrequencyHz,
      mappingMode
    );

    return {
      frequencyData: this.frequencyData,
      timeDomainData: this.timeDomainData,
      sampleRate: this.audioContext.sampleRate,
      fftSize: this.analyser.fftSize,
      source: this.currentSource?.metadata ?? null,
      state: this.getState(),
      analysis: {
        ...frequencyAnalysis,
        rms: waveformAnalysis.rms,
      },
      color: mappedColor,
    };
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

  for (let bin = minBin; bin <= maxBin; bin += 1) {
    const value = frequencyData[bin];
    const normalized = value / 255;
    const weighted = Math.pow(Math.max(0, normalized - 0.025), 1.15);

    energy += normalized;
    weightedFrequency += bin * binWidth * weighted;
    totalWeight += weighted;

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

  return {
    dominantFrequencyHz,
    spectralCentroidHz,
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

function createEmptyFrame(mappingMode) {
  return {
    frequencyData: new Uint8Array(0),
    timeDomainData: new Uint8Array(0),
    sampleRate: 0,
    fftSize: 0,
    source: null,
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
      peakValue: 0,
      amplitude: 0,
      energy: 0,
      binWidth: 0,
      rms: 0,
    },
    color: mapFrequencyToColor(0, mappingMode),
  };
}

function clamp01(value) {
  return Math.min(Math.max(Number(value) || 0, 0), 1);
}


