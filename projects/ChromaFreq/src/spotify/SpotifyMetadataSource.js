export class SpotifyMetadataSource {
  constructor(config = {}) {
    this.clientId = config.clientId ?? window.CHROMAFREQ_SPOTIFY_CLIENT_ID ?? "";
    this.mode = "spotify";
    this.metadata = {
      title: "Spotify Companion",
      artist: "Metadata only",
      duration: null,
      detail: "Context layer only. ChromaFreq does not analyze Spotify audio.",
    };
  }

  get isConfigured() {
    return Boolean(this.clientId);
  }

  getStatus() {
    if (!this.isConfigured) {
      return {
        available: false,
        message:
          "Spotify companion mode is disabled until OAuth credentials are configured.",
      };
    }

    return {
      available: true,
      message:
        "Spotify can provide metadata and links only. Audio analysis still requires local, demo, live, or precomputed sources.",
    };
  }
}
