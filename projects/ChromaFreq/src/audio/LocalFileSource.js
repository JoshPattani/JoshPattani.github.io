export class LocalFileSource {
  constructor(file) {
    this.file = file;
    this.mode = "local";
    this.isPlaying = false;
    this.buffer = null;
    this.sourceNode = null;
    this.startedAt = 0;
    this.pausedAt = 0;
    this.engine = null;
    this.endingIntentionally = false;
    this.metadata = {
      title: file?.name ?? "Local audio file",
      artist: "User-owned file",
      duration: null,
      detail: file?.type || "Selected from this device",
    };
  }

  async load(engine) {
    if (!this.file) {
      throw new Error("No local file was selected.");
    }

    this.engine = engine;
    const arrayBuffer = await this.file.arrayBuffer();
    this.buffer = await engine.audioContext.decodeAudioData(arrayBuffer.slice(0));
    this.metadata.duration = this.buffer.duration;
  }

  async play() {
    if (this.isPlaying || !this.buffer || !this.engine) return;

    const { audioContext } = this.engine;
    const source = audioContext.createBufferSource();
    source.buffer = this.buffer;
    source.onended = () => {
      if (!this.endingIntentionally) {
        this.isPlaying = false;
        this.pausedAt = 0;
        this.engine.dispatchState();
      }
    };

    this.sourceNode = source;
    this.engine.connectSourceNode(source, { monitor: true });
    this.startedAt = audioContext.currentTime - this.pausedAt;
    this.endingIntentionally = false;
    source.start(0, this.pausedAt);
    this.isPlaying = true;
  }

  async pause() {
    if (!this.isPlaying || !this.sourceNode || !this.engine) return;

    this.pausedAt = this.engine.audioContext.currentTime - this.startedAt;
    this.endingIntentionally = true;
    this.sourceNode.stop();
    this.engine.disconnectSourceNode();
    this.sourceNode = null;
    this.isPlaying = false;
  }

  async stop() {
    if (this.sourceNode) {
      this.endingIntentionally = true;
      try {
        this.sourceNode.stop();
      } catch {
        // The node may already have ended.
      }
    }

    this.engine?.disconnectSourceNode();
    this.sourceNode = null;
    this.pausedAt = 0;
    this.startedAt = 0;
    this.isPlaying = false;
  }

  async destroy() {
    await this.stop();
    this.buffer = null;
    this.engine = null;
  }
}
