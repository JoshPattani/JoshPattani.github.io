export class LiveInputSource {
  constructor() {
    this.mode = "live";
    this.isPlaying = false;
    this.engine = null;
    this.stream = null;
    this.mediaNode = null;
    this.metadata = {
      title: "Live input",
      artist: "Microphone",
      duration: null,
      detail: "Analyzes ambient or live sound with permission",
    };
  }

  async load(engine) {
    this.engine = engine;
  }

  async play() {
    if (this.isPlaying || !this.engine) return;

    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error("Microphone input is not supported in this browser.");
    }

    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      },
      video: false,
    });

    this.mediaNode = this.engine.audioContext.createMediaStreamSource(this.stream);
    this.engine.connectSourceNode(this.mediaNode, { monitor: false });
    this.isPlaying = true;
  }

  async pause() {
    await this.stop();
  }

  async stop() {
    this.engine?.disconnectSourceNode();

    if (this.stream) {
      for (const track of this.stream.getTracks()) {
        track.stop();
      }
    }

    this.stream = null;
    this.mediaNode = null;
    this.isPlaying = false;
  }

  async destroy() {
    await this.stop();
    this.engine = null;
  }
}
