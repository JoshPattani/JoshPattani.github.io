const SWEEP_START_HZ = 40;
const SWEEP_END_HZ = 16_000;
const SWEEP_DURATION_SECONDS = 18;
const SWEEP_RESET_FADE_SECONDS = 0.18;

export class DemoSource {
  constructor() {
    this.mode = "demo";
    this.isPlaying = false;
    this.engine = null;
    this.outputNode = null;
    this.oscillator = null;
    this.loopTimer = null;
    this.sweepStartedAt = 0;
    this.metadata = {
      title: "Reference Sine Sweep",
      artist: "ChromaFreq generated source",
      duration: SWEEP_DURATION_SECONDS,
      detail: "Log sweep from 40 Hz to 16 kHz, generated in-browser",
    };
  }

  async load(engine) {
    this.engine = engine;
  }

  async play() {
    if (this.isPlaying || !this.engine) return;

    const { audioContext } = this.engine;
    const oscillator = audioContext.createOscillator();
    const filter = audioContext.createBiquadFilter();
    const toneGain = audioContext.createGain();
    const output = audioContext.createGain();

    oscillator.type = "sine";
    filter.type = "lowpass";
    filter.frequency.value = SWEEP_END_HZ;
    filter.Q.value = 0.2;
    toneGain.gain.value = 0.22;
    output.gain.value = 0.001;

    oscillator.connect(toneGain);
    toneGain.connect(filter);
    filter.connect(output);

    this.outputNode = output;
    this.oscillator = oscillator;
    this.engine.connectSourceNode(output, { monitor: true });

    this.scheduleSweep(audioContext.currentTime + 0.025);
    oscillator.start();
    this.isPlaying = true;
  }

  scheduleSweep(startTime) {
    if (!this.engine || !this.oscillator || !this.outputNode) return;

    const { audioContext } = this.engine;
    const safeStart = Math.max(startTime, audioContext.currentTime + 0.01);
    const endTime = safeStart + SWEEP_DURATION_SECONDS;
    const fadeOutTime = Math.max(
      safeStart + SWEEP_RESET_FADE_SECONDS,
      endTime - SWEEP_RESET_FADE_SECONDS
    );

    this.sweepStartedAt = safeStart;

    this.oscillator.frequency.cancelScheduledValues(safeStart);
    this.oscillator.frequency.setValueAtTime(SWEEP_START_HZ, safeStart);
    this.oscillator.frequency.exponentialRampToValueAtTime(
      SWEEP_END_HZ,
      endTime
    );

    this.outputNode.gain.cancelScheduledValues(safeStart);
    this.outputNode.gain.setValueAtTime(0.001, safeStart);
    this.outputNode.gain.linearRampToValueAtTime(0.85, safeStart + SWEEP_RESET_FADE_SECONDS);
    this.outputNode.gain.setValueAtTime(0.85, fadeOutTime);
    this.outputNode.gain.linearRampToValueAtTime(0.001, endTime);

    if (this.loopTimer) {
      window.clearTimeout(this.loopTimer);
    }

    this.loopTimer = window.setTimeout(() => {
      this.scheduleSweep(this.engine.audioContext.currentTime + 0.03);
    }, SWEEP_DURATION_SECONDS * 1000);
  }

  getAnalysisHints() {
    if (!this.isPlaying || !this.engine?.audioContext || !this.sweepStartedAt) {
      return {
        sweepStartHz: SWEEP_START_HZ,
        sweepEndHz: SWEEP_END_HZ,
        sweepFrequencyHz: 0,
        sweepProgress: 0,
      };
    }

    const elapsed = Math.max(
      0,
      this.engine.audioContext.currentTime - this.sweepStartedAt
    );
    const progress = Math.min(elapsed / SWEEP_DURATION_SECONDS, 1);
    const sweepFrequencyHz =
      SWEEP_START_HZ * Math.pow(SWEEP_END_HZ / SWEEP_START_HZ, progress);

    return {
      sweepStartHz: SWEEP_START_HZ,
      sweepEndHz: SWEEP_END_HZ,
      sweepFrequencyHz,
      sweepProgress: progress,
    };
  }

  async pause() {
    await this.stop();
  }

  async stop() {
    if (this.loopTimer) {
      window.clearTimeout(this.loopTimer);
      this.loopTimer = null;
    }

    try {
      this.outputNode?.gain.cancelScheduledValues(this.engine?.audioContext?.currentTime ?? 0);
    } catch {
      // Safe to ignore when the context is gone.
    }

    try {
      this.oscillator?.stop();
    } catch {
      // Oscillators can only be stopped once.
    }

    try {
      this.outputNode?.disconnect();
    } catch {
      // Safe to ignore when already disconnected.
    }

    this.engine?.disconnectSourceNode();
    this.outputNode = null;
    this.oscillator = null;
    this.sweepStartedAt = 0;
    this.isPlaying = false;
  }

  async destroy() {
    await this.stop();
    this.engine = null;
  }
}
