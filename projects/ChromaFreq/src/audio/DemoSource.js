const DEMO_SEQUENCE = [
  82.41,
  110,
  146.83,
  196,
  261.63,
  329.63,
  392,
  523.25,
  659.25,
  880,
  1174.66,
  1567.98,
];

export class DemoSource {
  constructor() {
    this.mode = "demo";
    this.isPlaying = false;
    this.engine = null;
    this.outputNode = null;
    this.oscillators = [];
    this.stepTimer = null;
    this.stepIndex = 0;
    this.metadata = {
      title: "Generated tone study",
      artist: "ChromaFreq synthetic source",
      duration: null,
      detail: "Oscillator sequence, no copyrighted audio asset",
    };
  }

  async load(engine) {
    this.engine = engine;
  }

  async play() {
    if (this.isPlaying || !this.engine) return;

    const { audioContext } = this.engine;
    const primary = audioContext.createOscillator();
    const harmonic = audioContext.createOscillator();
    const toneGain = audioContext.createGain();
    const harmonicGain = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();
    const output = audioContext.createGain();

    primary.type = "sine";
    harmonic.type = "triangle";
    filter.type = "lowpass";
    filter.frequency.value = 2200;
    filter.Q.value = 0.6;
    toneGain.gain.value = 0.15;
    harmonicGain.gain.value = 0.035;
    output.gain.value = 0.85;

    primary.connect(toneGain);
    harmonic.connect(harmonicGain);
    toneGain.connect(filter);
    harmonicGain.connect(filter);
    filter.connect(output);

    this.outputNode = output;
    this.oscillators = [primary, harmonic];
    this.engine.connectSourceNode(output, { monitor: true });

    const now = audioContext.currentTime;
    primary.frequency.setValueAtTime(DEMO_SEQUENCE[0], now);
    harmonic.frequency.setValueAtTime(DEMO_SEQUENCE[0] * 1.5, now);
    primary.start();
    harmonic.start();

    this.stepIndex = 0;
    this.stepTimer = window.setInterval(() => this.advanceSequence(), 760);
    this.isPlaying = true;
  }

  advanceSequence() {
    if (!this.engine || !this.isPlaying) return;

    const { audioContext } = this.engine;
    this.stepIndex = (this.stepIndex + 1) % DEMO_SEQUENCE.length;
    const nextFrequency = DEMO_SEQUENCE[this.stepIndex];
    const now = audioContext.currentTime;
    const [primary, harmonic] = this.oscillators;

    primary.frequency.cancelScheduledValues(now);
    harmonic.frequency.cancelScheduledValues(now);
    primary.frequency.setTargetAtTime(nextFrequency, now, 0.08);
    harmonic.frequency.setTargetAtTime(nextFrequency * 1.5, now, 0.08);
  }

  async pause() {
    await this.stop();
  }

  async stop() {
    if (this.stepTimer) {
      window.clearInterval(this.stepTimer);
      this.stepTimer = null;
    }

    for (const oscillator of this.oscillators) {
      try {
        oscillator.stop();
      } catch {
        // Oscillators can only be stopped once.
      }
    }

    try {
      this.outputNode?.disconnect();
    } catch {
      // Safe to ignore when already disconnected.
    }

    this.engine?.disconnectSourceNode();
    this.outputNode = null;
    this.oscillators = [];
    this.isPlaying = false;
  }

  async destroy() {
    await this.stop();
    this.engine = null;
  }
}
