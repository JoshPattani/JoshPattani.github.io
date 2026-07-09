export class PrecomputedAnalysisSource {
  constructor(frames = []) {
    this.mode = "precomputed";
    this.frames = frames;
    this.isPlaying = false;
    this.metadata = {
      title: "Precomputed analysis",
      artist: "Dataset source",
      duration: null,
      detail: "Reserved for approved pre-rendered analysis data",
    };
  }

  async load() {
    // Future dataset support can hydrate FFT/color frames here without audio.
  }

  async play() {
    this.isPlaying = true;
  }

  async pause() {
    this.isPlaying = false;
  }

  async stop() {
    this.isPlaying = false;
  }

  async destroy() {
    this.isPlaying = false;
  }
}
